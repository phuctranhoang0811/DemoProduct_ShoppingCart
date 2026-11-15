<?php

namespace App\Services\Hellobee;

use App\Models\CommissionTransaction;
use App\Models\HellobeeMember;
use App\Models\Order;
use App\Services\Checkout\OrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Network earnings. Commissions exist only for orders whose payment is confirmed:
 *  - the consultant whose code is on the order earns 10% of the merchandise value;
 *  - when that consultant is an employee, their owner earns a 1% override;
 *  - employees climb 1A-5A by number of credited orders.
 * Amounts are computed in integer cents and rounded down.
 */
class CommissionService
{
    public const DIRECT = 'DIRECT_10_PERCENT';

    public const OVERRIDE = 'OWNER_OVERRIDE_1_PERCENT';

    /** Call inside the transaction that marks the order paid. Safe to repeat. */
    public function awardForOrder(Order $order): void
    {
        $this->activateBuyer($order);

        $seller = $this->creditedMember($order);
        if (! $seller || CommissionTransaction::where('order_id', $order->id)->exists()) {
            return;
        }

        $base = $this->commissionableCents($order);
        if ($base <= 0) {
            return;
        }

        $seller = HellobeeMember::whereKey($seller->id)->lockForUpdate()->first();
        $direct = intdiv($base * (int) config('services.hellobee.direct_rate_percent'), 100);

        $this->record($order, $seller, self::DIRECT, (int) config('services.hellobee.direct_rate_percent'), $direct, $base,
            "10% direct commission on order {$order->number}");

        $seller->valid_orders_count++;
        $seller->personal_sales_volume = $this->add($seller->personal_sales_volume, $base);
        $seller->network_sales_volume = $this->add($seller->network_sales_volume, $base);
        $this->credit($seller, $direct);
        if ($seller->role === 'EMPLOYEE') {
            $seller->rank = HellobeeMember::rankFor($seller->valid_orders_count);
        }
        $seller->save();

        if ($seller->role !== 'EMPLOYEE' || ! $seller->owner_id) {
            return;
        }

        $owner = HellobeeMember::whereKey($seller->owner_id)->where('is_active', true)->lockForUpdate()->first();
        if (! $owner) {
            return;
        }

        $override = intdiv($base * (int) config('services.hellobee.owner_override_percent'), 100);
        $this->record($order, $owner, self::OVERRIDE, (int) config('services.hellobee.owner_override_percent'), $override, $base,
            "1% owner override on {$seller->name}'s order {$order->number}");

        $owner->network_sales_volume = $this->add($owner->network_sales_volume, $base);
        $this->credit($owner, $override);
        $owner->save();
    }

    /**
     * Takes back the commissions of an order that was refunded or cancelled after payment.
     * A balance may go negative when the money was already withdrawn; it is recovered from later earnings.
     */
    public function revokeForOrder(Order $order): void
    {
        DB::transaction(function () use ($order): void {
            $commissions = CommissionTransaction::where('order_id', $order->id)
                ->where('status', 'APPROVED')
                ->lockForUpdate()
                ->get();

            foreach ($commissions as $commission) {
                $member = HellobeeMember::whereKey($commission->beneficiary_id)->lockForUpdate()->first();
                $amount = OrderService::toCents($commission->amount);
                $base = OrderService::toCents($commission->order_amount);

                $member->total_commission_earned = $this->add($member->total_commission_earned, -$amount);
                $member->available_balance = $this->add($member->available_balance, -$amount);
                $member->network_sales_volume = $this->add($member->network_sales_volume, -$base);

                if ($commission->commission_type === self::DIRECT) {
                    $member->valid_orders_count = max(0, $member->valid_orders_count - 1);
                    $member->personal_sales_volume = $this->add($member->personal_sales_volume, -$base);
                    if ($member->role === 'EMPLOYEE') {
                        $member->rank = HellobeeMember::rankFor($member->valid_orders_count);
                    }
                }

                $member->save();
                $commission->update(['status' => 'REVOKED', 'notes' => trim($commission->notes.' Revoked: order reversed.')]);
            }
        });
    }

    /** The active member credited with the order, unless they are the buyer themselves. */
    private function creditedMember(Order $order): ?HellobeeMember
    {
        if (! $order->referral_code) {
            return null;
        }

        $member = HellobeeMember::where('referral_code', $order->referral_code)->where('is_active', true)->first();

        $isBuyer = $member && (
            ($order->user_id && $member->user_id === $order->user_id)
            || Str::lower($member->email) === Str::lower($order->customer_email)
        );

        return $isBuyer ? null : $member;
    }

    /** A signed-in buyer of the activation product becomes a consultant under the order's sponsor. */
    private function activateBuyer(Order $order): void
    {
        $user = $order->user;
        $activationProduct = config('services.hellobee.activation_product');

        if (! $user || ! $order->items()->whereRelation('product', 'public_id', $activationProduct)->exists()) {
            return;
        }

        $member = $user->hellobeeMember;

        if ($member) {
            $member->update(['has_purchased_filtration_device' => true]);

            return;
        }

        $sponsor = $order->referral_code
            ? HellobeeMember::where('referral_code', $order->referral_code)->where('is_active', true)->first()
            : null;

        $user->hellobeeMember()->create([
            'public_id' => 'member-'.Str::lower(Str::random(12)),
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => 'EMPLOYEE',
            'referral_code' => $this->newReferralCode(),
            'referred_by_id' => $sponsor?->id,
            'owner_id' => $sponsor?->role === 'OWNER' ? $sponsor->id : $sponsor?->owner_id,
            'has_purchased_filtration_device' => true,
        ]);

        $sponsor?->increment('direct_invite_count');

        if ($user->role === 'customer') {
            $user->forceFill(['role' => 'employee'])->save();
        }
    }

    private function record(Order $order, HellobeeMember $member, string $type, int $percent, int $cents, int $base, string $notes): void
    {
        CommissionTransaction::create([
            'order_id' => $order->id,
            'order_number' => $order->number,
            'order_amount' => OrderService::toDecimal($base),
            'buyer_name' => $order->customer_name,
            'beneficiary_id' => $member->id,
            'commission_type' => $type,
            'rate' => bcdiv((string) $percent, '100', 4),
            'amount' => OrderService::toDecimal($cents),
            'status' => 'APPROVED',
            'notes' => $notes,
        ]);
    }

    private function credit(HellobeeMember $member, int $cents): void
    {
        $member->total_commission_earned = $this->add($member->total_commission_earned, $cents);
        $member->available_balance = $this->add($member->available_balance, $cents);
    }

    /** Merchandise value: what the buyer paid, without shipping. */
    private function commissionableCents(Order $order): int
    {
        return OrderService::toCents($order->total) - OrderService::toCents($order->shipping_fee);
    }

    private function add(string|int|float|null $decimal, int $cents): string
    {
        return OrderService::toDecimal(OrderService::toCents($decimal) + $cents);
    }

    private function newReferralCode(): string
    {
        do {
            $code = 'HB-EMP-'.random_int(10000, 99999);
        } while (HellobeeMember::where('referral_code', $code)->exists());

        return $code;
    }
}
