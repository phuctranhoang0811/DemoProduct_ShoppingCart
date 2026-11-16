<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('type', 20);
            $table->decimal('value', 12, 2);
            $table->decimal('min_order_amount', 12, 2)->default(0);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('usage_limit')->default(0);
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number', 32)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->index();
            $table->string('customer_phone', 32);
            $table->string('shipping_street');
            $table->string('shipping_ward')->nullable();
            $table->string('shipping_district')->nullable();
            $table->string('shipping_city');
            $table->string('delivery_method');
            $table->string('payment_method', 32);
            $table->string('payment_status', 20)->default('Unpaid');
            $table->string('status', 20)->default('Pending')->index();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->string('discount_code', 32)->nullable();
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('referral_code', 32)->nullable()->index();
            $table->text('notes')->nullable();
            // Lets a retried checkout request return the order it already created.
            $table->uuid('idempotency_key')->nullable()->unique();
            // Shown once to the buyer so a guest can view their own order confirmation.
            $table->string('guest_token', 64)->nullable();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // Line items snapshot the product at purchase time, so they survive product edits and deletions.
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('slug');
            $table->string('image', 2048)->nullable();
            $table->decimal('price', 12, 2);
            $table->string('color_name')->nullable();
            $table->string('size')->nullable();
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20);
            $table->string('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('variant_info')->nullable();
            $table->integer('change');
            $table->unsignedInteger('previous_stock');
            $table->unsignedInteger('new_stock');
            $table->string('reason');
            $table->timestamp('moved_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('discounts');
    }
};
