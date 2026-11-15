<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hellobee_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // Stable identifier exposed to the storefront, which still keys its local network data on it.
            $table->string('public_id', 64)->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('role', 20)->index();
            $table->string('phone', 32)->nullable();
            $table->string('referral_code', 32)->unique();
            $table->foreignId('referred_by_id')->nullable()->constrained('hellobee_members')->nullOnDelete();
            // Top-level owner an employee reports to; receives the 1% override.
            $table->foreignId('owner_id')->nullable()->constrained('hellobee_members')->nullOnDelete();
            $table->string('rank', 2)->default('1A');
            $table->unsignedInteger('valid_orders_count')->default(0);
            $table->decimal('personal_sales_volume', 14, 2)->default(0);
            $table->decimal('network_sales_volume', 14, 2)->default(0);
            $table->unsignedInteger('direct_invite_count')->default(0);
            $table->decimal('total_commission_earned', 14, 2)->default(0);
            $table->decimal('available_balance', 14, 2)->default(0);
            $table->boolean('has_purchased_filtration_device')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('avatar_url', 2048)->nullable();
            $table->timestamps();
        });

        Schema::create('commission_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number', 32)->index();
            $table->decimal('order_amount', 12, 2);
            $table->string('buyer_name');
            $table->foreignId('beneficiary_id')->constrained('hellobee_members')->restrictOnDelete();
            $table->string('commission_type', 40);
            $table->decimal('rate', 5, 4);
            $table->decimal('amount', 12, 2);
            $table->string('status', 20)->default('APPROVED');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['beneficiary_id', 'status']);
            // One commission of each kind per order and beneficiary, however often payment is confirmed.
            $table->unique(['order_id', 'beneficiary_id', 'commission_type']);
        });

        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('hellobee_members')->restrictOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('bank_name');
            // Stored encrypted; only the last four digits are ever sent back out.
            $table->text('bank_account_number');
            $table->string('bank_account_name');
            $table->string('status', 20)->default('PENDING')->index();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
        Schema::dropIfExists('commission_transactions');
        Schema::dropIfExists('hellobee_members');
    }
};
