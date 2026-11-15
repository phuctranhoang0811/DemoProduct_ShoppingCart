<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'public_id', 'name', 'email', 'role', 'phone', 'referral_code', 'referred_by_id', 'owner_id', 'rank', 'valid_orders_count', 'personal_sales_volume', 'network_sales_volume', 'direct_invite_count', 'total_commission_earned', 'available_balance', 'has_purchased_filtration_device', 'is_active', 'avatar_url'])]
class HellobeeMember extends Model
{
    protected function casts(): array
    {
        return [
            'personal_sales_volume' => 'decimal:2',
            'network_sales_volume' => 'decimal:2',
            'total_commission_earned' => 'decimal:2',
            'available_balance' => 'decimal:2',
            'has_purchased_filtration_device' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public const RANK_THRESHOLDS = ['5A' => 625, '4A' => 125, '3A' => 25, '2A' => 5];

    public static function rankFor(int $validOrders): string
    {
        foreach (self::RANK_THRESHOLDS as $rank => $required) {
            if ($validOrders >= $required) {
                return $rank;
            }
        }

        return '1A';
    }

    /** @return HasMany<HellobeeMember, $this> */
    public function team(): HasMany
    {
        return $this->hasMany(self::class, 'owner_id');
    }

    /** @return HasMany<HellobeeMember, $this> */
    public function recruits(): HasMany
    {
        return $this->hasMany(self::class, 'referred_by_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<HellobeeMember, $this> */
    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(HellobeeMember::class, 'referred_by_id');
    }

    /** @return BelongsTo<HellobeeMember, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(HellobeeMember::class, 'owner_id');
    }

    /** @return HasMany<CommissionTransaction, $this> */
    public function commissions(): HasMany
    {
        return $this->hasMany(CommissionTransaction::class, 'beneficiary_id');
    }

    /** @return HasMany<PayoutRequest, $this> */
    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class, 'member_id');
    }
}
