"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ScanLine,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Trash2,
  Edit3,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParsedReceipt } from "@/lib/types";
import { formatCurrency } from "@/lib/data";
import Image from "next/image";

type ScanStatus = "idle" | "uploading" | "ocr" | "parsing" | "done" | "error";

export default function ScanPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [receiptId, setReceiptId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<ParsedReceipt['items']>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editedStoreName, setEditedStoreName] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/categories")
      .then(res => setExpenseCategories((res.data.data || []).filter((c: any) => c.type === "expense")))
      .catch(() => {});
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus("uploading");

    try {
      // 1. Upload
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await api.post("/api/receipts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const id = uploadRes.data.data.id;
      setReceiptId(id);

      // 2. OCR / Process
      setStatus("ocr");
      const processRes = await api.post(`/api/receipts/${id}/process`);
      const parsedData = processRes.data.data;

      // 3. Parsing done
      setStatus("parsing");
      await new Promise((r) => setTimeout(r, 500)); // brief UX pause
      setStatus("done");
      setParsed(parsedData);
      setEditedItems(parsedData.items ?? []);
      setEditedStoreName(parsedData.store_name ?? "");
      setEditedDate(parsedData.receipt_date ?? "");
      toast.success("Struk berhasil diparsing!");
    } catch (error: any) {
      setStatus("error");
      const msg = error?.response?.data?.message || "Gagal memproses struk. Pastikan foto jelas dan coba lagi.";
      toast.error(msg);
      setErrorMsg(msg);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleReset = () => {
    setStatus("idle");
    setPreview(null);
    setParsed(null);
    setEditMode(false);
  };

  const handleConfirm = async () => {
    if (!receiptId) return;
    if (!categoryId) {
      toast.error("Pilih kategori pengeluaran terlebih dahulu");
      return;
    }
    const totalAmount = editedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (totalAmount <= 0) {
      toast.error("Total transaksi harus lebih dari 0");
      return;
    }
    toast.loading("Menyimpan transaksi...");
    try {
      await api.post(`/api/receipts/${receiptId}/confirm`, {
        category_id: Number(categoryId),
        store_name: editedStoreName,
        receipt_date: editedDate || new Date().toISOString().split("T")[0],
        total_amount: totalAmount,
        items: editedItems,
      });
      toast.dismiss();
      toast.success("Transaksi berhasil disimpan!");
      router.push("/transactions");
    } catch (error: any) {
      toast.dismiss();
      const msg = error?.response?.data?.message || "Gagal menyimpan transaksi";
      toast.error(msg);
    }
  };

  const statusSteps = [
    { key: "uploading", label: "Upload foto", icon: Upload },
    { key: "ocr", label: "Ekstrak teks (OCR)", icon: ScanLine },
    { key: "parsing", label: "AI parsing", icon: Loader2 },
    { key: "done", label: "Selesai", icon: CheckCircle2 },
  ];

  const stepOrder = ["uploading", "ocr", "parsing", "done"];
  const currentStep = stepOrder.indexOf(status);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-primary" />
          Scan Struk Belanja
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload foto struk, AI akan otomatis mengekstrak datanya
        </p>
      </div>

      {/* Upload Area */}
      {status === "idle" && (
        <Card className="border-border/60 animate-fade-up">
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              id="dropzone"
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
              `}
            >
              <input {...getInputProps()} id="file-upload" />
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold mb-1">
                {isDragActive ? "Lepas foto di sini" : "Upload foto struk"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop atau klik untuk memilih foto
              </p>
              <p className="text-xs text-muted-foreground">
                Format: JPEG, PNG, WebP · Maks. 10 MB
              </p>
              <Button size="sm" className="mt-4 gradient-primary border-0" id="btn-choose-file">
                <Upload className="w-4 h-4 mr-2" />
                Pilih File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing */}
      {status !== "idle" && status !== "done" && status !== "error" && (
        <Card className="border-border/60 animate-fade-up">
          <CardContent className="pt-6 pb-6">
            <div className="flex gap-6">
              {/* Preview */}
              {preview && (
                <div className="w-28 h-36 rounded-xl overflow-hidden border border-border flex-shrink-0 relative">
                  <Image src={preview} alt="Struk" fill className="object-cover" unoptimized />
                </div>
              )}
              {/* Steps */}
              <div className="flex-1 space-y-4">
                <p className="font-semibold text-sm">Memproses struk...</p>
                {statusSteps.map((step, i) => {
                  const stepIdx = stepOrder.indexOf(step.key);
                  const isActive = currentStep === stepIdx;
                  const isDone = currentStep > stepIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isDone
                          ? "bg-primary text-white"
                          : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isActive ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className={`text-sm ${isActive ? "font-medium text-foreground" : isDone ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {status === "done" && parsed && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="font-semibold">Hasil Parsing AI</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                id="btn-edit-result"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                {editMode ? "Selesai Edit" : "Edit"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
                id="btn-reset-scan"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Ulang
              </Button>
            </div>
          </div>

          {/* Store & Date */}
          <Card className="border-border/60">
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nama Toko</Label>
                  {editMode ? (
                    <Input
                      value={editedStoreName}
                      onChange={(e) => setEditedStoreName(e.target.value)}
                      className="h-9"
                      id="edit-store-name"
                    />
                  ) : (
                    <p className="font-medium text-sm">{editedStoreName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tanggal</Label>
                  {editMode ? (
                    <Input
                      type="date"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="h-9"
                      id="edit-receipt-date"
                    />
                  ) : (
                    <p className="font-medium text-sm">{editedDate}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Daftar Item</CardTitle>
                {editMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setEditedItems([...editedItems, { name: "", quantity: 1, price: 0 }])}
                    id="btn-add-item"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {editedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...editedItems];
                            newItems[i] = { ...item, name: e.target.value };
                            setEditedItems(newItems);
                          }}
                          className="flex-1 h-8 text-sm"
                          placeholder="Nama item"
                          id={`item-name-${i}`}
                        />
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editedItems];
                            newItems[i] = { ...item, quantity: Number(e.target.value) };
                            setEditedItems(newItems);
                          }}
                          className="w-14 h-8 text-sm text-center"
                          id={`item-qty-${i}`}
                        />
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...editedItems];
                            newItems[i] = { ...item, price: Number(e.target.value) };
                            setEditedItems(newItems);
                          }}
                          className="w-24 h-8 text-sm"
                          id={`item-price-${i}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setEditedItems(editedItems.filter((_, j) => j !== i))}
                          id={`btn-delete-item-${i}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-right">{formatCurrency(item.price * item.quantity)}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Total</p>
                <p className="font-bold text-lg">
                  {formatCurrency(editedItems.reduce((a, b) => a + b.price * b.quantity, 0))}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview image */}
          {preview && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border">
              <Image src={preview} alt="Foto struk" fill className="object-contain" unoptimized />
            </div>
          )}

          {/* Category Selector */}
          <Card className="border-border/60">
            <CardContent className="pt-4 pb-4">
              <Label htmlFor="select-scan-category" className="text-xs text-muted-foreground mb-2 block">
                Kategori Pengeluaran <span className="text-destructive">*</span>
              </Label>
              <select
                id="select-scan-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 text-foreground"
              >
                <option value="">Pilih kategori...</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/transactions/new?type=expense")}
              id="btn-manual-instead"
            >
              Input Manual
            </Button>
            <Button
              className="flex-1 gradient-primary border-0 hover:opacity-90"
              onClick={handleConfirm}
              id="btn-confirm-scan"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Simpan Transaksi
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <Card className="border-destructive/50 bg-destructive/5 animate-fade-up">
          <CardContent className="pt-6 pb-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Gagal memproses struk</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {errorMsg || "Foto tidak terbaca dengan baik. Coba foto ulang dengan pencahayaan yang lebih baik."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleReset} id="btn-retry-scan">Coba Lagi</Button>
              <Link href="/transactions/new?type=expense" className={buttonVariants({ className: "gradient-primary border-0" })} id="btn-fallback-manual">
                Input Manual
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
