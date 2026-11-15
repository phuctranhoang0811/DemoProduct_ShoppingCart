<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['public_id', 'name', 'slug', 'description', 'image', 'status'])]
class Category extends Model
{
    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            $model->public_id ??= $model->slug;
        });
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
