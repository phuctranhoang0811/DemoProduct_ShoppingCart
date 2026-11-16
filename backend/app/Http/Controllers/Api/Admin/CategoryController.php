<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\AuditLog;
use App\Models\Category;
use App\Support\MediaPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(Category::orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] ??= Str::slug($data['name']);

        abort_if(Category::where('slug', $data['slug'])->orWhere('public_id', $data['slug'])->exists(), 422, 'A category with this slug already exists.');

        $category = Category::create([...$data, 'public_id' => $data['slug']]);
        AuditLog::record($request->user(), 'category.created', 'Category', $category->public_id, ['name' => $category->name]);

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(Request $request, Category $category): CategoryResource
    {
        $data = $this->validated($request, $category);
        $category->update($data);
        AuditLog::record($request->user(), 'category.updated', 'Category', $category->public_id, ['fields' => array_keys($data)]);

        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        abort_if($category->products()->exists(), 422, 'Move or delete the products in this category first.');

        $category->delete();
        AuditLog::record($request->user(), 'category.deleted', 'Category', $category->public_id, ['name' => $category->name]);

        return response()->json(['message' => 'Category deleted.']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'name' => [$category ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('categories', 'slug')->ignore($category)],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'string', MediaPath::urlOrSitePath()],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);
    }
}
