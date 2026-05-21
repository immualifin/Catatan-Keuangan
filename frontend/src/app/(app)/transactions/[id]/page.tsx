"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/data";
import { Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ScanLine,
  Pencil,
  Trash2,
  Calendar,
  Tag,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await api.get(`/api/transactions/${id}`);
        setTransaction(res.data.data);
      } catch (error) {
        toast.error("Transaksi tidak ditemukan");
        router.replace("/transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Hapus transaksi ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/transactions/${id}`);
      toast.success("Transaksi berhasil dihapus");
      router.replace("/transactions");
    } catch (error) {
      toast.error("Gagal menghapus transaksi");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const date = transaction.transaction_date || transaction.transactionDate || "";
  const formattedDate = date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(date))
    : "—";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <Link href="/transactions">
          <Button variant="ghost" size="icon" className="rounded-xl" id="btn-back-transactions">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Detail Transaksi</h1>
          <p className="text-xs text-muted-foreground">ID #{transaction.id}</p>
        </div>
      </div>

      {/* Amount Card */}
      <Card
        className={cn(
          "border-0 animate-fade-up",
          isIncome
            ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
            : "bg-rose-500/10 ring-1 ring-rose-500/20"
        )}
      >
        <CardContent className="pt-6 pb-6 text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3",
              isIncome ? "bg-emerald-500/20" : "bg-rose-500/20"
            )}
          >
            {transaction.category?.icon ?? (isIncome ? "💰" : "💸")}
          </div>
          <p
            className={cn(
              "text-3xl font-bold",
              isIncome ? "text-emerald-500" : "text-rose-400"
            )}
          >
            {isIncome ? "+" : "−"}{formatCurrency(transaction.amount)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                isIncome
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
              )}
            >
              {isIncome ? (
                <ArrowDownLeft className="w-3 h-3 mr-1" />
              ) : (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              )}
              {isIncome ? "Pemasukan" : "Pengeluaran"}
            </Badge>
            {transaction.source === "scan" && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                <ScanLine className="w-3 h-3 mr-1" />
                Scan Struk
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-border/60 animate-fade-up">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Informasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <Tag className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kategori</p>
              <p className="text-sm font-medium mt-0.5">
                {transaction.category?.icon} {transaction.category?.name ?? "—"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal</p>
              <p className="text-sm font-medium mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Description — only if exists */}
          {transaction.description && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="text-sm font-medium mt-0.5">{transaction.description}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 animate-fade-up">
        <Button
          variant="outline"
          className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
          id="btn-delete-transaction"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Hapus
        </Button>
        <Button
          className="flex-1 gradient-primary border-0"
          onClick={() => router.push(`/transactions/${id}/edit`)}
          id="btn-edit-transaction"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
}
