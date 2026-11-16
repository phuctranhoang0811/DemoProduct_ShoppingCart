<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    public function updateProfile(Request $request): UserResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        $user = $request->user();
        $user->fill([
            'name' => trim($data['name']),
            'phone' => isset($data['phone']) ? trim((string) $data['phone']) : $user->phone,
        ])->save();

        return new UserResource($user->fresh(['addresses', 'hellobeeMember']));
    }

    public function storeAddress(Request $request): JsonResponse
    {
        $data = $this->validatedAddress($request);
        $user = $request->user();

        DB::transaction(function () use ($user, $data): void {
            $isDefault = (bool) ($data['is_default'] ?? false) || ! $user->addresses()->exists();
            if ($isDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            $user->addresses()->create([...$data, 'is_default' => $isDefault]);
        });

        return (new UserResource($user->fresh(['addresses', 'hellobeeMember'])))->response()->setStatusCode(201);
    }

    public function updateAddress(Request $request, Address $address): UserResource
    {
        $user = $request->user();
        abort_unless($address->user_id === $user->id, 404);

        $data = $this->validatedAddress($request);

        DB::transaction(function () use ($user, $address, $data): void {
            $isDefault = (bool) ($data['is_default'] ?? $address->is_default);
            if ($isDefault) {
                $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            }

            $address->update([...$data, 'is_default' => $isDefault]);
        });

        return new UserResource($user->fresh(['addresses', 'hellobeeMember']));
    }

    public function destroyAddress(Request $request, Address $address): UserResource
    {
        $user = $request->user();
        abort_unless($address->user_id === $user->id, 404);

        DB::transaction(function () use ($user, $address): void {
            $wasDefault = $address->is_default;
            $address->delete();

            if ($wasDefault) {
                $next = $user->addresses()->latest('id')->first();
                $next?->update(['is_default' => true]);
            }
        });

        return new UserResource($user->fresh(['addresses', 'hellobeeMember']));
    }

    public function setDefaultAddress(Request $request, Address $address): UserResource
    {
        $user = $request->user();
        abort_unless($address->user_id === $user->id, 404);

        DB::transaction(function () use ($user, $address): void {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return new UserResource($user->fresh(['addresses', 'hellobeeMember']));
    }

    /** @return array<string, mixed> */
    private function validatedAddress(Request $request): array
    {
        return $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'street' => ['required', 'string', 'max:255'],
            'ward' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:32'],
            'country' => ['nullable', 'string', 'max:100'],
            'delivery_notes' => ['nullable', 'string', 'max:500'],
            'is_default' => ['sometimes', 'boolean'],
        ]);
    }
}
