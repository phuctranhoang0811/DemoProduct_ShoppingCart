<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Event;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Models\Review;
use App\Models\User;
use App\Observers\CatalogObserver;
use App\Services\Payments\PaymentGateway;
use App\Services\Payments\StripeGateway;
use App\Services\StorefrontRevalidator;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->scoped(StorefrontRevalidator::class);
        $this->app->bind(PaymentGateway::class, StripeGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Each limiter needs its own key: the built-in `throttle:N,M` shares one counter per address,
        // so storefront catalog traffic would otherwise use up the sign-in allowance. Requests arrive
        // through the storefront server, so these are site-wide ceilings; per-account sign-in lockout
        // lives in AuthController.
        RateLimiter::for('catalog', fn (Request $request) => Limit::perMinute(600)->by('catalog|'.$request->ip()));
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(300)->by('checkout|'.$request->ip()));
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(60)->by('auth|'.$request->ip()));

        // Password reset emails link to the storefront, which owns the reset form.
        ResetPassword::createUrlUsing(fn (User $user, string $token) => rtrim((string) config('services.storefront.url'), '/')
            .'/reset-password?'.http_build_query(['token' => $token, 'email' => $user->email]));

        Password::defaults(fn () => Password::min(8)->letters()->numbers());

        foreach ([Category::class, Event::class, Product::class, ProductImage::class, ProductColor::class, ProductSize::class, Review::class] as $model) {
            $model::observe(CatalogObserver::class);
        }
    }
}
