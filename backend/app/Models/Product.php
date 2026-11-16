<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['public_id', 'category_id', 'name', 'slug', 'sku', 'description', 'materials', 'details', 'specifications', 'price', 'original_price', 'status', 'featured', 'best_seller', 'new_arrival', 'sale'])]
class Product extends Model
{
    protected static function booted(): void
    {
        static::creating(function (self $model): void {
            $model->public_id ??= $model->slug;
        });
    }

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'specifications' => 'array',
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'featured' => 'boolean',
            'best_seller' => 'boolean',
            'new_arrival' => 'boolean',
            'sale' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    /** @return HasMany<ProductColor, $this> */
    public function colors(): HasMany
    {
        return $this->hasMany(ProductColor::class)->orderBy('id');
    }

    /** @return HasMany<ProductSize, $this> */
    public function sizes(): HasMany
    {
        // A fixed order: without it Postgres lists the most recently updated row last,
        // so options would reshuffle on the product page every time stock changes.
        return $this->hasMany(ProductSize::class)->orderBy('id');
    }

    /** @return HasMany<Review, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** @return HasMany<Review, $this> */
    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('status', 'approved')->latest();
    }

    /** @param Builder<self> $query */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('status', 'active');
    }

    /** @param Builder<self> $query */
    #[Scope]
    protected function withCatalogData(Builder $query): void
    {
        $query->with(['category', 'images', 'colors', 'sizes'])
            ->withCount('approvedReviews')
            ->withAvg('approvedReviews', 'rating');
    }
}
