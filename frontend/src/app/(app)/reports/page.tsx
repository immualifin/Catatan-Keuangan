"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatShortDate } from "@/lib/data";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Download,
  FileText,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

type Period = "daily" | "weekly" | "monthly" | "custom";


function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; fill: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-muted-foreground">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span>{p.name}:</span>
            <span className="font-semibold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, trxRes] = await Promise.all([
          api.get("/api/dashboard"),
          api.get("/api/transactions"),
        ]);
        setStats(dashRes.data.data);
        setTransactions(trxRes.data.data);
      } catch (error) {
        toast.error("Gagal memuat data laporan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async (type: "pdf" | "csv") => {
    try {
      toast.info(`Menyiapkan file ${type.toUpperCase()}...`);
      const res = await api.get(`/api/reports/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-keuangan.${type}`);
      document.body.appendChild(link);
      link.click();
      toast.success(`Berhasil mengunduh ${type.toUpperCase()}`);
    } catch (e) {
      toast.error("Gagal mengunduh file");
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  const totalIncome = stats.currentMonthIncome;
  const totalExpense = stats.currentMonthExpense;
  const netBalance = stats.netBalance;

  // Bar chart data from daily trend
  const barData = stats.dailyTrend.slice(-14).map((d: any) => ({
    date: formatShortDate(d.date),
    Pemasukan: d.income,
    Pengeluaran: d.expense,
  }));


  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Laporan
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Analisis keuangan per periode</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            id="btn-export-csv"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-500" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            id="btn-export-pdf"
          >
            <FileText className="w-4 h-4 mr-1.5 text-rose-500" />
            PDF
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="border-border/60 animate-fade-up">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-muted-foreground">Periode</Label>
              <Select value={period} onValueChange={(v) => v && setPeriod(v as Period)}>
                <SelectTrigger className="h-10" id="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian (Hari ini)</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan (Mei 2026)</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dari</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 w-40"
                    id="start-date"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Sampai</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 w-40"
                    id="end-date"
                  />
                </div>
                <Button size="sm" className="gradient-primary border-0 h-10" id="btn-apply-filter">
                  Terapkan
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up">
        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <ArrowDownLeft className="w-4 h-4" />
              Total Pemasukan
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{transactions.filter(t => t.type === "income").length} transaksi</p>
        </div>
        <div className="rounded-2xl p-4 bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <ArrowUpRight className="w-4 h-4" />
              Total Pengeluaran
            </div>
          </div>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{transactions.filter(t => t.type === "expense").length} transaksi</p>
        </div>
        <div className="rounded-2xl p-4 bg-violet-500/10 border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 text-xs font-medium">
              <Wallet className="w-4 h-4" />
              Saldo Bersih
            </div>
          </div>
          <p className={`text-xl font-bold ${netBalance >= 0 ? "text-violet-600 dark:text-violet-400" : "text-rose-500"}`}>
            {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} total transaksi</p>
        </div>
      </div>

      {/* Charts & Table Tabs */}
      <Tabs defaultValue="charts" className="animate-fade-up">
        <TabsList>
          <TabsTrigger value="charts" id="tab-charts">
            <TrendingUp className="w-4 h-4 mr-2" />
            Grafik
          </TabsTrigger>
          <TabsTrigger value="table" id="tab-table">
            <FileText className="w-4 h-4 mr-2" />
            Detail Transaksi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4 mt-4">
          {/* Bar Chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Pemasukan vs Pengeluaran (14 Hari)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Pie */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="categoryName"
                    >
                      {stats.categoryBreakdown.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => formatCurrency(Number(v) || 0)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {stats.categoryBreakdown.map((cat: any) => (
                    <div key={cat.categoryId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm">{cat.categoryName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                          <span className="font-semibold">{formatCurrency(cat.total)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((trx) => (
                      <TableRow key={trx.id} id={`report-row-${trx.id}`}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {trx.transaction_date || trx.transactionDate || ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{trx.category?.icon}</span>
                            <span className="text-sm">{trx.category?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {trx.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={trx.source === "scan" ? "default" : "secondary"} className="text-xs">
                            {trx.source === "scan" ? "Scan" : "Manual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className={trx.type === "income" ? "text-emerald-500" : "text-rose-400"}>
                            {trx.type === "income" ? "+" : "-"}{formatCurrency(trx.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
