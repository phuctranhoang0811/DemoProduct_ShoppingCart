<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\CommissionTransaction;
use App\Models\Discount;
use App\Models\HellobeeMember;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\TaxCalculation;
use App\Models\User;
use App\Services\Checkout\OrderService;
use App\Services\Payments\PaymentGateway;
use App\Services\StorefrontRevalidator;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\Support\FakeGateway;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $employee;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(StoreSeeder::class);
        $this->app->instance(PaymentGateway::class, new FakeGateway);

        $this->admin = User::where('email', 'owner@hellobee.com')->sole();
        $this->employee = User::where('email', 'employee@hellobee.com')->sole();
        $this->customer = User::where('email', 'customer@example.com')->sole();
    }

    private function signedInAs(User $user): static
    {
        $this->app['auth']->forgetGuards();

        return $this->actingAs($user, 'sanctum');
    }

    private function placeOrder(?string $referralCode = null, int $quantity = 1): Order
    {
        $this->app['auth']->forgetGuards();
        $size = Product::where('public_id', 'kangen-k8')->sole()->sizes()->orderBy('id')->first();

        $number = $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => 'kangen-k8', 'size' => $size->label, 'quantity' => $quantity]],
            'customer' => ['name' => 'Buyer', 'email' => 'buyer@example.com', 'phone' => '+1 (555) 349-8201'],
            'shipping_address' => ['street' => '1 Main St', 'city' => 'Austin'],
            'payment_method' => 'cod',
            'referral_code' => $referralCode,
            'idempotency_key' => (string) Str::uuid(),
        ])->assertCreated()->json('order.number');

        return Order::where('number', $number)->sole();
    }

    private function k8Stock(): int
    {
        return Product::where('public_id', 'kangen-k8')->sole()->sizes()->orderBy('id')->first()->stock;
    }

    public function test_the_back_office_is_closed_to_guests_and_customers(): void
    {
        $routes = [
            ['GET', '/api/v1/admin/products'], ['GET', '/api/v1/admin/orders'], ['GET', '/api/v1/admin/customers'],
            ['GET', '/api/v1/admin/discounts'], ['GET', '/api/v1/admin/reviews'], ['GET', '/api/v1/admin/inventory'],
            ['GET', '/api/v1/admin/settings'], ['GET', '/api/v1/admin/audit-logs'], ['GET', '/api/v1/admin/categories'],
        ];

        foreach ($routes as [$method, $uri]) {
            $this->app['auth']->forgetGuards();
            $this->json($method, $uri)->assertUnauthorized();
            $this->signedInAs($this->customer)->json($method, $uri)->assertForbidden();
        }

        // Staff reach orders only; the rest is for administrators.
        $this->signedInAs($this->employee)->getJson('/api/v1/admin/orders')->assertOk();
        $this->signedInAs($this->employee)->getJson('/api/v1/admin/products')->assertForbidden();
        $this->signedInAs($this->employee)->postJson('/api/v1/admin/products', [])->assertForbidden();
        $this->signedInAs($this->employee)->putJson('/api/v1/admin/settings', ['shipping_fee' => 0])->assertForbidden();
    }

    public function test_an_admin_can_create_edit_and_delete_a_product_and_the_storefront_is_told(): void
    {
        config(['services.storefront.revalidate_url' => 'https://storefront.test/api/revalidate']);
        Http::fake(['storefront.test/*' => Http::response(['revalidated' => true])]);

        $created = $this->signedInAs($this->admin)->postJson('/api/v1/admin/products', [
            'name' => 'Travel Bottle 500ml',
            'sku' => 'TB-500',
            'description' => 'A sturdy bottle for Kangen Water on the go.',
            'price' => 39.5,
            'category_id' => 'cat-bottles',
            'status' => 'draft',
            'images' => ['https://example.com/bottle.png'],
            'colors' => [['name' => 'Clear', 'hex' => '#FFFFFF']],
            'sizes' => [['label' => '500 ml', 'stock' => 12]],
        ])->assertCreated()
            ->assertJsonPath('data.id', 'travel-bottle-500ml')
            ->assertJsonPath('data.slug', 'travel-bottle-500ml')
            ->assertJsonPath('data.price', 39.5)
            ->assertJsonPath('data.sizes.0.stock', 12);

        $id = $created->json('data.id');
        $this->getJson('/api/v1/products/travel-bottle-500ml')->assertNotFound(); // still a draft
        $this->assertSame(12, InventoryMovement::where('product_name', 'Travel Bottle 500ml')->sole()->change);

        $sizeCode = $created->json('data.sizes.0.id');
        $this->signedInAs($this->admin)->putJson("/api/v1/admin/products/{$id}", [
            'status' => 'active',
            'price' => 35,
            'sizes' => [['id' => $sizeCode, 'label' => '500 ml', 'stock' => 9], ['label' => '750 ml', 'stock' => 4]],
        ])->assertOk()->assertJsonPath('data.price', 35)->assertJsonCount(2, 'data.sizes');

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/products/travel-bottle-500ml')->assertOk()->assertJsonPath('data.price', 35);
        $this->assertSame(-3, InventoryMovement::where('product_name', 'Travel Bottle 500ml')->where('variant_info', '500 ml')->latest('id')->first()->change);

        app(StorefrontRevalidator::class)->flush();
        Http::assertSent(fn (HttpRequest $request) => in_array('product:travel-bottle-500ml', $request['tags'], true));

        $this->signedInAs($this->admin)->postJson('/api/v1/admin/products', [
            'name' => 'Dup', 'sku' => 'TB-500', 'description' => 'x', 'price' => 1, 'category_id' => 'cat-bottles',
        ])->assertUnprocessable()->assertJsonValidationErrors('sku');
        $this->signedInAs($this->admin)->putJson("/api/v1/admin/products/{$id}", ['price' => -1])->assertUnprocessable();
        $this->signedInAs($this->admin)->putJson("/api/v1/admin/products/{$id}", ['images' => ['javascript:alert(1)']])->assertUnprocessable();

        $this->signedInAs($this->admin)->deleteJson("/api/v1/admin/products/{$id}")->assertOk();
        $this->assertNull(Product::where('public_id', $id)->first());
        $this->assertSame(['product.created', 'product.updated', 'product.deleted'],
            AuditLog::where('entity_id', $id)->orderBy('id')->pluck('action')->all());
        $this->assertSame($this->admin->id, AuditLog::where('entity_id', $id)->first()->user_id);
    }

    public function test_deleting_a_product_keeps_past_orders_readable(): void
    {
        $order = $this->placeOrder();

        $this->signedInAs($this->admin)->deleteJson('/api/v1/admin/products/kangen-k8')->assertOk();

        $item = $order->items()->sole();
        $this->assertNull($item->product_id);
        $this->assertSame('LeveLuk K8', $item->product_name);
    }

    public function test_categories_with_products_cannot_be_deleted(): void
    {
        $this->signedInAs($this->admin)->deleteJson('/api/v1/admin/categories/cat-ionizers')->assertStatus(422);

        $slug = $this->signedInAs($this->admin)->postJson('/api/v1/admin/categories', ['name' => 'Gift Sets'])
            ->assertCreated()->assertJsonPath('data.slug', 'gift-sets')->json('data.id');
        $this->signedInAs($this->admin)->putJson("/api/v1/admin/categories/{$slug}", ['status' => 'inactive'])->assertOk();

        $this->app['auth']->forgetGuards();
        $this->assertNotContains('gift-sets', $this->getJson('/api/v1/categories')->json('data.*.slug'));
        $this->signedInAs($this->admin)->deleteJson("/api/v1/admin/categories/{$slug}")->assertOk();
    }

    public function test_order_status_moves_forward_and_cancelling_returns_stock(): void
    {
        $stock = $this->k8Stock();
        $order = $this->placeOrder(quantity: 2);

        $this->signedInAs($this->admin)->patchJson("/api/v1/admin/orders/{$order->number}/status", ['status' => 'Processing', 'note' => 'Packing'])
            ->assertOk()->assertJsonPath('data.status', 'Processing');
        $this->signedInAs($this->admin)->patchJson("/api/v1/admin/orders/{$order->number}/status", ['status' => 'Bogus'])->assertUnprocessable();

        $this->signedInAs($this->admin)->patchJson("/api/v1/admin/orders/{$order->number}/status", ['status' => 'Cancelled'])
            ->assertOk()->assertJsonPath('data.status', 'Cancelled');
        $this->assertSame($stock, $this->k8Stock());

        // Reopening would hand out stock that may already be sold again.
        $this->signedInAs($this->admin)->patchJson("/api/v1/admin/orders/{$order->number}/status", ['status' => 'Processing'])->assertUnprocessable();
        $this->signedInAs($this->admin)->postJson("/api/v1/orders/{$order->number}/mark-paid")->assertStatus(422);
        $this->assertSame($stock, $this->k8Stock());
        $this->assertSame(1, AuditLog::where('action', 'order.status_changed')->where('details->to', 'Cancelled')->count());
    }

    public function test_refunding_a_paid_order_takes_back_commissions_once(): void
    {
        $member = HellobeeMember::where('referral_code', 'HB-EMP-101')->sole();
        $order = $this->placeOrder('HB-EMP-101');

        $this->signedInAs($this->admin)->postJson("/api/v1/admin/orders/{$order->number}/refund")->assertUnprocessable(); // not paid yet

        app(OrderService::class)->markPaid($order);
        $this->assertSame(bcadd($member->available_balance, '589.00', 2), $member->fresh()->available_balance);

        $this->signedInAs($this->employee)->postJson("/api/v1/admin/orders/{$order->number}/refund")->assertForbidden();
        $this->signedInAs($this->admin)->postJson("/api/v1/admin/orders/{$order->number}/refund")
            ->assertOk()->assertJsonPath('data.payment_status', 'Refunded');
        $this->signedInAs($this->admin)->postJson("/api/v1/admin/orders/{$order->number}/refund")->assertUnprocessable();

        $this->assertSame($member->available_balance, $member->fresh()->available_balance);
        $this->assertSame(2, CommissionTransaction::where('order_id', $order->id)->where('status', 'REVOKED')->count());
    }

    public function test_staff_only_see_and_move_orders_credited_to_their_own_code(): void
    {
        $mine = $this->placeOrder('HB-EMP-101');
        $theirs = $this->placeOrder('HB-EMP-102');
        $nobody = $this->placeOrder();

        $numbers = $this->signedInAs($this->employee)->getJson('/api/v1/admin/orders')->assertOk()->json('data.*.number');
        $this->assertContains($mine->number, $numbers);
        $this->assertNotContains($theirs->number, $numbers);
        $this->assertNotContains($nobody->number, $numbers);

        $this->signedInAs($this->employee)->patchJson("/api/v1/admin/orders/{$mine->number}/status", ['status' => 'Confirmed'])->assertOk();
        $this->signedInAs($this->employee)->patchJson("/api/v1/admin/orders/{$theirs->number}/status", ['status' => 'Confirmed'])->assertNotFound();
        $this->assertSame('Pending', $theirs->fresh()->status);

        $all = $this->signedInAs($this->admin)->getJson('/api/v1/admin/orders')->json('data.*.number');
        $this->assertContains($theirs->number, $all);
        $this->assertContains($nobody->number, $all);
    }

    public function test_customers_can_be_created_edited_and_suspended(): void
    {
        $list = $this->signedInAs($this->admin)->getJson('/api/v1/admin/customers')->assertOk();
        $this->assertSame(12, count($list->json('data')));
        $this->assertStringNotContainsString('password', $list->getContent());
        $this->assertNotContains('owner@hellobee.com', $list->json('data.*.email'));

        $id = $this->signedInAs($this->admin)->postJson('/api/v1/admin/customers', ['name' => 'New Person', 'email' => 'new@example.com', 'phone' => '+1 (555) 000-1111'])
            ->assertCreated()->json('data.id');

        $token = $this->customer->createToken('storefront')->plainTextToken;
        $this->signedInAs($this->admin)->putJson("/api/v1/admin/customers/{$this->customer->id}", ['status' => 'inactive', 'role' => 'admin'])
            ->assertOk()->assertJsonPath('data.status', 'inactive');

        $this->assertSame('customer', $this->customer->fresh()->role);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();

        // Staff accounts are not editable through the customer screen.
        $this->signedInAs($this->admin)->putJson("/api/v1/admin/customers/{$this->employee->id}", ['status' => 'inactive'])->assertNotFound();
        $this->assertNotNull(User::find($id));
    }

    public function test_discounts_are_validated(): void
    {
        $id = $this->signedInAs($this->admin)->postJson('/api/v1/admin/discounts', [
            'code' => ' spring15 ', 'type' => 'percentage', 'value' => 15, 'min_order_amount' => 50, 'usage_limit' => 10,
        ])->assertCreated()->assertJsonPath('data.code', 'SPRING15')->json('data.id');

        $this->signedInAs($this->admin)->postJson('/api/v1/admin/discounts', ['code' => 'SPRING15', 'type' => 'fixed', 'value' => 5])
            ->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->signedInAs($this->admin)->postJson('/api/v1/admin/discounts', ['code' => 'TOOMUCH', 'type' => 'percentage', 'value' => 150])
            ->assertUnprocessable()->assertJsonValidationErrors('value');

        $this->signedInAs($this->admin)->putJson("/api/v1/admin/discounts/{$id}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->signedInAs($this->admin)->deleteJson("/api/v1/admin/discounts/{$id}")->assertOk();
        $this->assertNull(Discount::find($id));
    }

    public function test_reviews_are_submitted_as_pending_and_count_only_once_approved(): void
    {
        $payload = ['customer_name' => 'Rae', 'customer_email' => 'rae@example.com', 'rating' => 3, 'comment' => 'Works well, a bit loud at night.'];

        $this->postJson('/api/v1/products/enagic-leveluk-k8/reviews', [...$payload, 'status' => 'approved'])->assertCreated();
        $this->postJson('/api/v1/products/enagic-leveluk-k8/reviews', $payload)->assertStatus(429);
        $this->postJson('/api/v1/products/enagic-leveluk-k8/reviews', [...$payload, 'customer_email' => 'x@example.com', 'rating' => 9])->assertUnprocessable();

        $review = Review::where('customer_email', 'rae@example.com')->sole();
        $this->assertSame('pending', $review->status);
        $this->getJson('/api/v1/products/enagic-leveluk-k8')->assertJsonPath('data.rating.count', 2);

        $this->signedInAs($this->admin)->patchJson("/api/v1/admin/reviews/{$review->id}", ['status' => 'approved'])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/products/enagic-leveluk-k8')
            ->assertJsonPath('data.rating.count', 3)
            ->assertJsonPath('data.rating.average', 4.3);

        $this->signedInAs($this->admin)->deleteJson("/api/v1/admin/reviews/{$review->id}")->assertOk();
        $this->assertNull(Review::find($review->id));
    }

    public function test_stock_adjustments_are_logged_and_cannot_go_negative(): void
    {
        $size = Product::where('public_id', 'kangen-k8')->sole()->sizes()->orderBy('id')->first();

        $this->signedInAs($this->admin)->postJson('/api/v1/admin/inventory/adjust', [
            'product_id' => 'kangen-k8', 'size' => $size->label, 'change' => 5, 'reason' => 'Shipment received',
        ])->assertOk()->assertJsonPath('data.stock', $size->stock + 5);

        $this->signedInAs($this->admin)->postJson('/api/v1/admin/inventory/adjust', [
            'product_id' => 'kangen-k8', 'size' => $size->label, 'change' => -1000, 'reason' => 'Oops',
        ])->assertUnprocessable()->assertJsonValidationErrors('change');

        $this->assertSame($size->stock + 5, $this->k8Stock());
        $newest = $this->signedInAs($this->admin)->getJson('/api/v1/admin/inventory')->assertOk()->json('data.0');
        $this->assertSame(5, $newest['change']);
        $this->assertSame('Shipment received', $newest['reason']);
    }

    public function test_settings_changes_apply_to_checkout(): void
    {
        $this->signedInAs($this->admin)->putJson('/api/v1/admin/settings', ['shipping_fee' => 25, 'free_shipping_threshold' => 10000, 'unknown_key' => 'x'])
            ->assertOk()->assertJsonPath('data.shipping_fee', 25);
        $this->assertNull(Setting::find('unknown_key'));

        $order = $this->placeOrder(); // 5,890 is under the free-shipping threshold
        $this->assertSame('25.00', $order->shipping_fee);
        $this->assertSame('5915.00', $order->total);
    }

    public function test_tax_history_is_private_and_encrypted(): void
    {
        $payload = [
            'country' => 'US', 'tax_year' => 2026, 'income_type' => 'W2', 'currency' => 'USD',
            'gross_income' => '120000.00', 'total_tax' => '27000.00', 'net_income' => '93000.00',
            'effective_tax_rate' => '0.2250', 'rule_version' => '2026.1.0-official', 'status' => 'COMPLETED',
            'input_snapshot' => ['annualSalary' => '120000', 'state' => 'CA'],
            'result_snapshot' => ['breakdown' => ['federal' => '18000.00']],
        ];

        $this->app['auth']->forgetGuards();
        $this->postJson('/api/v1/tax/calculations', $payload)->assertUnauthorized();

        $id = $this->signedInAs($this->customer)->postJson('/api/v1/tax/calculations', $payload)
            ->assertCreated()->assertJsonPath('data.input_snapshot.state', 'CA')->json('data.id');

        $this->assertStringNotContainsString('120000', (string) DB::table('tax_calculations')->where('id', $id)->value('input_snapshot'));

        $this->signedInAs($this->customer)->getJson('/api/v1/tax/calculations')->assertOk()->assertJsonCount(1, 'data');
        $this->signedInAs($this->admin)->getJson('/api/v1/tax/calculations')->assertOk()->assertJsonCount(0, 'data');
        $this->signedInAs($this->admin)->getJson("/api/v1/tax/calculations/{$id}")->assertNotFound();
        $this->signedInAs($this->admin)->deleteJson("/api/v1/tax/calculations/{$id}")->assertNotFound();

        $this->signedInAs($this->customer)->deleteJson("/api/v1/tax/calculations/{$id}")->assertOk();
        $this->assertSame(0, TaxCalculation::count());
    }

    public function test_the_audit_trail_can_be_read_and_written_by_admins_only(): void
    {
        $this->signedInAs($this->employee)->postJson('/api/v1/admin/audit-logs', ['action' => 'CREATE_RULE', 'entity_type' => 'TaxRuleSet'])->assertForbidden();

        $this->signedInAs($this->admin)->postJson('/api/v1/admin/audit-logs', [
            'action' => 'PUBLISH_RULE', 'entity_type' => 'TaxRuleSet', 'entity_id' => 'rule_1', 'details' => ['taxYear' => 2026],
        ])->assertCreated();

        $this->signedInAs($this->admin)->getJson('/api/v1/admin/audit-logs')
            ->assertOk()
            ->assertJsonPath('data.0.action', 'PUBLISH_RULE')
            ->assertJsonPath('data.0.user.email', 'owner@hellobee.com')
            ->assertJsonPath('data.0.details.taxYear', 2026);
    }
}
