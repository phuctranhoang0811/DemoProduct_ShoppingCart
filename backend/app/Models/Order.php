<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['number', 'user_id', 'customer_name', 'customer_email', 'customer_phone', 'shipping_street', 'shipping_ward', 'shipping_district', 'shipping_city', 'shipping_postal_code', 'delivery_method', 'payment_method', 'payment_status', 'status', 'subtotal', 'discount_amount', 'discount_code', 'shipping_fee', 'total', 'referral_code', 'notes', 'idempotency_key', 'guest_token', 'stripe_session_id', 'paid_at'])]
#[Hidden(['guest_token', 'idempotency_key'])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    /** @return HasMany<CommissionTransaction, $this> */
    public function commissions(): HasMany
    {
        return $this->hasMany(CommissionTransaction::class);
    }
}
