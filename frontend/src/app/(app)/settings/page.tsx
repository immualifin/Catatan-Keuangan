"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  User,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Save,
  Camera,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

function SettingSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [currency, setCurrency] = useState(user?.currency || "IDR");
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: false,
    budgetAlert: true,
  });
  const [saving, setSaving] = useState(false);

  // Sync state when user loads
  React.useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
      setCurrency(user.currency || "IDR");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/api/user", {
        name: profile.name,
        currency: currency,
      });
      updateUser(res.data.user);
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    toast.info("Fitur ubah password akan segera hadir");
  };

  const handleLogout = () => {
    toast.success("Keluar...");
    logout();
  };

  const handleDeleteAccount = () => {
    toast.error("Fitur penghapusan akun memerlukan konfirmasi via email");
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Pengaturan
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Kelola akun dan preferensi kamu</p>
      </div>

      {/* Profile */}
      <SettingSection
        title="Profil"
        description="Informasi akun yang ditampilkan"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="gradient-primary text-white text-xl font-bold">
                {profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              id="btn-change-avatar"
              onClick={() => toast.info("Fitur upload foto segera hadir")}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-4" id="profile-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Nama Lengkap</Label>
              <Input
                id="settings-name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="gradient-primary border-0 hover:opacity-90"
            id="btn-save-profile"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan
              </span>
            )}
          </Button>
        </div>
      </SettingSection>

      {/* Preferences */}
      <SettingSection
        title="Preferensi"
        description="Sesuaikan pengalaman penggunaan kamu"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Mata Uang</Label>
              <p className="text-xs text-muted-foreground">Format tampilan nominal</p>
            </div>
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger className="h-9 w-28" id="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="SGD">SGD (S$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        title="Notifikasi"
        description="Atur kapan kamu mau diberitahu"
      >
        <div className="space-y-4">
          {[
            {
              id: "dailyReminder" as const,
              label: "Pengingat Harian",
              desc: "Ingatkan saya untuk mencatat pengeluaran setiap hari",
            },
            {
              id: "weeklyReport" as const,
              label: "Laporan Mingguan",
              desc: "Kirim ringkasan keuangan setiap minggu",
            },
            {
              id: "budgetAlert" as const,
              label: "Peringatan Anggaran",
              desc: "Beri tahu saat pengeluaran mendekati batas",
            },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <Label className="text-sm font-medium">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                id={`switch-${item.id}`}
                checked={notifications[item.id]}
                onCheckedChange={(v) =>
                  setNotifications({ ...notifications, [item.id]: v })
                }
              />
            </div>
          ))}
        </div>
      </SettingSection>

      {/* Security */}
      <SettingSection
        title="Keamanan"
        description="Kelola password dan keamanan akun"
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleChangePassword}
            className="w-full justify-start"
            id="btn-change-password"
          >
            <Key className="w-4 h-4 mr-2" />
            Ubah Password
          </Button>
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection
        title="Zona Berbahaya"
        description="Tindakan ini tidak dapat dibatalkan"
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar dari Akun
          </Button>
          <Separator />
          <Button
            variant="outline"
            onClick={handleDeleteAccount}
            className="w-full justify-start text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
            id="btn-delete-account"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Akun Saya
          </Button>
        </div>
      </SettingSection>

      <div className="text-center text-xs text-muted-foreground pb-4">
        CatatKeuangan v1.0.0 · © 2026
      </div>
    </div>
  );
}
