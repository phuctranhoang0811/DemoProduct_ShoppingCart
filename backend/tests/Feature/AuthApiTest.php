<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'correct-horse-9';

    private function makeUser(array $attributes = []): User
    {
        $user = User::factory()->create(['email' => 'jane@example.com', 'password' => self::PASSWORD]);
        $user->forceFill($attributes)->save();

        return $user;
    }

    public function test_registration_creates_a_customer_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'Jane@Example.com',
            'phone' => '+1 (555) 349-8201',
            'password' => self::PASSWORD,
            'role' => 'admin',
            'status' => 'inactive',
        ]);

        // Mixed-case emails are rejected rather than silently stored twice.
        $response->assertUnprocessable()->assertJsonValidationErrors('email');

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+1 (555) 349-8201',
            'password' => self::PASSWORD,
            'role' => 'admin',
        ])->assertCreated()->assertJsonPath('user.role', 'customer');

        $this->assertNotEmpty($response->json('token'));
        $this->assertSame('customer', User::where('email', 'jane@example.com')->value('role'));
        $this->assertNotSame(self::PASSWORD, User::where('email', 'jane@example.com')->value('password'));
    }

    public function test_registration_rejects_weak_passwords_and_duplicate_emails(): void
    {
        $this->makeUser();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+1 (555) 349-8201',
            'password' => 'short',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_returns_a_token_that_reaches_the_profile(): void
    {
        $this->makeUser(['role' => 'employee']);

        $token = $this->postJson('/api/v1/auth/login', ['email' => 'JANE@example.com', 'password' => self::PASSWORD])
            ->assertOk()
            ->assertJsonPath('user.role', 'employee')
            ->json('token');

        $this->withToken($token)->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'jane@example.com')
            ->assertJsonMissingPath('data.password');
    }

    public function test_login_fails_the_same_way_for_wrong_password_unknown_email_and_inactive_account(): void
    {
        $this->makeUser();
        User::factory()->create(['email' => 'off@example.com', 'password' => self::PASSWORD])
            ->forceFill(['status' => 'inactive'])->save();

        $attempts = [
            ['email' => 'jane@example.com', 'password' => 'wrong-password-1'],
            ['email' => 'nobody@example.com', 'password' => self::PASSWORD],
            ['email' => 'off@example.com', 'password' => self::PASSWORD],
        ];

        foreach ($attempts as $attempt) {
            $this->postJson('/api/v1/auth/login', $attempt)
                ->assertUnprocessable()
                ->assertJsonPath('errors.email.0', __('auth.failed'));
        }
    }

    public function test_login_is_locked_after_repeated_failures(): void
    {
        $this->makeUser();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => 'wrong-password-1'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => self::PASSWORD])
            ->assertStatus(429);
    }

    public function test_logout_revokes_the_token(): void
    {
        $this->makeUser();
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => self::PASSWORD])->json('token');

        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_role_middleware_admits_only_the_listed_roles(): void
    {
        Route::middleware(['api', 'auth:sanctum', 'role:admin'])->get('/api/_test/admin-only', fn () => ['ok' => true]);

        $customer = $this->makeUser();
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $suspended = User::factory()->create();
        $suspended->forceFill(['role' => 'admin', 'status' => 'inactive'])->save();

        $this->getJson('/api/_test/admin-only')->assertUnauthorized();
        $this->actingAs($customer, 'sanctum')->getJson('/api/_test/admin-only')->assertForbidden();
        $this->actingAs($suspended, 'sanctum')->getJson('/api/_test/admin-only')->assertForbidden();
        $this->actingAs($admin, 'sanctum')->getJson('/api/_test/admin-only')->assertOk();
    }

    public function test_password_reset_flow_links_to_the_storefront_and_signs_out_everywhere(): void
    {
        Notification::fake();
        $user = $this->makeUser();
        $oldToken = $user->createToken('storefront')->plainTextToken;

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'jane@example.com'])->assertOk();
        $unknown = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'nobody@example.com'])->assertOk();
        $this->assertSame('If that email is registered, a reset link is on its way.', $unknown->json('message'));

        $resetToken = null;
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user, &$resetToken) {
            $resetToken = $notification->token;
            $url = $notification->toMail($user)->actionUrl;

            return str_starts_with($url, 'http://localhost:3000/reset-password?token=');
        });
        Notification::assertCount(1);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'not-the-token',
            'email' => 'jane@example.com',
            'password' => 'brand-new-pass-7',
            'password_confirmation' => 'brand-new-pass-7',
        ])->assertUnprocessable();

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $resetToken,
            'email' => 'jane@example.com',
            'password' => 'brand-new-pass-7',
            'password_confirmation' => 'brand-new-pass-7',
        ])->assertOk();

        $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => 'brand-new-pass-7'])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withToken($oldToken)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_catalog_traffic_does_not_use_up_the_sign_in_allowance(): void
    {
        $this->makeUser();

        for ($i = 0; $i < 70; $i++) {
            $this->getJson('/api/v1/categories')->assertOk();
        }

        $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => self::PASSWORD])->assertOk();
    }
}
