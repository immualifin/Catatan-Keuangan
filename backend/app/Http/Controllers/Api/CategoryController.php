<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type'); // income | expense | null (all)

        $categories = Category::forUser($request->user()->id)
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => $this->resource($c));

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:100'],
            'type'  => ['required', 'in:income,expense'],
            'color' => ['required', 'string', 'max:20'],
            'icon'  => ['required', 'string', 'max:10'],
        ]);

        $category = Category::create(array_merge($data, [
            'user_id'    => $request->user()->id,
            'is_default' => false,
        ]));

        return response()->json(['data' => $this->resource($category)], 201);
    }

    public function update(Request $request, Category $category)
    {
        $this->authorise($request, $category);

        $data = $request->validate([
            'name'  => ['sometimes', 'string', 'max:100'],
            'color' => ['sometimes', 'string', 'max:20'],
            'icon'  => ['sometimes', 'string', 'max:10'],
        ]);

        $category->update($data);

        return response()->json(['data' => $this->resource($category->fresh())]);
    }

    public function destroy(Request $request, Category $category)
    {
        $this->authorise($request, $category);

        if ($category->is_default) {
            return response()->json(['message' => 'Kategori default tidak bisa dihapus.'], 422);
        }

        if ($category->transactions()->exists()) {
            return response()->json([
                'message' => 'Kategori ini masih memiliki transaksi dan tidak bisa dihapus.',
            ], 422);
        }

        $category->delete();
        return response()->json(null, 204);
    }

    private function authorise(Request $request, Category $category): void
    {
        abort_if($category->user_id !== $request->user()->id, 403);
    }

    private function resource(Category $c): array
    {
        return [
            'id'         => $c->id,
            'name'       => $c->name,
            'type'       => $c->type,
            'color'      => $c->color,
            'icon'       => $c->icon,
            'is_default' => $c->is_default,
        ];
    }
}
