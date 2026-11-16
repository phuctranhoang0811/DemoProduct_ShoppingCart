<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Event;
use App\Models\User;
use App\Services\StorefrontRevalidator;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class EventApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(StoreSeeder::class);
    }

    public function test_public_events_endpoint_lists_seeded_events(): void
    {
        $this->getJson('/api/v1/events')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('data.0.id', 'evt-hydration-workshop');
    }

    public function test_only_admins_can_create_and_delete_events(): void
    {
        config(['services.storefront.revalidate_url' => 'https://storefront.test/api/revalidate']);
        Http::fake(['storefront.test/*' => Http::response(['revalidated' => true])]);

        $customer = User::where('email', 'customer@example.com')->sole();
        $employee = User::where('email', 'employee@hellobee.com')->sole();
        $admin = User::where('email', 'owner@hellobee.com')->sole();

        $payload = [
            'title' => 'Spring Hydration Meetup',
            'category' => 'Community',
            'date' => '2027-03-15',
            'time' => '5:00 PM',
            'location' => 'Austin, TX',
            'description' => 'Community gathering and pH demo.',
            'meaning' => 'Growing together.',
            'image' => '/images/events/campfire.webp',
        ];

        $this->actingAs($customer, 'sanctum')->postJson('/api/v1/admin/events', $payload)->assertForbidden();
        $this->actingAs($employee, 'sanctum')->postJson('/api/v1/admin/events', $payload)->assertForbidden();

        $id = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/events', $payload)
            ->assertCreated()
            ->assertJsonPath('data.title', 'Spring Hydration Meetup')
            ->json('data.id');

        $this->assertSame(5, Event::count());

        app(StorefrontRevalidator::class)->flush();
        Http::assertSent(fn (HttpRequest $request) => in_array('events', $request['tags'], true));

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/events', [
            ...$payload,
            'image' => 'javascript:alert(1)',
        ])->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/events/{$id}")->assertOk();
        $this->assertSame(4, Event::count());
        $this->assertSame(
            ['event.created', 'event.deleted'],
            AuditLog::where('entity_id', $id)->orderBy('id')->pluck('action')->all(),
        );
    }
}
