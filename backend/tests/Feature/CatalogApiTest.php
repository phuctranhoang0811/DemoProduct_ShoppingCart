<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Review;
use App\Services\StorefrontRevalidator;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(StoreSeeder::class);
    }

    public function test_it_lists_active_categories(): void
    {
        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.id', 'cat-emguarde')
            ->assertJsonPath('data.0.slug', 'emguarde');
    }

    public function test_it_lists_products_and_filters_by_category(): void
    {
        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonCount(7, 'data')
            ->assertJsonPath('meta.total', 7);

        $filtered = $this->getJson('/api/v1/products?category=ionizers')->assertOk();

        $this->assertNotEmpty($filtered->json('data'));
        $this->assertSame(['ionizers'], array_values(array_unique($filtered->json('data.*.category.slug'))));
    }

    public function test_draft_products_are_hidden(): void
    {
        Product::where('slug', 'enagic-leveluk-k8')->update(['status' => 'draft']);

        $this->getJson('/api/v1/products')->assertJsonCount(6, 'data');
        $this->getJson('/api/v1/products/enagic-leveluk-k8')->assertNotFound();
    }

    public function test_product_detail_exposes_only_approved_reviews_without_emails(): void
    {
        $product = Product::where('slug', 'enagic-leveluk-k8')->sole();
        Review::create([
            'product_id' => $product->id,
            'customer_name' => 'Pending Person',
            'customer_email' => 'pending@example.com',
            'rating' => 1,
            'comment' => 'Not moderated yet.',
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/v1/products/enagic-leveluk-k8')
            ->assertOk()
            ->assertJsonPath('data.id', 'kangen-k8')
            ->assertJsonPath('data.price', 5890)
            ->assertJsonPath('data.rating.count', 2)
            ->assertJsonPath('data.rating.average', 5)
            ->assertJsonCount(2, 'data.reviews');

        $this->assertStringNotContainsString('@', json_encode($response->json('data.reviews')));
    }

    public function test_unknown_product_returns_json_404(): void
    {
        $this->getJson('/api/v1/products/does-not-exist')->assertNotFound();
    }

    public function test_changing_a_product_pings_the_storefront_once_with_its_tags(): void
    {
        config([
            'services.storefront.revalidate_url' => 'https://storefront.test/api/revalidate',
            'services.storefront.revalidate_secret' => 'test-secret',
        ]);
        Http::fake(['storefront.test/*' => Http::response(['revalidated' => true])]);

        $product = Product::where('slug', 'enagic-leveluk-k8')->sole();
        $product->update(['price' => 5990]);
        $product->sizes()->first()->update(['stock' => 1]);

        app(StorefrontRevalidator::class)->flush();

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request) => $request->hasHeader('X-Revalidate-Secret', 'test-secret')
            && $request['tags'] === ['catalog', 'product:enagic-leveluk-k8']);
    }

    public function test_nothing_is_sent_when_the_storefront_is_not_configured(): void
    {
        Http::fake();

        Product::where('slug', 'enagic-leveluk-k8')->sole()->update(['price' => 5990]);
        app(StorefrontRevalidator::class)->flush();

        Http::assertNothingSent();
    }
}
