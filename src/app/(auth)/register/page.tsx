"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });
      toast.success("Akun berhasil dibuat!");
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["", "Lemah", "Cukup", "Baik", "Kuat"];

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-balance flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">CatatKeuangan</span>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Mulai perjalanan finansialmu hari ini
          </h1>
          <p className="text-white/80 text-lg">
            Bergabung dengan ribuan pengguna yang sudah mengelola keuangan lebih baik.
          </p>
          <div className="space-y-3">
            {[
              "Gratis untuk digunakan",
              "Data aman & terenkripsi",
              "Scan struk dengan AI",
              "Laporan PDF & CSV",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/50 text-sm">
          © 2026 CatatKeuangan. All rights reserved.
        </p>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">CatatKeuangan</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">Buat akun baru</h2>
            <p className="text-muted-foreground mt-1">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium" id="link-login">
                Masuk
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ahmad Fauzi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  id="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength ? strengthColors[strength] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kekuatan: <span className="font-medium">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-primary border-0 hover:opacity-90 transition-opacity mt-2"
              disabled={loading}
              id="btn-register"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat akun...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Dengan mendaftar, kamu menyetujui{" "}
            <Link href="#" className="text-primary hover:underline">Syarat & Ketentuan</Link>
            {" "}dan{" "}
            <Link href="#" className="text-primary hover:underline">Kebijakan Privasi</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
