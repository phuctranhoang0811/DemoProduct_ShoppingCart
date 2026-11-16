<?php

namespace Tests\Feature;

use App\Models\CommissionTransaction;
use App\Models\HellobeeMember;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Checkout\OrderService;
use App\Services\Payments\PaymentGateway;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\FakeGateway;
use Tests\TestCase;

/**
 * The tree used here: Owner (HBEE01) -> A -> B -> C -> D.
 * A sale earns its seller 10% and every member above the seller 1%.
 */
class UplineCommissionTest extends TestCase
{
    use RefreshDatabase;

    private HellobeeMember $owner;

    /** @var array<string, HellobeeMember> */
    private array $chain = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(StoreSeeder::class);
        $this->app->instance(PaymentGateway::class, new FakeGateway);

        $this->owner = HellobeeMember::where('referral_code', 'HBEE01')->sole();

        $parent = $this->owner;
        foreach (['A', 'B', 'C', 'D'] as $name) {
            $parent = $this->chain[$name] = HellobeeMember::create([
                'public_id' => 'chain-'.Str::lower($name),
                'name' => "Member {$name}",
                'email' => Str::lower($name).'@chain.test',
                'role' => 'EMPLOYEE',
                'referral_code' => "HB-CHAIN-{$name}",
                'referred_by_id' => $parent->id,
                'owner_id' => $this->owner->id,
            ]);
        }
    }

    /** Places and pays an order for the $1,500 system, credited to the given code. */
    private function paidSale(string $referralCode): Order
    {
        $product = Product::where('public_id', 'hellobee-filter-1500')->sole();

        $number = $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => $product->public_id, 'size' => $product->sizes()->first()->label, 'quantity' => 1]],
            'customer' => ['name' => 'Buyer', 'email' => Str::random(8).'@buyer.test', 'phone' => '+1 (555) 349-8201'],
            'shipping_address' => ['street' => '1 Main St', 'city' => 'Austin'],
            'payment_method' => 'cod',
            'referral_code' => $referralCode,
            'idempotency_key' => (string) Str::uuid(),
        ])->assertCreated()->json('order.number');

        $order = Order::where('number', $number)->sole();
        app(OrderService::class)->markPaid($order);

        return $order;
    }

    /** @return array<string, string> beneficiary name => "type amount" */
    private function payouts(Order $order): array
    {
        return CommissionTransaction::where('order_id', $order->id)
            ->with('beneficiary')
            ->orderBy('id')
            ->get()
            ->mapWithKeys(fn (CommissionTransaction $c) => [$c->beneficiary->name => "{$c->commission_type} {$c->amount}"])
            ->all();
    }

    public function test_the_owners_own_sale_pays_ten_percent_and_nothing_else(): void
    {
        $this->assertSame(
            [$this->owner->name => 'DIRECT_10_PERCENT 150.00'],
            $this->payouts($this->paidSale('HBEE01')),
        );
    }

    public function test_a_first_level_sale_pays_the_seller_and_the_owner(): void
    {
        $this->assertSame([
            'Member A' => 'DIRECT_10_PERCENT 150.00',
            $this->owner->name => 'OWNER_OVERRIDE_1_PERCENT 15.00',
        ], $this->payouts($this->paidSale('HB-CHAIN-A')));
    }

    public function test_a_second_level_sale_also_pays_the_member_in_between(): void
    {
        $this->assertSame([
            'Member B' => 'DIRECT_10_PERCENT 150.00',
            'Member A' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            $this->owner->name => 'OWNER_OVERRIDE_1_PERCENT 15.00',
        ], $this->payouts($this->paidSale('HB-CHAIN-B')));
    }

    public function test_every_level_above_the_seller_earns_one_percent(): void
    {
        $before = [
            'A' => $this->chain['A']->available_balance,
            'owner' => $this->owner->available_balance,
            'ownerVolume' => $this->owner->network_sales_volume,
        ];

        $order = $this->paidSale('HB-CHAIN-D');

        $this->assertSame([
            'Member D' => 'DIRECT_10_PERCENT 150.00',
            'Member C' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            'Member B' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            'Member A' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            $this->owner->name => 'OWNER_OVERRIDE_1_PERCENT 15.00',
        ], $this->payouts($order));

        // 10% + 4 x 1% of $1,500.
        $this->assertEqualsWithDelta(210.00, (float) CommissionTransaction::where('order_id', $order->id)->sum('amount'), 0.001);
        $this->assertSame(bcadd($before['A'], '15.00', 2), $this->chain['A']->fresh()->available_balance);
        $this->assertSame(bcadd($before['owner'], '15.00', 2), $this->owner->fresh()->available_balance);
        $this->assertSame(bcadd($before['ownerVolume'], '1500.00', 2), $this->owner->fresh()->network_sales_volume);

        // Only the seller's own sales count towards their rank.
        $this->assertSame(1, $this->chain['D']->fresh()->valid_orders_count);
        $this->assertSame(0, $this->chain['A']->fresh()->valid_orders_count);
    }

    public function test_confirming_payment_twice_does_not_pay_the_upline_twice(): void
    {
        $order = $this->paidSale('HB-CHAIN-C');
        app(OrderService::class)->markPaid($order);

        $this->assertSame(4, CommissionTransaction::where('order_id', $order->id)->count());
    }

    public function test_a_deactivated_member_is_skipped_but_those_above_still_earn(): void
    {
        $this->chain['B']->update(['is_active' => false]);

        $this->assertSame([
            'Member D' => 'DIRECT_10_PERCENT 150.00',
            'Member C' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            'Member A' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            $this->owner->name => 'OWNER_OVERRIDE_1_PERCENT 15.00',
        ], $this->payouts($this->paidSale('HB-CHAIN-D')));
    }

    public function test_the_owner_is_paid_even_when_the_introductions_do_not_lead_to_them(): void
    {
        $this->chain['A']->update(['referred_by_id' => null]);

        $this->assertSame([
            'Member B' => 'DIRECT_10_PERCENT 150.00',
            'Member A' => 'UPLINE_OVERRIDE_1_PERCENT 15.00',
            $this->owner->name => 'OWNER_OVERRIDE_1_PERCENT 15.00',
        ], $this->payouts($this->paidSale('HB-CHAIN-B')));
    }

    public function test_a_loop_in_the_tree_cannot_pay_anyone_twice_or_run_forever(): void
    {
        $this->chain['A']->update(['referred_by_id' => $this->chain['C']->id]);

        $payouts = $this->payouts($this->paidSale('HB-CHAIN-C'));

        $this->assertSame('DIRECT_10_PERCENT 150.00', $payouts['Member C']);
        $this->assertSame('UPLINE_OVERRIDE_1_PERCENT 15.00', $payouts['Member B']);
        $this->assertSame('UPLINE_OVERRIDE_1_PERCENT 15.00', $payouts['Member A']);
        $this->assertSame('OWNER_OVERRIDE_1_PERCENT 15.00', $payouts[$this->owner->name]);
        $this->assertCount(4, $payouts);
    }

    public function test_the_number_of_paid_levels_can_be_capped(): void
    {
        config(['services.hellobee.max_upline_levels' => 2]);

        $payouts = $this->payouts($this->paidSale('HB-CHAIN-D'));

        $this->assertArrayHasKey('Member C', $payouts);
        $this->assertArrayHasKey('Member B', $payouts);
        $this->assertArrayNotHasKey('Member A', $payouts);
        // The owner's 1% is not subject to the cap.
        $this->assertSame('OWNER_OVERRIDE_1_PERCENT 15.00', $payouts[$this->owner->name]);
    }

    public function test_a_refund_takes_the_money_back_from_every_level(): void
    {
        $balances = fn () => [
            $this->chain['C']->fresh()->available_balance,
            $this->chain['B']->fresh()->available_balance,
            $this->chain['A']->fresh()->available_balance,
            $this->owner->fresh()->available_balance,
        ];
        $before = $balances();

        $order = $this->paidSale('HB-CHAIN-C');
        $this->assertNotSame($before, $balances());

        app(OrderService::class)->refund($order);

        $this->assertSame($before, $balances());
        $this->assertSame(4, CommissionTransaction::where('order_id', $order->id)->where('status', 'REVOKED')->count());
    }

    public function test_a_new_consultant_joins_under_their_sponsor_and_extends_the_chain(): void
    {
        $buyer = User::where('email', 'customer@example.com')->sole();
        $product = Product::where('public_id', 'hellobee-filter-1500')->sole();

        $number = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/orders', [
            'items' => [['product_id' => $product->public_id, 'size' => $product->sizes()->first()->label, 'quantity' => 1]],
            'customer' => ['name' => $buyer->name, 'email' => $buyer->email, 'phone' => '+1 (555) 349-8201'],
            'shipping_address' => ['street' => '1 Main St', 'city' => 'Austin'],
            'payment_method' => 'cod',
            'referral_code' => 'HB-CHAIN-D',
            'idempotency_key' => (string) Str::uuid(),
        ])->assertCreated()->json('order.number');
        $this->app['auth']->forgetGuards();
        app(OrderService::class)->markPaid(Order::where('number', $number)->sole());

        $newMember = $buyer->fresh()->hellobeeMember;
        // The seeded members hold HBEE01 to HBEE05, so the next person to join gets HBEE06.
        $this->assertSame('HBEE06', $newMember->referral_code);
        $this->assertSame($this->chain['D']->id, $newMember->referred_by_id);
        $this->assertSame($this->owner->id, $newMember->owner_id);

        // Their first sale now pays five levels above them.
        $payouts = $this->payouts($this->paidSale($newMember->referral_code));
        $this->assertSame('DIRECT_10_PERCENT 150.00', $payouts[$newMember->name]);
        $this->assertCount(6, $payouts);
        $this->assertSame('UPLINE_OVERRIDE_1_PERCENT 15.00', $payouts['Member A']);
    }

    public function test_a_member_sees_their_whole_downline_but_nobody_elses_money(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['role' => 'employee'])->save();
        $this->chain['B']->update(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/hellobee/network')->assertOk();
        $ids = $response->json('members.*.id');

        $this->assertEqualsCanonicalizing(['chain-b', 'chain-c', 'chain-d'], $ids);
        $this->assertSame('chain-a', collect($response->json('members'))->firstWhere('id', 'chain-b')['referred_by_id']);

        $downline = collect($response->json('members'))->firstWhere('id', 'chain-d');
        $this->assertNull($downline['available_balance']);
        $this->assertNull($downline['email']);
        $this->assertSame('chain-c', $downline['referred_by_id']);
    }

    public function test_invitation_codes_are_issued_in_joining_order_and_never_reused(): void
    {
        $next = fn () => DB::transaction(fn () => HellobeeMember::nextReferralCode());

        $this->assertSame('HBEE06', $next());
        $this->assertSame('HBEE07', $next());

        // A code typed in by hand moves the sequence past it.
        $this->chain['A']->update(['referral_code' => 'HBEE40']);
        $this->assertSame('HBEE41', $next());

        // Removing the newest member does not free their number.
        $this->chain['A']->update(['referral_code' => 'HB-CHAIN-A']);
        $this->assertSame('HBEE42', $next());

        $this->assertSame('HBEE100', HellobeeMember::formatCode(100));
    }
}
