<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\HellobeeController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewSubmissionController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\TaxCalculationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:catalog')->group(function (): void {
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'show']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('events', [EventController::class, 'index']);
});

Route::prefix('v1')->middleware('throttle:checkout')->group(function (): void {
    Route::get('checkout/config', [CheckoutController::class, 'config']);
    Route::post('checkout/quote', [CheckoutController::class, 'quote']);
    // Guests may check out; a signed-in buyer is picked up from the bearer token when present.
    Route::post('orders', [CheckoutController::class, 'store']);
    Route::get('orders/{number}', [CheckoutController::class, 'show']);
    Route::get('orders', [CheckoutController::class, 'index'])->middleware('auth:sanctum');
});

Route::prefix('v1')->middleware('throttle:checkout')->group(function (): void {
    Route::get('referral-codes/{code}', [HellobeeController::class, 'referralCode']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('hellobee/network', [HellobeeController::class, 'network']);
        Route::post('hellobee/payouts', [HellobeeController::class, 'requestPayout']);

        Route::middleware('role:admin')->group(function (): void {
            Route::patch('hellobee/payouts/{payout}', [HellobeeController::class, 'decidePayout']);
            Route::post('orders/{number}/mark-paid', [CheckoutController::class, 'markPaid']);
        });

        Route::get('tax/calculations', [TaxCalculationController::class, 'index']);
        Route::get('tax/calculations/{calculation}', [TaxCalculationController::class, 'show']);
        Route::delete('tax/calculations/{calculation}', [TaxCalculationController::class, 'destroy']);
    });

    Route::post('tax/calculations', [TaxCalculationController::class, 'store'])->middleware('auth:sanctum');
    Route::post('products/{slug}/reviews', [ReviewSubmissionController::class, 'store']);
});

// Back office. Staff see and move along orders; everything else is for administrators.
Route::prefix('v1/admin')->middleware(['throttle:checkout', 'auth:sanctum', 'role:admin,employee'])->group(function (): void {
    Route::get('orders', [Admin\OrderController::class, 'index']);
    Route::patch('orders/{number}/status', [Admin\OrderController::class, 'updateStatus']);

    Route::middleware('role:admin')->group(function (): void {
        Route::post('orders/{number}/refund', [Admin\OrderController::class, 'refund']);
        Route::post('orders/{number}/mark-paid', [CheckoutController::class, 'markPaid']);

        Route::get('products', [Admin\ProductController::class, 'index']);
        Route::post('products', [Admin\ProductController::class, 'store']);
        Route::put('products/{product:public_id}', [Admin\ProductController::class, 'update']);
        Route::delete('products/{product:public_id}', [Admin\ProductController::class, 'destroy']);

        Route::get('categories', [Admin\CategoryController::class, 'index']);
        Route::post('categories', [Admin\CategoryController::class, 'store']);
        Route::put('categories/{category:public_id}', [Admin\CategoryController::class, 'update']);
        Route::delete('categories/{category:public_id}', [Admin\CategoryController::class, 'destroy']);

        Route::get('customers', [Admin\CustomerController::class, 'index']);
        Route::post('customers', [Admin\CustomerController::class, 'store']);
        Route::put('customers/{user}', [Admin\CustomerController::class, 'update']);

        Route::get('discounts', [Admin\DiscountController::class, 'index']);
        Route::post('discounts', [Admin\DiscountController::class, 'store']);
        Route::put('discounts/{discount}', [Admin\DiscountController::class, 'update']);
        Route::delete('discounts/{discount}', [Admin\DiscountController::class, 'destroy']);

        Route::get('events', [Admin\EventController::class, 'index']);
        Route::post('events', [Admin\EventController::class, 'store']);
        Route::delete('events/{event:public_id}', [Admin\EventController::class, 'destroy']);

        Route::get('reviews', [Admin\ReviewController::class, 'index']);
        Route::patch('reviews/{review}', [Admin\ReviewController::class, 'update']);
        Route::delete('reviews/{review}', [Admin\ReviewController::class, 'destroy']);

        Route::get('inventory', [Admin\InventoryController::class, 'index']);
        Route::post('inventory/adjust', [Admin\InventoryController::class, 'adjust']);

        Route::get('settings', [Admin\SettingController::class, 'show']);
        Route::put('settings', [Admin\SettingController::class, 'update']);

        Route::get('audit-logs', [Admin\AuditLogController::class, 'index']);
        Route::post('audit-logs', [Admin\AuditLogController::class, 'store']);
    });
});

Route::get('v1/health', HealthController::class);

// Signature-verified inside the controller; never rate limited, Stripe retries on failure.
Route::post('v1/stripe/webhook', StripeWebhookController::class);

Route::prefix('v1/auth')->group(function (): void {
    Route::middleware('throttle:auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [PasswordResetController::class, 'sendLink']);
        Route::post('reset-password', [PasswordResetController::class, 'reset']);
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
