import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { transaction_date: 'desc' },
      take: 5
    });

    // Current month stats
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        transaction_date: { gte: startOfMonth }
      },
      include: { category: true }
    });

    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    
    const categoryTotals: Record<number, { categoryId: number, categoryName: string, color: string, total: number }> = {};

    monthTransactions.forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        currentMonthIncome += amount;
      } else {
        currentMonthExpense += amount;
        
        // Expense breakdown
        const catId = tx.category_id || 0;
        const catName = tx.category?.name || "Lainnya";
        const catColor = tx.category?.color || "#888888";
        
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = { categoryId: catId, categoryName: catName, color: catColor, total: 0 };
        }
        categoryTotals[catId].total += amount;
      }
    });

    const categoryBreakdown = Object.values(categoryTotals).map(cat => ({
      ...cat,
      percentage: currentMonthExpense > 0 ? (cat.total / currentMonthExpense) * 100 : 0
    })).sort((a, b) => b.total - a.total);

    const netBalance = currentMonthIncome - currentMonthExpense;

    // Daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 29);
    
    const trendTransactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        transaction_date: { gte: thirtyDaysAgo }
      }
    });

    const dailyMap: Record<string, { date: string, income: number, expense: number }> = {};
    
    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }

    trendTransactions.forEach(tx => {
      const dateStr = tx.transaction_date.toISOString().split('T')[0];
      if (dailyMap[dateStr]) {
        if (tx.type === 'income') {
          dailyMap[dateStr].income += Number(tx.amount);
        } else {
          dailyMap[dateStr].expense += Number(tx.amount);
        }
      }
    });

    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      data: {
        currentMonthIncome,
        currentMonthExpense,
        netBalance,
        categoryBreakdown,
        dailyTrend,
        recentTransactions
      }
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
