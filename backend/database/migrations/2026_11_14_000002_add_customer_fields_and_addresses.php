<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 32)->nullable();
            $table->string('role', 20)->default('customer')->index();
            $table->string('status', 20)->default('active');
            $table->string('avatar', 2048)->nullable();
            // Referral code of the Hellobee member who sponsored this customer.
            $table->string('sponsor_code', 32)->nullable()->index();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('phone', 32);
            $table->string('street');
            $table->string('ward')->nullable();
            $table->string('district')->nullable();
            $table->string('city');
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 2)->nullable();
            $table->string('delivery_notes')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['sponsor_code']);
            $table->dropColumn(['phone', 'role', 'status', 'avatar', 'sponsor_code']);
        });
    }
};
