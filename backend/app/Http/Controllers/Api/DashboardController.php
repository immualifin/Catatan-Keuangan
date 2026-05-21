<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $now->copy()->endOfMonth()->format('Y-m-d');

        // Current Month Totals
        $currentMonthIncome = Transaction::forUser($user->id)
            ->income()
            ->inPeriod($startOfMonth, $endOfMonth)
            ->sum('amount');

        $currentMonthExpense = Transaction::forUser($user->id)
            ->expense()
            ->inPeriod($startOfMonth, $endOfMonth)
            ->sum('amount');

        $netBalance = $currentMonthIncome - $currentMonthExpense;

        // Category Breakdown for current month (expenses only)
        $categoryBreakdown = Transaction::forUser($user->id)
            ->expense()
            ->inPeriod($startOfMonth, $endOfMonth)
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(function ($item) use ($currentMonthExpense) {
                return [
                    'categoryId'   => $item->category_id,
                    'categoryName' => $item->category->name,
                    'color'        => $item->category->color,
                    'total'        => (int) $item->total,
                    'percentage'   => $currentMonthExpense > 0 
                                        ? round(($item->total / $currentMonthExpense) * 100, 1) 
                                        : 0,
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->toArray();

        // 30 Day Daily Trend
        $thirtyDaysAgo = $now->copy()->subDays(29)->format('Y-m-d');
        $today = $now->format('Y-m-d');

        $dailyStats = Transaction::forUser($user->id)
            ->inPeriod($thirtyDaysAgo, $today)
            ->select(
                'transaction_date',
                DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
            )
            ->groupBy('transaction_date')
            ->get()
            ->keyBy('transaction_date');

        $dailyTrend = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $stat = $dailyStats->get($date);
            $dailyTrend[] = [
                'date'    => $date,
                'income'  => $stat ? (int) $stat->income : 0,
                'expense' => $stat ? (int) $stat->expense : 0,
            ];
        }

        // Recent Transactions (Limit 10)
        $recentTransactions = Transaction::forUser($user->id)
            ->with('category')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($t) {
                return [
                    'id'               => $t->id,
                    'category'         => [
                        'id'    => $t->category->id,
                        'name'  => $t->category->name,
                        'color' => $t->category->color,
                        'icon'  => $t->category->icon,
                    ],
                    'type'             => $t->type,
                    'amount'           => $t->amount,
                    'description'      => $t->description,
                    'transaction_date' => $t->transaction_date->format('Y-m-d'),
                    'source'           => $t->source,
                ];
            });

        return response()->json([
            'data' => [
                'currentMonthIncome'  => $currentMonthIncome,
                'currentMonthExpense' => $currentMonthExpense,
                'netBalance'          => $netBalance,
                'categoryBreakdown'   => $categoryBreakdown,
                'dailyTrend'          => $dailyTrend,
                'recentTransactions'  => $recentTransactions,
            ]
        ]);
    }
}
