<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::where('status', 'active')->orderBy('id')->get()
        );
    }

    public function show(Category $category): CategoryResource
    {
        abort_unless($category->status === 'active', 404);

        return new CategoryResource($category);
    }
}
