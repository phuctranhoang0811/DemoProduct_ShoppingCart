<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = User::where('role', 'customer')
            ->with('addresses')
            ->withCount(['orders as total_orders' => fn ($q) => $q->where('status', '!=', 'Cancelled')])
            ->withSum(['orders as total_spent' => fn ($q) => $q->where('status', '!=', 'Cancelled')], 'total')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $customers->map(fn (User $user) => $this->present($user))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        // No password is set by staff: the customer chooses one through "forgot password".
        $user = User::create([...$data, 'password' => Str::random(40)]);
        AuditLog::record($request->user(), 'customer.created', 'User', $user->id, ['email' => $user->email]);

        return response()->json(['data' => $this->present($user->load('addresses'))], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        abort_unless($user->role === 'customer', 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        $user->fill(array_intersect_key($data, array_flip(['name', 'phone'])));
        if (isset($data['status'])) {
            $user->status = $data['status'];
        }
        $user->save();

        if ($user->status === 'inactive') {
            // A suspended account is signed out everywhere at once.
            $user->tokens()->delete();
        }

        AuditLog::record($request->user(), 'customer.updated', 'User', $user->id, ['fields' => array_keys($data)]);

        return response()->json(['data' => $this->present($user->load('addresses'))]);
    }

    /** @return array<string, mixed> */
    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'status' => $user->status,
            'sponsor_code' => $user->sponsor_code,
            'total_orders' => (int) ($user->total_orders ?? 0),
            'total_spent' => (float) ($user->total_spent ?? 0),
            'addresses' => $user->addresses->map(fn ($a) => [
                'id' => $a->id,
                'full_name' => $a->full_name,
                'phone' => $a->phone,
                'street' => $a->street,
                'ward' => $a->ward,
                'district' => $a->district,
                'city' => $a->city,
                'is_default' => $a->is_default,
            ]),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
