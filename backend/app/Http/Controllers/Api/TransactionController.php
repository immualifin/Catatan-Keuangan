<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::forUser($request->user()->id)->with('category');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($month = $request->query('month')) {
            // Expected format: YYYY-MM
            $parts = explode('-', $month);
            if (count($parts) === 2) {
                $query->inMonth((int) $parts[0], (int) $parts[1]);
            }
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'data' => $transactions->map(fn ($t) => $this->resource($t)),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'      => ['required', 'exists:categories,id'],
            'type'             => ['required', 'in:income,expense'],
            'amount'           => ['required', 'integer', 'min:1'],
            'description'      => ['nullable', 'string', 'max:500'],
            'transaction_date' => ['required', 'date_format:Y-m-d'],
            'source'           => ['sometimes', 'in:manual,scan'],
        ]);

        // Ensure category belongs to user
        $category = $request->user()->categories()->findOrFail($data['category_id']);

        // Type mismatch check
        if ($category->type !== $data['type']) {
            return response()->json(['message' => 'Tipe transaksi tidak cocok dengan kategori.'], 422);
        }

        $transaction = Transaction::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'source'  => $data['source'] ?? 'manual',
        ]));

        return response()->json(['data' => $this->resource($transaction->load('category'))], 201);
    }

    public function show(Request $request, Transaction $transaction)
    {
        $this->authorise($request, $transaction);
        return response()->json(['data' => $this->resource($transaction->load('category'))]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorise($request, $transaction);

        $data = $request->validate([
            'category_id'      => ['sometimes', 'exists:categories,id'],
            'type'             => ['sometimes', 'in:income,expense'],
            'amount'           => ['sometimes', 'integer', 'min:1'],
            'description'      => ['nullable', 'string', 'max:500'],
            'transaction_date' => ['sometimes', 'date_format:Y-m-d'],
        ]);

        if (isset($data['category_id'])) {
            $category = $request->user()->categories()->findOrFail($data['category_id']);
            $type = $data['type'] ?? $transaction->type;
            if ($category->type !== $type) {
                return response()->json(['message' => 'Tipe transaksi tidak cocok dengan kategori.'], 422);
            }
        }

        $transaction->update($data);

        return response()->json(['data' => $this->resource($transaction->fresh('category'))]);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        $this->authorise($request, $transaction);
        $transaction->delete();
        return response()->json(null, 204);
    }

    private function authorise(Request $request, Transaction $transaction): void
    {
        abort_if($transaction->user_id !== $request->user()->id, 403);
    }

    private function resource(Transaction $t): array
    {
        return [
            'id'               => $t->id,
            'category_id'      => $t->category_id,
            'category'         => $t->relationLoaded('category') ? [
                'id'    => $t->category->id,
                'name'  => $t->category->name,
                'color' => $t->category->color,
                'icon'  => $t->category->icon,
                'type'  => $t->category->type,
            ] : null,
            'type'             => $t->type,
            'amount'           => $t->amount,
            'description'      => $t->description,
            'transaction_date' => $t->transaction_date->format('Y-m-d'),
            'source'           => $t->source,
            'created_at'       => $t->created_at,
        ];
    }
}
