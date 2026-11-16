<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'product_name', 'variant_info', 'change', 'previous_stock', 'new_stock', 'reason', 'moved_at'])]
class InventoryMovement extends Model
{
    protected function casts(): array
    {
        return [
            'change' => 'integer',
            'moved_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
