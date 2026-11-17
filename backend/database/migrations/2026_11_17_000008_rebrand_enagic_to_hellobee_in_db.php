<?php

use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $replace = function (mixed $value) use (&$replace): mixed {
            if (is_string($value)) {
                return preg_replace(['/\bEnagic\b/', '/\bENAGIC\b/'], ['Hellobee', 'HELLOBEE'], $value);
            }
            if (is_array($value)) {
                return array_map($replace, $value);
            }

            return $value;
        };

        foreach (Product::all() as $product) {
            $product->update([
                'name' => $replace($product->name),
                'description' => $replace($product->description),
                'materials' => $replace($product->materials),
                'details' => $replace($product->details),
                'specifications' => $replace($product->specifications),
            ]);
        }

        foreach (Review::all() as $review) {
            $review->update([
                'comment' => $replace($review->comment),
            ]);
        }

        foreach (Setting::all() as $setting) {
            $setting->update([
                'value' => $replace($setting->value),
            ]);
        }
    }

    public function down(): void {}
};
