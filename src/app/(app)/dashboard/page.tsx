"use client";

import { MOCK_DASHBOARD_STATS, formatCurrency, formatShortDate } from "@/lib/data";
import { StatCard } from "@/components/shared/StatCard";
import { TransactionList } from "@/components/shared/TransactionList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl text-xs">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/dashboard");
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Static label - avoids SSR/client hydration mismatch
  const currentMonth = "Bulan Ini";

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const dailyData = stats.dailyTrend.map((d: any) => ({
    ...d,
    date: formatShortDate(d.date),
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{currentMonth}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions/new?type=expense" className={buttonVariants({ variant: "outline", size: "sm" })} id="btn-add-expense">
            <ArrowUpRight className="w-4 h-4 mr-1.5 text-rose-500" />
            Pengeluaran
          </Link>
          <Link href="/transactions/new?type=income" className={buttonVariants({ size: "sm", className: "gradient-primary border-0 hover:opacity-90" })} id="btn-add-income">
            <Plus className="w-4 h-4 mr-1" />
            Pemasukan
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        <StatCard
          title="Saldo Bersih"
          value={formatCurrency(stats.netBalance)}
          subtitle="Bulan ini"
          icon={Wallet}
          gradient="gradient-balance"
          trend={{ value: 12, label: "dari bulan lalu" }}
        />
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(stats.currentMonthIncome)}
          subtitle="Bulan ini"
          icon={ArrowDownLeft}
          gradient="gradient-income"
          trend={{ value: 5.2, label: "dari bulan lalu" }}
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(stats.currentMonthExpense)}
          subtitle="Bulan ini"
          icon={ArrowUpRight}
          gradient="gradient-expense"
          trend={{ value: -8, label: "dari bulan lalu" }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Area Chart */}
        <Card className="lg:col-span-3 animate-fade-up border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Tren 30 Hari Terakhir
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Pemasukan
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                Pengeluaran
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="lg:col-span-2 animate-fade-up border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Pengeluaran per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="total"
                  nameKey="categoryName"
                >
                  {stats.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {stats.categoryBreakdown.slice(0, 4).map((cat: any) => (
                <div key={cat.categoryId} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs text-muted-foreground flex-1 truncate">
                    {cat.categoryName}
                  </span>
                  <span className="text-xs font-medium">{cat.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="animate-fade-up border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
            <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary text-xs" })} id="btn-see-all-transactions">
              Lihat semua <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={stats.recentTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
