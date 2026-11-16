<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'category' => ['sometimes', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        $products = Product::query()
            ->active()
            ->withCatalogData()
            ->when(
                $filters['category'] ?? null,
                fn ($query, string $slug) => $query->whereRelation('category', 'slug', $slug),
            )
            ->orderBy('id')
            ->paginate($filters['per_page'] ?? 100);

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->active()
            ->withCatalogData()
            ->with('approvedReviews')
            ->where('slug', $slug)
            ->firstOrFail();

        return new ProductResource($product);
    }
}
