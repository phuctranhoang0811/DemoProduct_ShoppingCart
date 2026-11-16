<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = Review::with('product')->latest()->limit(1000)->get();

        return response()->json(['data' => $reviews->map(fn (Review $r) => $this->present($r))]);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['approved', 'pending', 'hidden'])]]);

        // Saving through the model lets the catalog observer refresh the product page and its rating.
        $review->update($data);
        AuditLog::record($request->user(), 'review.moderated', 'Review', $review->id, $data);

        return response()->json(['data' => $this->present($review->load('product'))]);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $review->delete();
        AuditLog::record($request->user(), 'review.deleted', 'Review', $review->id);

        return response()->json(['message' => 'Review deleted.']);
    }

    /** @return array<string, mixed> */
    private function present(Review $r): array
    {
        return [
            'id' => $r->id,
            'product_id' => $r->product?->public_id,
            'product_name' => $r->product?->name,
            'customer_name' => $r->customer_name,
            'customer_email' => $r->customer_email,
            'rating' => $r->rating,
            'comment' => $r->comment,
            'status' => $r->status,
            'created_at' => $r->created_at?->toIso8601String(),
        ];
    }
}
