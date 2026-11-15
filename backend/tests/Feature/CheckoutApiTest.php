<?php

namespace Tests\Feature;

use App\Models\Discount;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\User;
use App\Services\Payments\PaymentGateway;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\Support\FakeGateway;
use Tests\TestCase;

class CheckoutApiTest extends TestCase
{
    use RefreshDatabase;

    private const WEBHOOK_SECRET = 'whsec_test_secret';

    private FakeGateway $gateway;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(StoreSeeder::class);
        $this->gateway = new FakeGateway;
        $this->app->instance(PaymentGateway::class, $this->gateway);
        config(['services.stripe.webhook_secret' => self::WEBHOOK_SECRET]);
    }

    private function k8Size(): ProductSize
    {
        return Product::where('public_id', 'kangen-k8')->sole()->sizes()->orderBy('id')->first();
    }

    /** @param  array<string, mixed>  $overrides */
    private function payload(array $overrides = []): array
    {
        return array_replace_recursive([
            'items' => [['product_id' => 'kangen-k8', 'size' => $this->k8Size()->label, 'quantity' => 2]],
            'customer' => ['name' => 'Jane Doe', 'email' => 'Jane@Example.com', 'phone' => '+1 (555) 349-8201'],
            'shipping_address' => ['street' => '1 Main St', 'city' => 'Austin'],
            'payment_method' => 'cod',
            'idempotency_key' => (string) Str::uuid(),
        ], $overrides);
    }

    /** @param  array<string, mixed>  $overrides */
    private function placeOrder(array $overrides = []): TestResponse
    {
        return $this->postJson('/api/v1/orders', $this->payload($overrides));
    }

    private function webhook(string $type, Order $order, array $session = [], ?string $secret = null): TestResponse
    {
        $payload = json_encode([
            'id' => 'evt_'.Str::random(12),
            'object' => 'event',
            'type' => $type,
            'data' => ['object' => [
                'id' => $order->stripe_session_id,
                'object' => 'checkout.session',
                'payment_status' => 'paid',
                'amount_total' => (int) round((float) $order->total * 100),
                ...$session,
            ]],
        ]);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret ?? self::WEBHOOK_SECRET);

        return $this->call('POST', '/api/v1/stripe/webhook', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
    }

    public function test_totals_come_from_database_prices_not_from_the_request(): void
    {
        $stock = $this->k8Size()->stock;

        $response = $this->placeOrder([
            'items' => [['product_id' => 'kangen-k8', 'size' => $this->k8Size()->label, 'quantity' => 2, 'price' => 1, 'unit_price' => 1]],
            'total' => 1,
            'subtotal' => 1,
            'payment_status' => 'Paid',
        ])->assertCreated();

        $response->assertJsonPath('order.subtotal', 11780)
            ->assertJsonPath('order.total', 11780)
            ->assertJsonPath('order.payment_status', 'Unpaid')
            ->assertJsonPath('order.status', 'Pending')
            ->assertJsonPath('order.customer_email', 'jane@example.com')
            ->assertJsonPath('order.items.0.price', 5890)
            ->assertJsonPath('checkout_url', null);

        $this->assertSame($stock - 2, $this->k8Size()->stock);
        $this->assertSame(-2, InventoryMovement::latest('id')->first()->change);
        $this->assertSame($stock - 2, InventoryMovement::latest('id')->first()->new_stock);
    }

    public function test_it_refuses_to_oversell_and_leaves_stock_untouched(): void
    {
        $size = $this->k8Size();

        // Splitting the quantity across two lines must not get around the check.
        $this->placeOrder(['items' => [
            ['product_id' => 'kangen-k8', 'size' => $size->label, 'quantity' => $size->stock],
            ['product_id' => 'kangen-k8', 'size' => $size->label, 'quantity' => 1],
        ]])->assertUnprocessable()->assertJsonValidationErrors('items');

        $this->assertSame($size->stock, $this->k8Size()->stock);
        $this->assertSame(20, Order::count());
    }

    public function test_unknown_products_and_options_are_rejected(): void
    {
        $this->placeOrder(['items' => [['product_id' => 'nope', 'size' => 'x', 'quantity' => 1]]])
            ->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->placeOrder(['items' => [['product_id' => 'kangen-k8', 'size' => 'No such option', 'quantity' => 1]]])
            ->assertUnprocessable()->assertJsonValidationErrors('items');

        Product::where('public_id', 'kangen-k8')->update(['status' => 'draft']);
        $this->placeOrder()->assertUnprocessable()->assertJsonValidationErrors('items');
    }

    public function test_discount_codes_are_validated_and_counted(): void
    {
        $used = Discount::where('code', 'WELCOME10')->value('used_count');

        // 10% of 11,780 is 1,178 but WELCOME10 is capped at 50.
        $this->placeOrder(['discount_code' => 'welcome10'])
            ->assertCreated()
            ->assertJsonPath('order.discount_code', 'WELCOME10')
            ->assertJsonPath('order.discount_amount', 50)
            ->assertJsonPath('order.total', 11730);

        $this->assertSame($used + 1, Discount::where('code', 'WELCOME10')->value('used_count'));

        $this->placeOrder(['discount_code' => 'NOT-A-CODE'])->assertUnprocessable()->assertJsonValidationErrors('discount_code');

        Discount::where('code', 'WELCOME10')->update(['ends_at' => now()->subDay()]);
        $this->placeOrder(['discount_code' => 'WELCOME10'])->assertUnprocessable()->assertJsonValidationErrors('discount_code');
    }

    public function test_quote_prices_a_cart_without_creating_an_order(): void
    {
        $this->postJson('/api/v1/checkout/quote', [
            'items' => [['product_id' => 'kangen-k8', 'size' => $this->k8Size()->label, 'quantity' => 1]],
            'discount_code' => 'WELCOME10',
        ])->assertOk()->assertJsonPath('subtotal', 5890)->assertJsonPath('discount_amount', 50)->assertJsonPath('total', 5840);

        $this->assertSame(20, Order::count());
    }

    public function test_a_repeated_submission_returns_the_same_order(): void
    {
        $payload = $this->payload();
        $stock = $this->k8Size()->stock;

        $first = $this->postJson('/api/v1/orders', $payload)->assertCreated()->json('order.number');
        $second = $this->postJson('/api/v1/orders', $payload)->assertOk()->json('order.number');

        $this->assertSame($first, $second);
        $this->assertSame($stock - 2, $this->k8Size()->stock);
    }

    public function test_referral_is_taken_from_the_request_or_the_buyers_sponsor(): void
    {
        $this->placeOrder(['referral_code' => 'hb-emp-101'])->assertJsonPath('order.referral_code', 'HB-EMP-101');
        $this->placeOrder(['referral_code' => 'HB-FAKE-999'])->assertCreated()->assertJsonPath('order.referral_code', null);

        $buyer = User::where('email', 'customer@example.com')->sole();
        $response = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/orders', $this->payload())->assertCreated();

        $response->assertJsonPath('order.referral_code', $buyer->sponsor_code);
        $this->assertSame($buyer->id, Order::where('number', $response->json('order.number'))->value('user_id'));
    }

    public function test_orders_are_visible_only_to_their_owner_staff_or_token_holder(): void
    {
        $buyer = User::where('email', 'customer@example.com')->sole();
        $other = User::factory()->create();
        $admin = User::where('role', 'admin')->first();

        $created = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/orders', $this->payload())->assertCreated();
        $number = $created->json('order.number');
        $token = $created->json('access_token');
        $this->app['auth']->forgetGuards();

        $this->getJson("/api/v1/orders/{$number}")->assertNotFound();
        $this->getJson("/api/v1/orders/{$number}?token=wrong")->assertNotFound();
        $this->getJson("/api/v1/orders/{$number}?token={$token}")->assertOk()->assertJsonMissingPath('data.guest_token');

        $this->actingAs($other, 'sanctum')->getJson("/api/v1/orders/{$number}")->assertNotFound();
        $this->actingAs($admin, 'sanctum')->getJson("/api/v1/orders/{$number}")->assertOk();
        $this->actingAs($buyer, 'sanctum')->getJson("/api/v1/orders/{$number}")->assertOk();

        $mine = $this->actingAs($buyer, 'sanctum')->getJson('/api/v1/orders')->assertOk()->json('data.*.number');
        $this->assertContains($number, $mine);
        $this->assertNotContains($number, $this->actingAs($other, 'sanctum')->getJson('/api/v1/orders')->json('data.*.number'));
    }

    public function test_card_orders_stay_unpaid_until_the_signed_webhook_arrives(): void
    {
        $response = $this->placeOrder(['payment_method' => 'stripe'])->assertCreated()
            ->assertJsonPath('order.payment_status', 'Unpaid')
            ->assertJsonPath('checkout_url', 'https://pay.test/cs_test_1');

        $order = Order::where('number', $response->json('order.number'))->sole();
        $this->assertSame('cs_test_1', $order->stripe_session_id);

        $this->webhook('checkout.session.completed', $order, [], 'whsec_wrong')->assertStatus(400);
        $this->assertSame('Unpaid', $order->fresh()->payment_status);

        // A delayed payment method completes the session before the money arrives.
        $this->webhook('checkout.session.completed', $order, ['payment_status' => 'unpaid'])->assertOk();
        $this->assertSame('Unpaid', $order->fresh()->payment_status);

        // An amount that differs from our total is never accepted as payment.
        $this->webhook('checkout.session.completed', $order, ['amount_total' => 100])->assertOk();
        $this->assertSame('Unpaid', $order->fresh()->payment_status);

        $this->webhook('checkout.session.async_payment_succeeded', $order)->assertOk();
        $this->webhook('checkout.session.completed', $order)->assertOk();

        $order->refresh();
        $this->assertSame('Paid', $order->payment_status);
        $this->assertSame('Confirmed', $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertSame(1, $order->statusHistory()->where('status', 'Confirmed')->count());
    }

    public function test_an_expired_payment_page_cancels_the_order_and_restocks_once(): void
    {
        $stock = $this->k8Size()->stock;
        $used = Discount::where('code', 'WELCOME10')->value('used_count');

        $number = $this->placeOrder(['payment_method' => 'stripe', 'discount_code' => 'WELCOME10'])->json('order.number');
        $order = Order::where('number', $number)->sole();
        $this->assertSame($stock - 2, $this->k8Size()->stock);

        $this->webhook('checkout.session.expired', $order)->assertOk();
        $this->webhook('checkout.session.expired', $order)->assertOk();

        $this->assertSame('Cancelled', $order->fresh()->status);
        $this->assertSame($stock, $this->k8Size()->stock);
        $this->assertSame($used, Discount::where('code', 'WELCOME10')->value('used_count'));
    }

    public function test_a_failed_payment_page_start_releases_the_stock(): void
    {
        $stock = $this->k8Size()->stock;
        $this->gateway->fail = true;

        $this->placeOrder(['payment_method' => 'stripe'])->assertUnprocessable()->assertJsonValidationErrors('payment_method');

        $this->assertSame($stock, $this->k8Size()->stock);
        $this->assertSame('Cancelled', Order::latest('id')->first()->status);
    }

    public function test_card_payment_is_refused_when_stripe_is_not_configured(): void
    {
        $this->gateway->available = false;

        $this->getJson('/api/v1/checkout/config')->assertJsonPath('payment_methods', ['cod', 'bank_transfer']);
        $this->placeOrder(['payment_method' => 'stripe'])->assertUnprocessable()->assertJsonValidationErrors('payment_method');
        $this->assertSame(20, Order::count());
    }
}
