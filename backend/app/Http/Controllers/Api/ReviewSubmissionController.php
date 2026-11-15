<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class ReviewSubmissionController extends Controller
{
    /** Reviews are held for moderation and only appear once an administrator approves them. */
    public function store(Request $request, string $slug): JsonResponse
    {
        // Accepts the slug or the public id: the storefront knows products by either.
        $product = Product::active()
            ->where(fn ($query) => $query->where('slug', $slug)->orWhere('public_id', $slug))
            ->firstOrFail();

        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'string', 'email', 'max:255'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $email = Str::lower($data['customer_email']);
        $key = 'review:'.sha1($email.'|'.$product->id);
        abort_if(RateLimiter::tooManyAttempts($key, 1), 429, 'You have already reviewed this product recently.');
        RateLimiter::hit($key, 3600);

        $product->reviews()->create([
            ...$data,
            'customer_email' => $email,
            'user_id' => $request->user('sanctum')?->id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Thank you. Your review will appear once it has been approved.'], 201);
    }
}
