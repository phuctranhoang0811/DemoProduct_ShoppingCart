<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'amount', 'bank_name', 'bank_account_number', 'bank_account_name', 'status', 'requested_at', 'processed_at'])]
class PayoutRequest extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'bank_account_number' => 'encrypted',
            'requested_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<HellobeeMember, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(HellobeeMember::class, 'member_id');
    }
}
