"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function NewTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") as "income" | "expense" | null;

  const [type, setType] = useState<"income" | "expense">(defaultType ?? "expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategories(res.data.data);
      } catch (e) {}
    };
    fetchCategories();
  }, []);

  const availableCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (val: string) => {
    // Allow only numeric input
    const num = val.replace(/\D/g, "");
    setAmount(num);
  };

  const formatDisplayAmount = (val: string) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(Number(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Pilih kategori terlebih dahulu");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Masukkan nominal yang valid");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/transactions", {
        category_id: categoryId,
        type,
        amount: Number(amount),
        description,
        transaction_date: date,
      });
      toast.success("Transaksi berhasil ditambahkan!");
      router.push("/transactions");
    } catch (error) {
      toast.error("Gagal menambahkan transaksi");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-xl" })} id="btn-back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Tambah Transaksi</h1>
          <p className="text-muted-foreground text-sm">Catat pemasukan atau pengeluaran</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up" id="new-transaction-form">
        {/* Type Tabs */}
        <Tabs value={type} onValueChange={(v) => { setType(v as "income" | "expense"); setCategoryId(""); }}>
          <TabsList className="w-full h-12">
            <TabsTrigger value="expense" className="flex-1 gap-2 data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-500" id="tab-expense">
              <ArrowUpRight className="w-4 h-4" />
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger value="income" className="flex-1 gap-2 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500" id="tab-income">
              <ArrowDownLeft className="w-4 h-4" />
              Pemasukan
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Amount */}
        <Card className="border-border/60">
          <CardContent className="pt-5 pb-5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nominal (IDR)</Label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">
                Rp
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatDisplayAmount(amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-12 h-14 text-2xl font-bold border-0 bg-transparent shadow-none focus-visible:ring-0"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Detail Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger id="category" className="h-11">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.icon} {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Catatan (opsional)</Label>
              <Textarea
                id="description"
                placeholder="Tambahkan catatan tentang transaksi ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Amounts */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Nominal cepat:</p>
          <div className="flex flex-wrap gap-2">
            {[10000, 25000, 50000, 100000, 500000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                id={`quick-amount-${v}`}
              >
                {formatDisplayAmount(String(v))}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 gradient-primary border-0 hover:opacity-90 transition-opacity"
          disabled={loading}
          id="btn-save-transaction"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Simpan Transaksi
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense>
      <NewTransactionForm />
    </Suspense>
  );
}
