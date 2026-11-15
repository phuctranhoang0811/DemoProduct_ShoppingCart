<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $member = $this->hellobeeMember;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'status' => $this->status,
            'avatar' => $this->avatar,
            'sponsor_code' => $this->sponsor_code,
            'addresses' => $this->addresses->map(fn ($address) => [
                'id' => $address->id,
                'full_name' => $address->full_name,
                'phone' => $address->phone,
                'street' => $address->street,
                'ward' => $address->ward,
                'district' => $address->district,
                'city' => $address->city,
                'postal_code' => $address->postal_code,
                'country' => $address->country,
                'delivery_notes' => $address->delivery_notes,
                'is_default' => $address->is_default,
            ]),
            'hellobee_member' => $member ? [
                'id' => $member->public_id,
                'role' => $member->role,
                'referral_code' => $member->referral_code,
                'rank' => $member->rank,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
