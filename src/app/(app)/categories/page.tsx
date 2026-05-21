"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

const EMOJIS = ["🍔", "🚗", "🛍️", "💊", "🎬", "📚", "💡", "📦", "💼", "💻", "📈", "🎁", "💰", "🏠", "✈️", "🎮", "👗", "🐾", "☕", "🎵"];
const COLORS = ["#f97316", "#3b82f6", "#a855f7", "#22c55e", "#ec4899", "#14b8a6", "#f59e0b", "#6b7280", "#10b981", "#8b5cf6", "#0ea5e9", "#f43f5e"];

function CategoryCard({ category, onEdit, onDelete }: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  // All categories from API are user-owned and can be edited/deleted
  const isCustom = true;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: category.color + "20" }}
      >
        {category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{category.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
          <span className="text-xs text-muted-foreground">{category.color}</span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          id={`cat-menu-${category.id}`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)} id={`cat-edit-${category.id}`}>
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(category.id)}
            disabled={!isCustom}
            id={`cat-delete-${category.id}`}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Hapus {!isCustom && "(default)"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CategoryForm({
  category,
  onSave,
  onClose,
}: {
  category?: Category;
  onSave: (c: Omit<Category, "id">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "📦");
  const [color, setColor] = useState(category?.color ?? "#6b7280");
  const [type, setType] = useState<"income" | "expense">(category?.type ?? "expense");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    onSave({ name: name.trim(), icon, color, type });
    onClose();
    toast.success(category ? "Kategori diperbarui!" : "Kategori ditambahkan!");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipe</Label>
        <div className="flex gap-2">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              id={`type-btn-${t}`}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                type === t
                  ? t === "expense"
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
                    : "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {t === "expense" ? (
                <span className="flex items-center justify-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Pengeluaran
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Pemasukan
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-name">Nama Kategori</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori..."
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label>Ikon</Label>
        <div className="grid grid-cols-10 gap-1.5">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setIcon(e)}
              className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                icon === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"
              }`}
              id={`emoji-${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-lg transition-all ${
                color === c ? "ring-2 ring-offset-2 ring-ring scale-110" : "hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              id={`color-${c}`}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border p-3 flex items-center gap-3 bg-muted/30">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: color + "30" }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{name || "Nama kategori"}</p>
          <p className="text-xs text-muted-foreground">{type === "expense" ? "Pengeluaran" : "Pemasukan"}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onClose} id="btn-cancel-cat">
          Batal
        </Button>
        <Button className="flex-1 gradient-primary border-0" onClick={handleSave} id="btn-save-cat">
          {category ? "Simpan Perubahan" : "Tambah Kategori"}
        </Button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | undefined>(undefined);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const handleSave = async (data: Omit<Category, "id">) => {
    try {
      if (editTarget) {
        const res = await api.put(`/api/categories/${editTarget.id}`, data);
        setCategories((prev) =>
          prev.map((c) => (c.id === editTarget.id ? res.data.data : c))
        );
        toast.success("Kategori diperbarui");
      } else {
        const res = await api.post("/api/categories", data);
        setCategories((prev) => [...prev, res.data.data]);
        toast.success("Kategori ditambahkan");
      }
      setEditTarget(undefined);
    } catch (error) {
      toast.error("Gagal menyimpan kategori");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditTarget(cat);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori dihapus");
    } catch (error) {
      toast.error("Gagal menghapus kategori");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold">Kategori</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {categories.length} kategori
          </p>
        </div>
        <Button
          size="sm"
          className="gradient-primary border-0"
          id="btn-add-category"
          onClick={() => { setEditTarget(undefined); setDialogOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Tambah
        </Button>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditTarget(undefined); }}>
          <DialogContent id="category-dialog">
            <DialogHeader>
              <DialogTitle>{editTarget ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editTarget}
              onSave={handleSave}
              onClose={() => { setDialogOpen(false); setEditTarget(undefined); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expense" className="animate-fade-up">
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1 gap-2" id="tab-expense-categories">
            <ArrowUpRight className="w-4 h-4" />
            Pengeluaran ({expenseCategories.length})
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1 gap-2" id="tab-income-categories">
            <ArrowDownLeft className="w-4 h-4" />
            Pemasukan ({incomeCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-4">
          <div className="grid grid-cols-1 gap-2">
            {expenseCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <div className="grid grid-cols-1 gap-2">
            {incomeCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
