<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommissionTransaction;
use App\Models\HellobeeMember;
use App\Models\PayoutRequest;
use App\Services\Hellobee\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class HellobeeController extends Controller
{
    /** Public check used at checkout. Reveals only a display name for a code the buyer already has. */
    public function referralCode(string $code): JsonResponse
    {
        $member = HellobeeMember::where('referral_code', Str::upper(trim($code)))->where('is_active', true)->first();

        abort_unless($member, 404, 'Referral code not found.');

        return response()->json(['data' => ['referral_code' => $member->referral_code, 'name' => $member->name, 'role' => $member->role, 'rank' => $member->rank]]);
    }

    /**
     * Network data in the caller's scope: admins see everything; a member sees themselves,
     * their owner, the people they brought in or supervise, and their own money.
     */
    public function network(Request $request): JsonResponse
    {
        $user = $request->user();
        $self = $user->hellobeeMember;

        if ($user->hasRole('admin')) {
            $members = HellobeeMember::orderBy('id')->get();
            $commissions = CommissionTransaction::with('beneficiary')->latest()->limit(500)->get();
            $payouts = PayoutRequest::with('member')->latest('requested_at')->limit(500)->get();
        } else {
            abort_unless($self, 403, 'You are not a network member.');

            $members = HellobeeMember::whereKey([$self->id, ...$this->downlineIds($self)])
                ->orWhere('owner_id', $self->id)
                ->orderBy('id')
                ->get();
            $commissions = $self->commissions()->with('beneficiary')->latest()->limit(500)->get();
            $payouts = $self->payoutRequests()->with('member')->latest('requested_at')->get();
        }

        $publicIds = HellobeeMember::whereIn('id', $members->pluck('referred_by_id')->merge($members->pluck('owner_id'))->filter()->unique())
            ->pluck('public_id', 'id');
        $full = fn (HellobeeMember $m) => $user->hasRole('admin') || $m->id === $self?->id;

        return response()->json([
            'self_id' => $self?->public_id,
            'members' => $members->map(fn (HellobeeMember $m) => $this->member($m, $publicIds, $full($m))),
            'commissions' => $commissions->map(fn (CommissionTransaction $c) => [
                'id' => "comm-{$c->id}",
                'order_number' => $c->order_number,
                'order_amount' => (float) $c->order_amount,
                'buyer_name' => $c->buyer_name,
                'beneficiary_id' => $c->beneficiary->public_id,
                'beneficiary_name' => $c->beneficiary->name,
                'beneficiary_role' => $c->beneficiary->role,
                'commission_type' => $c->commission_type,
                'rate' => (float) $c->rate,
                'amount' => (float) $c->amount,
                'status' => $c->status,
                'notes' => $c->notes,
                'created_at' => $c->created_at?->toIso8601String(),
            ]),
            'payouts' => $payouts->map(fn (PayoutRequest $p) => $this->payout($p)),
        ]);
    }

    public function requestPayout(Request $request, PayoutService $payouts): JsonResponse
    {
        $member = $request->user()->hellobeeMember;
        abort_unless($member && $member->is_active, 403, 'You are not a network member.');

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:1000000'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_number' => ['required', 'string', 'min:4', 'max:64'],
            'bank_account_name' => ['required', 'string', 'max:255'],
        ]);

        return response()->json(['data' => $this->payout($payouts->request($member, $data)->load('member'))], 201);
    }

    public function decidePayout(Request $request, PayoutRequest $payout, PayoutService $payouts): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['APPROVED', 'REJECTED'])]]);

        return response()->json(['data' => $this->payout($payouts->decide($payout, $data['status'])->load('member'))]);
    }

    /**
     * Everyone below a member in the tree of introductions, at any depth.
     *
     * @return list<int>
     */
    private function downlineIds(HellobeeMember $root): array
    {
        $children = [];
        foreach (HellobeeMember::whereNotNull('referred_by_id')->get(['id', 'referred_by_id']) as $row) {
            $children[$row->referred_by_id][] = $row->id;
        }

        $found = [];
        $queue = [$root->id];
        while ($queue) {
            foreach ($children[array_shift($queue)] ?? [] as $childId) {
                if (! isset($found[$childId]) && $childId !== $root->id) {
                    $found[$childId] = true;
                    $queue[] = $childId;
                }
            }
        }

        return array_keys($found);
    }

    /**
     * @param  Collection<int, string>  $publicIds
     * @return array<string, mixed>
     */
    private function member(HellobeeMember $m, Collection $publicIds, bool $full): array
    {
        return [
            'id' => $m->public_id,
            'name' => $m->name,
            'role' => $m->role,
            'referral_code' => $m->referral_code,
            'referred_by_id' => $publicIds[$m->referred_by_id] ?? null,
            'owner_id' => $publicIds[$m->owner_id] ?? null,
            'rank' => $m->rank,
            'valid_orders_count' => $m->valid_orders_count,
            'personal_sales_volume' => (float) $m->personal_sales_volume,
            'network_sales_volume' => (float) $m->network_sales_volume,
            'direct_invite_count' => $m->direct_invite_count,
            'has_purchased_filtration_device' => $m->has_purchased_filtration_device,
            'is_active' => $m->is_active,
            'avatar_url' => $m->avatar_url,
            'created_at' => $m->created_at?->toIso8601String(),
            // Contact details and money are for the member themselves and admins only.
            'email' => $full ? $m->email : null,
            'phone' => $full ? $m->phone : null,
            'total_commission_earned' => $full ? (float) $m->total_commission_earned : null,
            'available_balance' => $full ? (float) $m->available_balance : null,
        ];
    }

    /** @return array<string, mixed> */
    private function payout(PayoutRequest $p): array
    {
        return [
            'id' => "payout-{$p->id}",
            'member_id' => $p->member->public_id,
            'member_name' => $p->member->name,
            'member_role' => $p->member->role,
            'amount' => (float) $p->amount,
            'bank_name' => $p->bank_name,
            'bank_account_number' => '•••• '.substr(preg_replace('/\D/', '', (string) $p->bank_account_number), -4),
            'bank_account_name' => $p->bank_account_name,
            'status' => $p->status,
            'requested_at' => $p->requested_at?->toIso8601String(),
            'processed_at' => $p->processed_at?->toIso8601String(),
        ];
    }
}
