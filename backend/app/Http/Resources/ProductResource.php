<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'description' => $this->description,
            'materials' => $this->materials,
            'details' => $this->details ?? [],
            'specifications' => $this->specifications,
            'price' => (float) $this->price,
            'original_price' => $this->original_price === null ? null : (float) $this->original_price,
            'status' => $this->status,
            'featured' => $this->featured,
            'best_seller' => $this->best_seller,
            'new_arrival' => $this->new_arrival,
            'sale' => $this->sale,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => $this->images->pluck('url'),
            'colors' => $this->colors->map(fn ($color) => [
                'id' => $color->code,
                'name' => $color->name,
                'hex' => $color->hex,
                'image' => $color->image,
            ]),
            'sizes' => $this->sizes->map(fn ($size) => [
                'id' => $size->code,
                'label' => $size->label,
                'stock' => $size->stock,
            ]),
            'rating' => [
                'count' => (int) $this->approved_reviews_count,
                'average' => $this->approved_reviews_avg_rating === null
                    ? null
                    : round((float) $this->approved_reviews_avg_rating, 1),
            ],
            'reviews' => ReviewResource::collection($this->whenLoaded('approvedReviews')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
