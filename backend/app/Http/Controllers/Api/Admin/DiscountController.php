<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Discount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DiscountController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Discount::orderBy('id')->get()->map(fn (Discount $d) => $this->present($d))]);
    }

    public function store(Request $request): JsonResponse
    {
        $discount = Discount::create($this->validated($request));
        AuditLog::record($request->user(), 'discount.created', 'Discount', $discount->id, ['code' => $discount->code]);

        return response()->json(['data' => $this->present($discount)], 201);
    }

    public function update(Request $request, Discount $discount): JsonResponse
    {
        $data = $this->validated($request, $discount);
        $discount->update($data);
        AuditLog::record($request->user(), 'discount.updated', 'Discount', $discount->id, ['fields' => array_keys($data)]);

        return response()->json(['data' => $this->present($discount)]);
    }

    public function destroy(Request $request, Discount $discount): JsonResponse
    {
        $discount->delete();
        AuditLog::record($request->user(), 'discount.deleted', 'Discount', $discount->id, ['code' => $discount->code]);

        return response()->json(['message' => 'Discount deleted.']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Discount $discount = null): array
    {
        $required = $discount ? 'sometimes' : 'required';
        if ($request->has('code')) {
            $request->merge(['code' => Str::upper(trim((string) $request->input('code')))]);
        }

        return $request->validate([
            'code' => [$required, 'string', 'max:32', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('discounts', 'code')->ignore($discount)],
            'type' => [$required, Rule::in(['percentage', 'fixed'])],
            'value' => [$required, 'numeric', 'gt:0', 'max:9999999',
                Rule::when(($request->input('type') ?? $discount?->type) === 'percentage', ['max:100'])],
            'min_order_amount' => ['sometimes', 'numeric', 'min:0', 'max:9999999'],
            'max_discount' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_limit' => ['sometimes', 'integer', 'min:0', 'max:10000000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    /** @return array<string, mixed> */
    private function present(Discount $d): array
    {
        return [
            'id' => $d->id,
            'code' => $d->code,
            'type' => $d->type,
            'value' => (float) $d->value,
            'min_order_amount' => (float) $d->min_order_amount,
            'max_discount' => $d->max_discount === null ? null : (float) $d->max_discount,
            'starts_at' => $d->starts_at?->toIso8601String(),
            'ends_at' => $d->ends_at?->toIso8601String(),
            'usage_limit' => $d->usage_limit,
            'used_count' => $d->used_count,
            'is_active' => $d->is_active,
        ];
    }
}
