<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'order_number', 'order_amount', 'buyer_name', 'beneficiary_id', 'commission_type', 'rate', 'amount', 'status', 'notes'])]
class CommissionTransaction extends Model
{
    protected function casts(): array
    {
        return [
            'order_amount' => 'decimal:2',
            'rate' => 'decimal:4',
            'amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<HellobeeMember, $this> */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(HellobeeMember::class, 'beneficiary_id');
    }
}
