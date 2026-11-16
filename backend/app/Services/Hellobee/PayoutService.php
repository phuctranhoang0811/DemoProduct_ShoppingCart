<?php

namespace App\Services\Hellobee;

use App\Models\HellobeeMember;
use App\Models\PayoutRequest;
use App\Services\Checkout\OrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayoutService
{
    /**
     * Reserves the amount from the member's balance until an admin decides the request.
     *
     * @param  array{amount: string|int|float, bank_name: string, bank_account_number: string, bank_account_name: string}  $data
     */
    public function request(HellobeeMember $member, array $data): PayoutRequest
    {
        return DB::transaction(function () use ($member, $data): PayoutRequest {
            $member = HellobeeMember::whereKey($member->id)->lockForUpdate()->firstOrFail();
            $cents = OrderService::toCents($data['amount']);
            $balance = OrderService::toCents($member->available_balance);

            if ($cents <= 0 || $cents > $balance) {
                throw ValidationException::withMessages(['amount' => 'The amount exceeds your available balance.']);
            }

            $member->update(['available_balance' => OrderService::toDecimal($balance - $cents)]);

            return $member->payoutRequests()->create([
                'amount' => OrderService::toDecimal($cents),
                'bank_name' => $data['bank_name'],
                'bank_account_number' => $data['bank_account_number'],
                'bank_account_name' => $data['bank_account_name'],
                'status' => 'PENDING',
                'requested_at' => now(),
            ]);
        });
    }

    /** Approves or rejects a pending request. A rejection returns the money to the balance. */
    public function decide(PayoutRequest $payout, string $status): PayoutRequest
    {
        return DB::transaction(function () use ($payout, $status): PayoutRequest {
            $payout = PayoutRequest::whereKey($payout->id)->lockForUpdate()->firstOrFail();

            if ($payout->status !== 'PENDING') {
                throw ValidationException::withMessages(['status' => 'This payout request has already been decided.']);
            }

            if ($status === 'REJECTED') {
                $member = HellobeeMember::whereKey($payout->member_id)->lockForUpdate()->firstOrFail();
                $member->update([
                    'available_balance' => OrderService::toDecimal(
                        OrderService::toCents($member->available_balance) + OrderService::toCents($payout->amount)
                    ),
                ]);
            }

            $payout->update(['status' => $status, 'processed_at' => now()]);

            return $payout;
        });
    }
}
