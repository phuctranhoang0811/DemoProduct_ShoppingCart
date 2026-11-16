<?php

namespace Tests\Feature;

use App\Models\CommissionTransaction;
use App\Models\HellobeeMember;
use App\Models\Order;
use App\Models\PayoutRequest;
use App\Models\Product;
use App\Models\User;
use App\Services\Checkout\OrderService;
use App\Services\Hellobee\CommissionService;
use App\Services\Payments\PaymentGateway;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\FakeGateway;
use Tests\TestCase;

class HellobeeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(StoreSeeder::class);
        $this->app->instance(PaymentGateway::class, new FakeGateway);
    }

    private function member(string $code): HellobeeMember
    {
        return HellobeeMember::where('referral_code', $code)->sole();
    }

    /** Places an order for one unit of a product and returns it (unpaid). */
    private function order(string $productId, ?string $referralCode, ?User $buyer = null, string $email = 'buyer@example.com'): Order
    {
        $product = Product::where('public_id', $productId)->sole();
        if ($buyer) {
            $this->actingAs($buyer, 'sanctum');
        }

        $number = $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => $productId, 'size' => $product->sizes()->first()->label, 'quantity' => 1]],
            'customer' => ['name' => 'Buyer', 'email' => $email, 'phone' => '+1 (555) 349-8201'],
            'shipping_address' => ['street' => '1 Main St', 'city' => 'Austin'],
            'payment_method' => 'cod',
            'referral_code' => $referralCode,
            'idempotency_key' => (string) Str::uuid(),
        ])->assertCreated()->json('order.number');

        $this->app['auth']->forgetGuards();

        return Order::where('number', $number)->sole();
    }

    private function pay(Order $order): void
    {
        app(OrderService::class)->markPaid($order);
    }

    public function test_nothing_is_earned_until_the_order_is_paid(): void
    {
        $before = $this->member('HBEE03')->available_balance;

        $order = $this->order('kangen-k8', 'HBEE03');

        $this->assertSame(0, CommissionTransaction::where('order_id', $order->id)->count());
        $this->assertSame($before, $this->member('HBEE03')->available_balance);
    }

    public function test_an_employee_sale_pays_ten_percent_and_the_owner_one_percent(): void
    {
        $employee = $this->member('HBEE03');
        $owner = $employee->owner;

        $order = $this->order('kangen-k8', 'HBEE03'); // 5,890.00
        $this->pay($order);
        $this->pay($order); // confirming twice must not pay twice

        $direct = CommissionTransaction::where('order_id', $order->id)->where('commission_type', CommissionService::DIRECT)->sole();
        $override = CommissionTransaction::where('order_id', $order->id)->where('commission_type', CommissionService::OVERRIDE)->sole();

        $this->assertSame('589.00', $direct->amount);
        $this->assertSame($employee->id, $direct->beneficiary_id);
        $this->assertSame('58.90', $override->amount);
        $this->assertSame($owner->id, $override->beneficiary_id);

        $after = $employee->fresh();
        $this->assertSame($employee->valid_orders_count + 1, $after->valid_orders_count);
        $this->assertSame(bcadd($employee->available_balance, '589.00', 2), $after->available_balance);
        $this->assertSame(bcadd($employee->personal_sales_volume, '5890.00', 2), $after->personal_sales_volume);
        $this->assertSame(bcadd($owner->available_balance, '58.90', 2), $owner->fresh()->available_balance);
        $this->assertSame($owner->valid_orders_count, $owner->fresh()->valid_orders_count);
    }

    public function test_an_owner_sale_pays_ten_percent_and_no_override(): void
    {
        $order = $this->order('kangen-k8', 'HBEE01');
        $this->pay($order);

        $commissions = CommissionTransaction::where('order_id', $order->id)->get();
        $this->assertCount(1, $commissions);
        $this->assertSame(CommissionService::DIRECT, $commissions[0]->commission_type);
        $this->assertSame('589.00', $commissions[0]->amount);
    }

    public function test_cents_are_rounded_down_and_discounts_reduce_the_base(): void
    {
        $filter = Product::where('slug', 'enagic-filter-hg')->sole(); // 106.00
        $order = $this->order($filter->public_id, 'HBEE03');
        DB::table('orders')->where('id', $order->id)->update(['total' => '105.55', 'discount_amount' => '0.45']);

        $this->pay($order->fresh());

        $amounts = CommissionTransaction::where('order_id', $order->id)->orderBy('id')->pluck('amount')->all();
        $this->assertSame(['10.55', '1.05'], $amounts);
    }

    public function test_employees_are_promoted_by_credited_orders(): void
    {
        $this->assertSame('1A', HellobeeMember::rankFor(4));
        $this->assertSame('2A', HellobeeMember::rankFor(5));
        $this->assertSame('3A', HellobeeMember::rankFor(25));
        $this->assertSame('4A', HellobeeMember::rankFor(125));
        $this->assertSame('5A', HellobeeMember::rankFor(625));

        $employee = $this->member('HBEE05');
        $employee->update(['valid_orders_count' => 4, 'rank' => '1A']);

        $this->pay($this->order('kangen-k8', 'HBEE05'));

        $this->assertSame('2A', $employee->fresh()->rank);
    }

    public function test_buying_with_your_own_code_earns_nothing(): void
    {
        $employee = $this->member('HBEE03');
        $order = $this->order('kangen-k8', 'HBEE03', $employee->user, $employee->email);

        $this->pay($order);

        $this->assertSame(0, CommissionTransaction::where('order_id', $order->id)->count());
    }

    public function test_reversing_an_order_takes_the_commissions_back(): void
    {
        $employee = $this->member('HBEE03');
        $owner = $employee->owner;
        $order = $this->order('kangen-k8', 'HBEE03');
        $this->pay($order);

        app(CommissionService::class)->revokeForOrder($order);
        app(CommissionService::class)->revokeForOrder($order);

        $this->assertSame(2, CommissionTransaction::where('order_id', $order->id)->where('status', 'REVOKED')->count());
        $this->assertSame($employee->available_balance, $employee->fresh()->available_balance);
        $this->assertSame($employee->valid_orders_count, $employee->fresh()->valid_orders_count);
        $this->assertSame($employee->personal_sales_volume, $employee->fresh()->personal_sales_volume);
        $this->assertSame($owner->available_balance, $owner->fresh()->available_balance);
        $this->assertSame($owner->network_sales_volume, $owner->fresh()->network_sales_volume);
    }

    public function test_a_paid_activation_purchase_makes_the_buyer_a_consultant_under_the_sponsor(): void
    {
        $buyer = User::where('email', 'customer@example.com')->sole();
        $sponsor = $this->member('HBEE03');

        $order = $this->order('hellobee-filter-1500', 'HBEE03', $buyer, $buyer->email);
        $this->assertNull($buyer->fresh()->hellobeeMember);

        $this->pay($order);

        $member = $buyer->fresh()->hellobeeMember;
        $this->assertNotNull($member);
        $this->assertSame('EMPLOYEE', $member->role);
        $this->assertTrue($member->has_purchased_filtration_device);
        $this->assertSame($sponsor->id, $member->referred_by_id);
        $this->assertSame($sponsor->owner_id, $member->owner_id);
        $this->assertSame('employee', $buyer->fresh()->role);
        $this->assertSame($sponsor->direct_invite_count + 1, $sponsor->fresh()->direct_invite_count);
        // The sponsor still earns on the activation sale.
        $this->assertSame('150.00', CommissionTransaction::where('order_id', $order->id)->where('beneficiary_id', $sponsor->id)->value('amount'));

        // Other products do not activate anyone.
        $other = User::factory()->create();
        $this->pay($this->order('kangen-k8', null, $other, $other->email));
        $this->assertNull($other->fresh()->hellobeeMember);
        $this->assertSame('customer', $other->fresh()->role);
    }

    public function test_only_admins_can_confirm_offline_payments(): void
    {
        $order = $this->order('kangen-k8', 'HBEE03');
        $employee = $this->member('HBEE03')->user;
        $admin = User::where('role', 'admin')->first();

        $this->postJson("/api/v1/orders/{$order->number}/mark-paid")->assertUnauthorized();
        $this->actingAs($employee, 'sanctum')->postJson("/api/v1/orders/{$order->number}/mark-paid")->assertForbidden();
        $this->assertSame('Unpaid', $order->fresh()->payment_status);

        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/orders/{$order->number}/mark-paid")
            ->assertOk()->assertJsonPath('data.payment_status', 'Paid');
        $this->assertSame(2, CommissionTransaction::where('order_id', $order->id)->count());
    }

    public function test_members_see_only_their_own_slice_of_the_network(): void
    {
        $employee = $this->member('HBEE03');
        $this->pay($this->order('kangen-k8', 'HBEE04'));

        $this->getJson('/api/v1/hellobee/network')->assertUnauthorized();
        $this->actingAs(User::where('email', 'customer@example.com')->sole(), 'sanctum')
            ->getJson('/api/v1/hellobee/network')->assertForbidden();

        $own = $this->actingAs($employee->user, 'sanctum')->getJson('/api/v1/hellobee/network')->assertOk();
        $this->assertSame($employee->public_id, $own->json('self_id'));
        $this->assertSame([$employee->public_id], array_values(array_unique($own->json('commissions.*.beneficiary_id'))));
        $this->assertNotContains('usr_emp_02', $own->json('members.*.id'));
        $this->assertStringNotContainsString('sophia@hellobee.com', $own->getContent());

        $owner = $employee->owner;
        $team = $this->actingAs($owner->user, 'sanctum')->getJson('/api/v1/hellobee/network')->assertOk();
        $this->assertSame(5, count($team->json('members')));
    }

    public function test_payout_requests_reserve_the_balance_and_rejection_returns_it(): void
    {
        $member = $this->member('HBEE03');
        $balance = $member->available_balance;
        $admin = User::where('role', 'admin')->first();
        $payload = ['amount' => 100, 'bank_name' => 'Chase', 'bank_account_number' => '000123456789', 'bank_account_name' => 'David Nguyen'];

        $this->actingAs($member->user, 'sanctum')->postJson('/api/v1/hellobee/payouts', [...$payload, 'amount' => (float) $balance + 1])
            ->assertUnprocessable()->assertJsonValidationErrors('amount');

        $response = $this->actingAs($member->user, 'sanctum')->postJson('/api/v1/hellobee/payouts', $payload)
            ->assertCreated()
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.bank_account_number', '•••• 6789');

        $payout = PayoutRequest::latest('id')->first();
        $this->assertSame(bcsub($balance, '100.00', 2), $member->fresh()->available_balance);
        $this->assertStringNotContainsString('000123456789', (string) DB::table('payout_requests')->where('id', $payout->id)->value('bank_account_number'));
        $this->assertStringNotContainsString('000123456789', $response->getContent());

        $this->actingAs($member->user, 'sanctum')->patchJson("/api/v1/hellobee/payouts/{$payout->id}", ['status' => 'APPROVED'])->assertForbidden();

        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/hellobee/payouts/{$payout->id}", ['status' => 'REJECTED'])
            ->assertOk()->assertJsonPath('data.status', 'REJECTED');
        $this->assertSame($balance, $member->fresh()->available_balance);

        // A decided request cannot be decided again (which would refund twice).
        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/hellobee/payouts/{$payout->id}", ['status' => 'REJECTED'])->assertUnprocessable();
        $this->assertSame($balance, $member->fresh()->available_balance);
    }

    public function test_referral_codes_can_be_checked_publicly(): void
    {
        $this->getJson('/api/v1/referral-codes/hbee03')->assertOk()
            ->assertJsonPath('data.referral_code', 'HBEE03')
            ->assertJsonMissingPath('data.email');
        $this->getJson('/api/v1/referral-codes/HB-NOPE-1')->assertNotFound();
    }
}
