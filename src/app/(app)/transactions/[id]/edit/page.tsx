"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trxRes, catRes] = await Promise.all([
          api.get(`/api/transactions/${id}`),
          api.get("/api/categories"),
        ]);
        const trx = trxRes.data.data;
        setType(trx.type);
        setAmount(String(trx.amount));
        setCategoryId(String(trx.category_id ?? trx.category?.id ?? ""));
        setDescription(trx.description ?? "");
        setDate(trx.transaction_date ?? trx.transactionDate ?? "");
        setCategories(catRes.data.data ?? []);
      } catch (error) {
        toast.error("Transaksi tidak ditemukan");
        router.replace("/transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const availableCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (val: string) => {
    setAmount(val.replace(/\D/g, ""));
  };

  const formatDisplay = (val: string) =>
    val ? new Intl.NumberFormat("id-ID").format(Number(val)) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast.error("Pilih kategori"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Masukkan nominal yang valid"); return; }

    setSaving(true);
    try {
      await api.put(`/api/transactions/${id}`, {
        category_id: Number(categoryId),
        type,
        amount: Number(amount),
        description,
        transaction_date: date,
      });
      toast.success("Transaksi berhasil diperbarui!");
      router.push(`/transactions/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Gagal memperbarui transaksi");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <Link href={`/transactions/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-xl" id="btn-back-detail">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit Transaksi</h1>
          <p className="text-xs text-muted-foreground">ID #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up">
        {/* Type Tabs */}
        <Tabs value={type} onValueChange={(v) => { setType(v as "income" | "expense"); setCategoryId(""); }}>
          <TabsList className="w-full grid grid-cols-2 h-10">
            <TabsTrigger value="expense" id="tab-expense" className="text-sm">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger value="income" id="tab-income" className="text-sm">
              <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              Pemasukan
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-sm text-muted-foreground font-medium">Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-amount" className="text-sm">Nominal <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                <Input
                  id="edit-amount"
                  value={formatDisplay(amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-9"
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-category" className="text-sm">Kategori <span className="text-destructive">*</span></Label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">Pilih kategori...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-date" className="text-sm">Tanggal <span className="text-destructive">*</span></Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-sm">Catatan <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan catatan..."
                className="resize-none h-20 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={saving}
          className="w-full gradient-primary border-0 h-11"
          id="btn-save-edit"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}
