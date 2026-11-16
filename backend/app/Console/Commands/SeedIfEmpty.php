<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:seed-if-empty')]
#[Description('Seed initial store records only when the product catalog is empty')]
class SeedIfEmpty extends Command
{
    public function handle(): int
    {
        if (Product::query()->exists()) {
            $this->info('Products already exist; skipping initial store seed.');

            return self::SUCCESS;
        }

        $this->call('db:seed', ['--force' => true]);

        return self::SUCCESS;
    }
}
