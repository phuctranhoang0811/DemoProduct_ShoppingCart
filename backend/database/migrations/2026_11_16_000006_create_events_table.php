<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 64)->unique();
            $table->string('title');
            $table->string('category', 40)->index();
            $table->date('date')->index();
            $table->string('time', 64)->nullable();
            $table->string('location');
            $table->text('description')->nullable();
            $table->text('meaning')->nullable();
            $table->text('image');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
