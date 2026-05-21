# 💰 CatatKeuangan

> Aplikasi web pencatatan keuangan harian dengan fitur scan struk belanja berbasis AI. Catat pemasukan & pengeluaran, lihat laporan visual, dan kelola keuangan pribadi dengan mudah.

![Tech Stack](https://img.shields.io/badge/Backend-Laravel%2013-FF2D20?style=flat-square&logo=laravel)
![Tech Stack](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=flat-square&logo=nextdotjs)
![Tech Stack](https://img.shields.io/badge/AI-Cohere-000000?style=flat-square)
![Tech Stack](https://img.shields.io/badge/OCR-Tesseract-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur Proyek](#arsitektur-proyek)
- [Struktur Direktori](#struktur-direktori)
- [Skema Database](#skema-database)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Proyek](#menjalankan-proyek)
- [API Reference](#api-reference)
- [Alur Scan Struk (OCR + AI)](#alur-scan-struk-ocr--ai)
- [Admin Panel](#admin-panel)
- [Troubleshooting](#troubleshooting)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Autentikasi** | Register & login dengan token berbasis Laravel Sanctum |
| 💸 **Transaksi Manual** | Catat pemasukan & pengeluaran dengan kategori |
| 📋 **Detail & Edit Transaksi** | Halaman detail lengkap + form edit dengan data pre-filled |
| 📷 **Scan Struk AI** | Upload foto struk (JPEG/PNG/WebP) → OCR → AI parsing → simpan |
| 📊 **Dashboard** | Ringkasan saldo, grafik tren 30 hari, breakdown per kategori |
| 📈 **Laporan** | Laporan bulanan dengan ekspor PDF & CSV |
| 🏷️ **Kategori** | Kelola kategori pengeluaran & pemasukan (CRUD) |
| ⚙️ **Pengaturan** | Update profil & preferensi mata uang |
| 🌗 **Dark / Light Mode** | Toggle tema gelap/terang, persisten via localStorage |
| 🛡️ **Admin Panel** | Filament v4 admin panel di `/admin` |

---

## 🛠 Tech Stack

### Backend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| PHP | ^8.3 | Runtime |
| Laravel | ^13.8 | Framework backend utama |
| Laravel Sanctum | ^4.3 | Token-based API authentication |
| Filament | ^4.0 | Admin panel UI |
| Laravel DomPDF | ^3.1 | Generate laporan PDF |
| MySQL | 8.x | Database utama |
| Tesseract OCR | 5.x | Ekstraksi teks dari gambar struk |
| Cohere AI | API v1 | Parsing data struk (`command-r-plus-08-2024`) |

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 16.2.6 (Turbopack) | Framework React utama |
| React | 19.x | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling |
| Shadcn/UI | ^4.7 | Komponen UI |
| Recharts | ^3.8 | Grafik & visualisasi data |
| Axios | ^1.16 | HTTP client ke Laravel API |
| Sonner | ^2.0 | Toast notifications |
| react-dropzone | ^15.0 | Upload gambar struk |
| Outfit (Google Fonts) | — | Tipografi utama |

> **Catatan:** Dark/light mode menggunakan custom `ThemeProvider` (bukan `next-themes`) karena ketidakcocokan `next-themes@0.4.6` dengan React 19.

---

## 🏗 Arsitektur Proyek

```
Browser (Next.js)
      │
      │  HTTP/REST (Bearer Token)
      ▼
Laravel API (Port 8000)
      │
      ├── Laravel Sanctum  ──► Token Auth
      ├── Tesseract OCR    ──► Ekstraksi teks gambar
      ├── Cohere AI API    ──► Parsing data struk
      └── MySQL (XAMPP)    ──► Penyimpanan data
```

**Pola komunikasi:**
- Frontend menyimpan Bearer Token di `localStorage`
- Setiap request API menyertakan `Authorization: Bearer <token>`
- Axios interceptor otomatis redirect ke `/login` jika token expired (401)

---

## 📁 Struktur Direktori

```
Catatan-Keuanganan/
├── README.md
├── PRD.md
│
├── backend/                        ← Laravel 13 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── ReceiptController.php
│   │   │   ├── ReportController.php
│   │   │   └── TransactionController.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Category.php
│   │   │   ├── Transaction.php
│   │   │   ├── Receipt.php
│   │   │   └── ReceiptItem.php
│   │   └── Services/
│   │       ├── OcrService.php       ← Tesseract (auto-fallback eng jika ind tidak ada)
│   │       └── CohereService.php    ← Cohere AI + retry on loop detection
│   ├── config/
│   │   └── services.php             ← Wajib: cohere, ocr, google, upload
│   ├── database/migrations/
│   └── routes/api.php
│
└── frontend/                       ← Next.js 16
    └── src/
        ├── app/
        │   ├── (app)/
        │   │   ├── dashboard/
        │   │   ├── transactions/
        │   │   │   ├── page.tsx          ← Daftar transaksi
        │   │   │   ├── new/page.tsx      ← Tambah transaksi
        │   │   │   └── [id]/
        │   │   │       ├── page.tsx      ← Detail transaksi
        │   │   │       └── edit/page.tsx ← Edit transaksi
        │   │   ├── scan/
        │   │   ├── categories/
        │   │   ├── reports/
        │   │   └── settings/
        │   └── (auth)/
        │       ├── login/
        │       └── register/
        ├── components/
        │   ├── layout/
        │   │   └── Sidebar.tsx      ← Navigasi + theme toggle
        │   ├── providers/
        │   │   ├── AuthProvider.tsx
        │   │   └── ThemeProvider.tsx ← Custom dark/light mode (React 19 compatible)
        │   ├── shared/
        │   └── ui/
        └── lib/
            ├── api.ts               ← Axios instance + interceptors
            ├── types.ts             ← TypeScript interfaces (snake_case + camelCase)
            └── data.ts              ← formatCurrency, helpers
```

---

## 🗄 Skema Database

```
users
├── id, name, email, password, currency (IDR/USD/etc), timestamps

categories
├── id, user_id, name, type (income|expense), color, icon, timestamps

transactions
├── id, user_id, category_id, receipt_id (nullable)
├── type (income|expense), amount, description
├── transaction_date, source (manual|scan), timestamps

receipts
├── id, user_id, image_path, raw_ocr_text, parsed_json
├── status (pending|parsed|failed)
├── store_name, receipt_date, total_amount, timestamps

receipt_items
└── id, receipt_id, name, quantity, price, subtotal, timestamps

personal_access_tokens  ← Sanctum
└── tokenable_type, tokenable_id, name, token, abilities, timestamps
```

---

## 📦 Prasyarat

```bash
php --version          # >= 8.3
composer --version     # >= 2.x
node --version         # >= 20.x
npm --version          # >= 10.x
mysql --version        # >= 8.x (via XAMPP atau native)
tesseract --version    # >= 5.x
```

**Install bahasa Indonesia untuk Tesseract (opsional, ada fallback ke `eng`):**
```bash
# Arch Linux / Manjaro
sudo pacman -S tesseract-data-ind

# Ubuntu / Debian
sudo apt install tesseract-ocr-ind
```

---

## 🚀 Instalasi

### 1. Clone Repositori
```bash
git clone <url-repositori>
cd Catatan-Keuanganan
```

### 2. Setup Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
```

---

## ⚙️ Konfigurasi Environment

### Backend — `backend/.env`

```env
APP_NAME="CatatKeuangan"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=catatan_keuangan
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000

# OCR: 'tesseract' (lokal) atau 'google' (cloud)
OCR_DRIVER=tesseract
GOOGLE_CLOUD_VISION_API_KEY=

# Cohere AI — daftar gratis di dashboard.cohere.com
COHERE_API_KEY=your_cohere_api_key_here
COHERE_MODEL=command-r-plus-08-2024

UPLOAD_MAX_SIZE_MB=10
```

> ⚠️ **Penting:** Setelah ubah `.env`, selalu jalankan `php artisan config:clear`

> ⚠️ **Penting:** Pastikan `config/services.php` memiliki entry `cohere`, `ocr`, `google`, dan `upload`. Tanpa ini, API key di `.env` tidak akan terbaca.

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ▶️ Menjalankan Proyek

Buka **dua terminal** secara bersamaan:

**Terminal 1 — Backend:**
```bash
cd backend
php artisan serve
# http://localhost:8000
```
> Pastikan MySQL/XAMPP aktif sebelum menjalankan.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# http://localhost:3000
```

---

## 📡 API Reference

Base URL: `http://localhost:8000/api`

Header untuk endpoint yang memerlukan auth:
```
Authorization: Bearer <token>
```

### 🔐 Autentikasi

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/register` | ❌ | Daftar akun baru |
| `POST` | `/login` | ❌ | Login & dapatkan token |
| `POST` | `/logout` | ✅ | Hapus token aktif |
| `GET`  | `/user` | ✅ | Data user yang login |
| `PUT`  | `/user` | ✅ | Update profil |

**Response Login/Register:**
```json
{
  "user": { "id": 1, "name": "Budi", "email": "budi@mail.com", "currency": "IDR" },
  "token": "1|abc123..."
}
```

### 📊 Dashboard

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/dashboard` | ✅ | Ringkasan bulan ini + tren 30 hari |

### 💸 Transaksi

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET`    | `/transactions`      | ✅ | Daftar semua transaksi |
| `POST`   | `/transactions`      | ✅ | Buat transaksi baru |
| `GET`    | `/transactions/{id}` | ✅ | Detail transaksi |
| `PUT`    | `/transactions/{id}` | ✅ | Update transaksi |
| `DELETE` | `/transactions/{id}` | ✅ | Hapus transaksi |

**Request:**
```json
POST /api/transactions
{
  "category_id": 3,
  "type": "expense",
  "amount": 50000,
  "description": "Makan siang",
  "transaction_date": "2026-05-21"
}
```

### 🏷️ Kategori

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET`    | `/categories`      | ✅ | Daftar kategori |
| `POST`   | `/categories`      | ✅ | Buat kategori |
| `PUT`    | `/categories/{id}` | ✅ | Update kategori |
| `DELETE` | `/categories/{id}` | ✅ | Hapus kategori |

### 📷 Scan Struk

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/receipts/upload`          | ✅ | Upload gambar (JPEG/PNG/WebP, maks 10MB) |
| `POST` | `/receipts/{id}/process`    | ✅ | Jalankan OCR + AI parsing |
| `POST` | `/receipts/{id}/confirm`    | ✅ | Konfirmasi & simpan sebagai transaksi |
| `GET`  | `/receipts/{id}`            | ✅ | Detail receipt |

**Confirm payload:**
```json
{
  "category_id": 5,
  "store_name": "Superindo",
  "receipt_date": "2026-05-21",
  "total_amount": 47000,
  "items": [
    { "name": "Indomie Goreng", "quantity": 3, "price": 3500 }
  ]
}
```

### 📈 Laporan

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/reports/export/csv` | ✅ | Download CSV |
| `GET` | `/reports/export/pdf` | ✅ | Download PDF |

---

## 🔍 Alur Scan Struk (OCR + AI)

```
1. Upload foto struk (JPEG/PNG/WebP)
        │
        ▼
2. Simpan ke storage/app/public/receipts/ → status: "pending"
        │
        ▼
3. POST /api/receipts/{id}/process
        │
        ▼
4. OcrService: ekstrak teks
   → Bahasa: ind+eng jika tersedia, fallback ke eng
   → Teks di-clean: deduplicate, limit 1500 karakter
        │
        ▼
5. CohereService: parse teks → JSON terstruktur
   → Model: command-r-plus-08-2024
   → Auto-retry dengan teks lebih pendek jika loop detection error
        │
        ▼
6. Tampilkan hasil ke user + pilih kategori pengeluaran
        │
        ▼
7. POST /api/receipts/{id}/confirm
   → Buat Transaction (type: expense, source: scan)
   → Status receipt: "parsed"
```

**OCR Driver:**

| Driver | Config | Keterangan |
|--------|--------|------------|
| `tesseract` | `OCR_DRIVER=tesseract` | Gratis, lokal, tanpa internet |
| `google` | `OCR_DRIVER=google` + key | Lebih akurat untuk foto buram |

---

## 🌗 Dark / Light Mode

Toggle tersedia di **Sidebar** (ikon ☀️/🌙). Pilihan disimpan di `localStorage` dan langsung diterapkan ke class `dark` pada `<html>`.

Implementasi menggunakan custom `ThemeProvider` (bukan `next-themes`) karena `next-themes@0.4.6` tidak kompatibel dengan React 19 (inject script tag yang dilarang React).

Default: **mode gelap**.

---

## 🛡️ Admin Panel

Tersedia di: `http://localhost:8000/admin`

Menggunakan **Filament v4**. Buat admin:
```bash
cd backend
php artisan make:filament-user
```

---

## 🔧 Troubleshooting

### ❌ Error 404 pada API endpoint
```bash
php artisan route:list --path=api
php artisan config:clear && php artisan route:clear
```
Pastikan `bootstrap/app.php` mendaftarkan `api: __DIR__.'/../routes/api.php'`.

---

### ❌ `no api key supplied` — Cohere 401
```bash
php artisan config:clear
php artisan tinker --execute="echo config('services.cohere.api_key') ? 'OK' : 'EMPTY';"
```
Pastikan `config/services.php` punya entry:
```php
'cohere' => ['api_key' => env('COHERE_API_KEY', ''), 'model' => env('COHERE_MODEL', 'command-r-plus-08-2024')],
```

---

### ❌ `model 'command-r-plus' was removed` — Cohere 404
Model `command-r-plus` dihapus September 2025. Gunakan versi terbaru:
```env
COHERE_MODEL=command-r-plus-08-2024
```
Lalu `php artisan config:clear`.

---

### ❌ OCR gagal — teks kosong
```bash
tesseract --list-langs
# Install bahasa Indonesia jika belum ada
sudo pacman -S tesseract-data-ind
```
Jika `ind` tidak tersedia, OCR otomatis fallback ke `eng`.

---

### ❌ Scan gagal — Cohere timeout
Tesseract menghasilkan teks yang terlalu panjang. `CohereService` sudah otomatis:
- Membersihkan teks (deduplicate, limit 1500 char)
- Retry dengan teks lebih pendek (800 char) jika masih gagal

---

### ❌ Gagal menyimpan transaksi dari scan
Pastikan memilih **kategori pengeluaran** di halaman hasil scan sebelum klik "Simpan Transaksi". `category_id` dan `total_amount` wajib dikirim ke endpoint `/confirm`.

---

### ❌ CORS error — frontend tidak bisa konek backend
```env
# backend/.env
FRONTEND_URL=http://localhost:3000
```
Lalu `php artisan config:clear`.

---

### ❌ Port 3000 sudah terpakai
```bash
lsof -ti:3000 | xargs kill -9
# atau
PORT=3001 npm run dev
```

---

### ❌ Script tag warning di React 19 (next-themes)
`next-themes@0.4.6` tidak kompatibel dengan React 19. Proyek ini menggunakan custom `ThemeProvider` di `src/components/providers/ThemeProvider.tsx`. Jangan install atau import dari `next-themes`.

---

## 📜 License

Proyek ini dibuat untuk keperluan pembelajaran dan pengembangan pribadi.

---

<div align="center">
  <p>Dibuat dengan ❤️ menggunakan Laravel & Next.js</p>
</div>
