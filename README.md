# 💰 CatatKeuangan

> Aplikasi web pencatatan keuangan harian dengan fitur scan struk belanja berbasis AI. Catat pemasukan & pengeluaran, lihat laporan visual, dan kelola keuangan pribadi dengan mudah.

![Tech Stack](https://img.shields.io/badge/Fullstack-Next.js%2016-000000?style=flat-square&logo=nextdotjs)
![Tech Stack](https://img.shields.io/badge/Database-Prisma%20ORM-2D3748?style=flat-square&logo=prisma)
![Tech Stack](https://img.shields.io/badge/AI-Cohere-000000?style=flat-square)
![Tech Stack](https://img.shields.io/badge/OCR-Tesseract-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur Proyek](#arsitektur-proyek)
- [Skema Database](#skema-database)
- [Prasyarat](#prasyarat)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Autentikasi** | Register & login menggunakan JWT (stateless) |
| 💸 **Transaksi Manual** | Catat pemasukan & pengeluaran dengan kategori |
| 📋 **Detail & Edit Transaksi** | Halaman detail lengkap + form edit dengan data pre-filled |
| 📷 **Scan Struk AI** | Upload foto struk (JPEG/PNG/WebP) → OCR (Tesseract) → AI parsing (Cohere) → simpan |
| 📊 **Dashboard** | Ringkasan saldo, grafik tren 30 hari, breakdown pengeluaran per kategori |
| 📈 **Laporan** | Laporan bulanan dengan ekspor ke file PDF (via pdfkit) dan CSV |
| 🏷️ **Kategori** | Kelola kategori pengeluaran & pemasukan |
| 🌗 **Dark / Light Mode** | Pilihan tema UI menggunakan Tailwind CSS |

---

## 🛠 Tech Stack

Seluruh arsitektur kini telah dimigrasikan ke **Full-Stack Next.js (App Router)**.

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 16.2.6 (Turbopack) | Framework React Fullstack (Frontend & API Routes) |
| React | 19.x | Library antarmuka |
| Prisma ORM | 5.22.0 | ORM untuk interaksi dengan database MySQL |
| MySQL | 8.x | Sistem manajemen basis data (via XAMPP / native) |
| JWT (`jose`) | ^6.2 | Token autentikasi stateless |
| Tailwind CSS | ^4 | Styling modern utility-first |
| Shadcn/UI | ^4.7 | Komponen UI |
| Tesseract OCR | 5.x | Ekstraksi teks dari gambar struk (berjalan via `child_process`) |
| Cohere AI | API v1 | Parsing teks OCR menjadi JSON terstruktur (`command-r-plus`) |

---

## 🏗 Arsitektur Proyek

Aplikasi kini sepenuhnya berjalan di atas **Next.js** tanpa membutuhkan PHP/Laravel.

```
Browser / Client
      │
      │  HTTP (Axios - /api/*)
      ▼
Next.js App Router (localhost:3000)
      │
      ├── /api/login, /api/transactions  ──► Route Handlers (Backend Logic)
      ├── auth-server.ts                 ──► Verifikasi JWT
      ├── ocr.ts (Tesseract)             ──► Ekstraksi teks lokal
      ├── cohere.ts (Cohere API)         ──► Natural Language Processing
      └── Prisma Client                  ──► Akses Database
            │
            ▼
       MySQL Database
```

---

## 🗄 Skema Database

Skema database kini didefinisikan menggunakan Prisma Schema di `frontend/prisma/schema.prisma`. 
Tabel-tabel utama meliputi:
- `users`: Informasi akun & preferensi mata uang.
- `categories`: Kategori transaksi milik pengguna.
- `transactions`: Entri pemasukan dan pengeluaran.
- `receipts` & `receipt_items`: Penyimpanan raw data hasil OCR beserta item struk yang ter-parse.

---

## 📦 Prasyarat

Sebelum memulai, pastikan sistem Anda telah terinstal:
```bash
node --version         # >= 20.x
npm --version          # >= 10.x
mysql --version        # >= 8.x (bisa menggunakan MySQL dari XAMPP)
tesseract --version    # >= 5.x
```

**Install Tesseract OCR & Bahasa Indonesia (Linux):**
```bash
# Ubuntu / Debian
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-ind

# Arch Linux / Manjaro
sudo pacman -S tesseract tesseract-data-ind
```

---

## 🚀 Instalasi & Setup

### 1. Clone Repositori
```bash
git clone <url-repositori>
cd Catatan-Keuanganan/frontend
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Database (Prisma)
Pastikan MySQL Anda aktif dan database `catatan_keuangan` telah dibuat (bisa menggunakan phpMyAdmin).
Lalu, push skema Prisma ke dalam database Anda:
```bash
npm run db:push
```
*(Catatan: Anda tidak perlu lagi menjalankan migrasi Laravel).*

### 4. Menjalankan Aplikasi
```bash
npm run dev
```
Aplikasi akan langsung berjalan di `http://localhost:3000`.

---

## ⚙️ Konfigurasi Environment

Buat atau edit file `.env` di dalam folder `frontend` dan tambahkan variabel berikut:

```env
# Koneksi Prisma Database (sesuaikan dengan user/pass MySQL Anda)
DATABASE_URL="mysql://root:@localhost:3306/catatan_keuangan"

# Key untuk menandatangani JWT Auth Token (bisa berupa teks acak apapun)
APP_KEY="BebasSajaYangPentingAman123"

# Kunci API Cohere untuk scan struk AI (dapatkan di dashboard.cohere.com)
COHERE_API_KEY="masukkan_api_key_cohere_anda_disini"
```

---

## 🔧 Troubleshooting

### ❌ Tesseract tidak ditemukan atau gagal OCR
Pastikan Tesseract terpasang di environment PATH sistem operasi Anda. Jika `tesseract-data-ind` tidak ditemukan, sistem akan otomatis melakukan *fallback* mencoba bahasa inggris (`eng`).

### ❌ Scan Struk gagal ("Foto tidak terbaca dengan baik")
Jika ini muncul tapi foto sangat jelas, kemungkinan besar konfigurasi `COHERE_API_KEY` Anda di `.env` hilang atau tidak valid, sehingga AI tidak bisa memproses struk tersebut.

### ❌ Prisma Error 500
Proyek ini dikunci menggunakan **Prisma v5** karena kompatibilitas Engine yang lebih mudah untuk Node.js standar. Hindari memutakhirkan modul `@prisma/client` ke versi 6 atau 7 secara tidak sengaja, kecuali Anda mengonfigurasi Prisma Client Adapter.

### ❌ Cara mengedit isi database secara manual?
Gunakan perintah bawaan Prisma untuk membuka GUI yang sangat bersih tanpa phpMyAdmin:
```bash
npm run db:studio
```
Lalu buka `http://localhost:5555`.

---

<div align="center">
  <p>Dibuat dengan ❤️ menggunakan Next.js & Prisma</p>
</div>
