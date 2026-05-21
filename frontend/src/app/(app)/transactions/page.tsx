"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/data";
import { Transaction } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { TransactionList } from "@/components/shared/TransactionList";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Filter, ArrowDownLeft, ArrowUpRight, ScanLine } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trxRes, catRes] = await Promise.all([
          api.get("/api/transactions"),
          api.get("/api/categories")
        ]);
        setTransactions(trxRes.data.data);
        setCategories(catRes.data.data);
      } catch (error) {
        toast.error("Gagal memuat data transaksi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = transactions.filter((trx) => {
    const matchSearch =
      !search ||
      trx.description?.toLowerCase().includes(search.toLowerCase()) ||
      trx.category?.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || trx.type === typeFilter;
    const matchCat = categoryFilter === "all" || trx.category?.id == categoryFilter;
    return matchSearch && matchType && matchCat;
  }).sort((a, b) => {
    const dateA = a.transaction_date || a.transactionDate || "";
    const dateB = b.transaction_date || b.transactionDate || "";
    if (sortBy === "date-desc") return new Date(dateB).getTime() - new Date(dateA).getTime();
    if (sortBy === "date-asc") return new Date(dateA).getTime() - new Date(dateB).getTime();
    if (sortBy === "amount-desc") return b.amount - a.amount;
    if (sortBy === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {transactions.length} transaksi tercatat
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/scan" className={buttonVariants({ variant: "outline", size: "sm" })} id="btn-scan-receipt">
            <ScanLine className="w-4 h-4 mr-1.5" />
            Scan Struk
          </Link>
          <Link href="/transactions/new" className={buttonVariants({ size: "sm", className: "gradient-primary border-0" })} id="btn-new-transaction">
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pemasukan</span>
          </div>
          <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-xl p-4 bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Pengeluaran</span>
          </div>
          <p className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/60 animate-fade-up">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-transactions"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
                <SelectTrigger className="h-9 w-36" id="filter-type">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
                <SelectTrigger className="h-9 w-40" id="filter-category">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                <SelectTrigger className="h-9 w-36" id="sort-by">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Terbaru</SelectItem>
                  <SelectItem value="date-asc">Terlama</SelectItem>
                  <SelectItem value="amount-desc">Nominal Terbesar</SelectItem>
                  <SelectItem value="amount-asc">Nominal Terkecil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(typeFilter !== "all" || categoryFilter !== "all" || search) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter aktif:
              </span>
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setTypeFilter("all")}>
                  {typeFilter === "income" ? "Pemasukan" : "Pengeluaran"} ×
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setCategoryFilter("all")}>
                  {categories.find((c) => String(c.id) === categoryFilter)?.name} ×
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSearch("")}>
                  "{search}" ×
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">({filtered.length} hasil)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-border/60 animate-fade-up">
        <CardContent className="pt-4">
          <TransactionList
            transactions={filtered}
            emptyMessage="Tidak ada transaksi yang cocok dengan filter"
          />
        </CardContent>
      </Card>
    </div>
  );
}
