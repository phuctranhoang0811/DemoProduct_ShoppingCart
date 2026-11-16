<?php

namespace App\Observers;

use App\Models\Event;
use App\Models\Product;
use App\Services\StorefrontRevalidator;
use Illuminate\Database\Eloquent\Model;

/**
 * Invalidates storefront pages whenever catalog or event data changes.
 */
class CatalogObserver
{
    public function __construct(private StorefrontRevalidator $revalidator) {}

    public function saved(Model $model): void
    {
        $this->invalidate($model);
    }

    public function deleted(Model $model): void
    {
        $this->invalidate($model);
    }

    private function invalidate(Model $model): void
    {
        if ($model instanceof Event) {
            $this->revalidator->queue('events');

            return;
        }

        $tags = ['catalog'];

        $product = $model instanceof Product ? $model : $model->getRelationValue('product') ?? (
            $model->getAttribute('product_id') ? Product::find($model->getAttribute('product_id')) : null
        );

        if ($product instanceof Product) {
            $tags[] = "product:{$product->slug}";

            if ($product->wasChanged('slug')) {
                $tags[] = 'product:'.$product->getOriginal('slug');
            }
        }

        $this->revalidator->queue(...$tags);
    }
}
