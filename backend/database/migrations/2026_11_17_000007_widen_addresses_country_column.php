<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('country', 100)->nullable()->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_postal_code', 32)->nullable()->after('shipping_city');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('shipping_postal_code');
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->string('country', 2)->nullable()->change();
        });
    }
};
