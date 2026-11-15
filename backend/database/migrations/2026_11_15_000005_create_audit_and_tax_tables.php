<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Who changed what in the back office. Rows are append-only.
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 64)->index();
            $table->string('entity_type', 64);
            $table->string('entity_id', 64)->nullable();
            $table->json('details')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['entity_type', 'entity_id']);
        });

        // Saved runs of the salary and tax calculator, kept only for signed-in users.
        Schema::create('tax_calculations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('country', 2);
            $table->unsignedSmallInteger('tax_year');
            $table->string('income_type', 40);
            $table->string('currency', 3);
            $table->string('gross_income', 40);
            $table->string('total_tax', 40);
            $table->string('net_income', 40);
            $table->string('effective_tax_rate', 20);
            $table->string('rule_version', 64);
            $table->string('status', 40);
            // Income figures are personal data, so both snapshots are encrypted at rest.
            $table->text('input_snapshot');
            $table->text('result_snapshot');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_calculations');
        Schema::dropIfExists('audit_logs');
    }
};
