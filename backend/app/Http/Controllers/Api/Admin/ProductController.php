<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProductResource::collection(Product::withCatalogData()->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $product = DB::transaction(function () use ($data, $request): Product {
            $slug = $this->uniqueSlug($data['slug'] ?? $data['name']);
            $product = Product::create([...$this->attributes($data), 'slug' => $slug, 'public_id' => $slug]);
            $this->syncOptions($product, $data, $request);

            return $product;
        });

        AuditLog::record($request->user(), 'product.created', 'Product', $product->public_id, ['name' => $product->name]);

        return (new ProductResource($this->fresh($product)))->response()->setStatusCode(201);
    }

    public function update(Request $request, Product $product): ProductResource
    {
        $data = $this->validated($request, $product);

        DB::transaction(function () use ($product, $data, $request): void {
            $product->update([
                ...$this->attributes($data),
                ...(isset($data['slug']) ? ['slug' => $data['slug']] : []),
            ]);
            $this->syncOptions($product, $data, $request);
        });

        AuditLog::record($request->user(), 'product.updated', 'Product', $product->public_id, ['fields' => array_keys($data)]);

        return new ProductResource($this->fresh($product));
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        // Past orders keep their own snapshot of the product, so deleting it is safe for history.
        $product->delete();

        AuditLog::record($request->user(), 'product.deleted', 'Product', $product->public_id, ['name' => $product->name]);

        return response()->json(['message' => 'Product deleted.']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Product $product = null): array
    {
        $required = $product ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('products', 'slug')->ignore($product)],
            'sku' => [$required, 'string', 'max:64', Rule::unique('products', 'sku')->ignore($product)],
            'description' => [$required, 'string', 'max:10000'],
            'materials' => ['nullable', 'string', 'max:2000'],
            'details' => ['sometimes', 'array', 'max:50'],
            'details.*' => ['string', 'max:500'],
            'specifications' => ['nullable', 'array'],
            'price' => [$required, 'numeric', 'min:0', 'max:9999999'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'category_id' => [$required, 'string', Rule::exists('categories', 'public_id')],
            'status' => ['sometimes', Rule::in(['active', 'draft', 'out_of_stock'])],
            'featured' => ['sometimes', 'boolean'],
            'best_seller' => ['sometimes', 'boolean'],
            'new_arrival' => ['sometimes', 'boolean'],
            'sale' => ['sometimes', 'boolean'],
            'images' => ['sometimes', 'array', 'max:20'],
            'images.*' => ['string', 'url:http,https', 'max:2048'],
            'colors' => ['sometimes', 'array', 'max:30'],
            'colors.*.id' => ['nullable', 'string', 'max:64'],
            'colors.*.name' => ['required', 'string', 'max:255'],
            'colors.*.hex' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{3,8}$/'],
            'colors.*.image' => ['nullable', 'string', 'url:http,https', 'max:2048'],
            'sizes' => ['sometimes', 'array', 'max:30'],
            'sizes.*.id' => ['nullable', 'string', 'max:64'],
            'sizes.*.label' => ['required', 'string', 'max:255', 'distinct'],
            'sizes.*.stock' => ['required', 'integer', 'min:0', 'max:1000000'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        $attributes = array_intersect_key($data, array_flip([
            'name', 'sku', 'description', 'materials', 'details', 'specifications', 'price', 'original_price',
            'status', 'featured', 'best_seller', 'new_arrival', 'sale',
        ]));

        if (isset($data['category_id'])) {
            $attributes['category_id'] = Category::where('public_id', $data['category_id'])->value('id');
        }

        return $attributes;
    }

    /** @param  array<string, mixed>  $data */
    private function syncOptions(Product $product, array $data, Request $request): void
    {
        if (array_key_exists('images', $data)) {
            $product->images()->delete();
            foreach ($data['images'] as $position => $url) {
                $product->images()->create(['url' => $url, 'alt' => $product->name, 'position' => $position]);
            }
        }

        if (array_key_exists('colors', $data)) {
            $codes = [];
            foreach ($data['colors'] as $color) {
                $codes[] = $code = $color['id'] ?? 'c-'.Str::lower(Str::random(8));
                $product->colors()->updateOrCreate(['code' => $code], [
                    'name' => $color['name'],
                    'hex' => $color['hex'],
                    'image' => $color['image'] ?? null,
                ]);
            }
            $product->colors()->whereNotIn('code', $codes)->delete();
        }

        if (array_key_exists('sizes', $data)) {
            $codes = [];
            foreach ($data['sizes'] as $input) {
                $codes[] = $code = $input['id'] ?? 's-'.Str::lower(Str::random(8));
                $size = $product->sizes()->firstOrNew(['code' => $code]);
                $previous = $size->exists ? $size->stock : 0;
                $size->fill(['label' => $input['label'], 'stock' => $input['stock']])->save();

                // Stock typed into the product form is still a stock movement and is logged as one.
                if ($previous !== (int) $input['stock']) {
                    InventoryMovement::create([
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'variant_info' => $input['label'],
                        'change' => (int) $input['stock'] - $previous,
                        'previous_stock' => $previous,
                        'new_stock' => (int) $input['stock'],
                        'reason' => 'Edited in product form by '.$request->user()->name,
                        'moved_at' => now(),
                    ]);
                }
            }
            $product->sizes()->whereNotIn('code', $codes)->delete();
        }
    }

    private function uniqueSlug(string $source): string
    {
        $base = Str::slug($source) ?: 'product';
        $slug = $base;

        for ($i = 2; Product::where('slug', $slug)->orWhere('public_id', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    private function fresh(Product $product): Product
    {
        return Product::withCatalogData()->findOrFail($product->id);
    }
}
