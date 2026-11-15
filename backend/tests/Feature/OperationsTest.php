<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Services\Payments\PaymentGateway;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\Support\FakeGateway;
use Tests\TestCase;

class OperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_reports_ok_when_the_database_answers(): void
    {
        $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('status', 'ok');
    }

    public function test_every_response_carries_a_request_id_and_only_well_formed_ones_are_reused(): void
    {
        $generated = $this->getJson('/api/v1/health')->headers->get('X-Request-Id');
        $this->assertTrue(Str::isUuid($generated));

        $this->getJson('/api/v1/health', ['X-Request-Id' => 'storefront-12345678'])
            ->assertHeader('X-Request-Id', 'storefront-12345678')
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        $unsafe = $this->getJson('/api/v1/health', ['X-Request-Id' => "bad\nvalue with spaces"])->headers->get('X-Request-Id');
        $this->assertTrue(Str::isUuid($unsafe));
    }

    public function test_browsers_on_other_sites_get_no_cors_permission(): void
    {
        config(['cors.allowed_origins' => ['https://shop.example']]);

        $this->getJson('/api/v1/health', ['Origin' => 'https://shop.example'])
            ->assertHeader('Access-Control-Allow-Origin', 'https://shop.example');
        // With one allowed origin the header always names that origin, so a browser on any other
        // site sees a mismatch and refuses to hand the response to the page.
        $foreign = $this->getJson('/api/v1/health', ['Origin' => 'https://evil.example'])->headers->get('Access-Control-Allow-Origin');
        $this->assertNotSame('https://evil.example', $foreign);
        $this->assertNotSame('*', $foreign);
    }

    public function test_abandoned_card_orders_are_released_but_recent_and_offline_ones_are_kept(): void
    {
        $this->seed(StoreSeeder::class);
        $this->app->instance(PaymentGateway::class, new FakeGateway);
        $size = Product::where('public_id', 'kangen-k8')->sole()->sizes()->orderBy('id')->first();
        $stock = $size->stock;

        $place = fn (string $method) => Order::where('number', $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => 'kangen-k8', 'size' => $size->label, 'quantity' => 1]],
            'customer' => ['name' => 'Buyer', 'email' => 'buyer@example.com', 'phone' => '+1 (555) 349-8201'],
            'shipping_address' => ['street' => '1 Main St', 'city' => 'Austin'],
            'payment_method' => $method,
            'idempotency_key' => (string) Str::uuid(),
        ])->assertCreated()->json('order.number'))->sole();

        $abandoned = $place('stripe');
        $recent = $place('stripe');
        $cashOnDelivery = $place('cod');
        Order::whereKey([$abandoned->id, $cashOnDelivery->id])->update(['created_at' => now()->subHours(3)]);

        $this->artisan('orders:release-stale')->expectsOutputToContain('1 stale order(s) released.')->assertSuccessful();

        $this->assertSame('Cancelled', $abandoned->fresh()->status);
        $this->assertSame('Pending', $recent->fresh()->status);
        $this->assertSame('Pending', $cashOnDelivery->fresh()->status);
        $this->assertSame($stock - 2, $size->fresh()->stock);

        $this->artisan('orders:release-stale')->expectsOutputToContain('0 stale order(s) released.');
    }
}
