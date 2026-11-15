<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaxCalculation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Saved runs of the salary and tax calculator. The calculation itself happens in the storefront;
 * this only stores a signed-in user's own history, which nobody else can read.
 */
class TaxCalculationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->query('limit', 20), 1), 100);
        $records = TaxCalculation::where('user_id', $request->user()->id)->latest()->limit($limit)->get();

        return response()->json(['data' => $records->map(fn (TaxCalculation $c) => $this->present($c))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'country' => ['required', 'string', 'size:2'],
            'tax_year' => ['required', 'integer', 'between:2000,2100'],
            'income_type' => ['required', 'string', 'max:40'],
            'currency' => ['required', 'string', 'size:3'],
            'gross_income' => ['required', 'string', 'max:40'],
            'total_tax' => ['required', 'string', 'max:40'],
            'net_income' => ['required', 'string', 'max:40'],
            'effective_tax_rate' => ['required', 'string', 'max:20'],
            'rule_version' => ['required', 'string', 'max:64'],
            'status' => ['required', 'string', 'max:40'],
            'input_snapshot' => ['required', 'array'],
            'result_snapshot' => ['required', 'array'],
        ]);

        $record = TaxCalculation::create([...$data, 'user_id' => $request->user()->id]);

        return response()->json(['data' => $this->present($record)], 201);
    }

    public function show(Request $request, TaxCalculation $calculation): JsonResponse
    {
        abort_unless($calculation->user_id === $request->user()->id, 404);

        return response()->json(['data' => $this->present($calculation)]);
    }

    public function destroy(Request $request, TaxCalculation $calculation): JsonResponse
    {
        abort_unless($calculation->user_id === $request->user()->id, 404);

        $calculation->delete();

        return response()->json(['message' => 'Calculation removed.']);
    }

    /** @return array<string, mixed> */
    private function present(TaxCalculation $c): array
    {
        return [
            'id' => $c->id,
            'country' => $c->country,
            'tax_year' => $c->tax_year,
            'income_type' => $c->income_type,
            'currency' => $c->currency,
            'gross_income' => $c->gross_income,
            'total_tax' => $c->total_tax,
            'net_income' => $c->net_income,
            'effective_tax_rate' => $c->effective_tax_rate,
            'rule_version' => $c->rule_version,
            'status' => $c->status,
            'input_snapshot' => $c->input_snapshot,
            'result_snapshot' => $c->result_snapshot,
            'created_at' => $c->created_at?->toIso8601String(),
        ];
    }
}
