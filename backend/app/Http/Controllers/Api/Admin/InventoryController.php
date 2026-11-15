<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryController extends Controller
{
    public function index(): JsonResponse
    {
        $movements = InventoryMovement::with('product')->latest('moved_at')->latest('id')->limit(500)->get();

        return response()->json(['data' => $movements->map(fn (InventoryMovement $m) => [
            'id' => $m->id,
            'product_id' => $m->product?->public_id,
            'product_name' => $m->product_name,
            'variant_info' => $m->variant_info,
            'change' => $m->change,
            'previous_stock' => $m->previous_stock,
            'new_stock' => $m->new_stock,
            'reason' => $m->reason,
            'date' => $m->moved_at?->toIso8601String(),
        ])]);
    }

    public function adjust(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'string', 'exists:products,public_id'],
            'size' => ['required', 'string', 'max:255'],
            'change' => ['required', 'integer', 'not_in:0', 'between:-1000000,1000000'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $product = Product::where('public_id', $data['product_id'])->firstOrFail();

        $size = DB::transaction(function () use ($product, $data): ProductSize {
            $size = $product->sizes()->where('label', $data['size'])->lockForUpdate()->first();

            if (! $size) {
                throw ValidationException::withMessages(['size' => 'This product has no such option.']);
            }
            if ($size->stock + $data['change'] < 0) {
                throw ValidationException::withMessages(['change' => "Only {$size->stock} in stock; cannot remove more than that."]);
            }

            $previous = $size->stock;
            // Saved through the model so the storefront product page is refreshed.
            $size->update(['stock' => $previous + $data['change']]);

            InventoryMovement::create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'variant_info' => $size->label,
                'change' => $data['change'],
                'previous_stock' => $previous,
                'new_stock' => $size->stock,
                'reason' => $data['reason'],
                'moved_at' => now(),
            ]);

            return $size;
        });

        AuditLog::record($request->user(), 'inventory.adjusted', 'Product', $product->public_id, [
            'size' => $size->label, 'change' => $data['change'], 'reason' => $data['reason'],
        ]);

        return response()->json(['data' => ['product_id' => $product->public_id, 'size' => $size->label, 'stock' => $size->stock]]);
    }
}
