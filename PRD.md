# Product Requirements Document (PRD)
## Web Pencatatan Keuangan Harian

---

## 1. Ringkasan Eksekutif

Aplikasi web pencatatan keuangan harian yang memungkinkan pengguna mencatat pemasukan dan pengeluaran secara manual maupun otomatis melalui scan struk belanja. Dibangun dengan Laravel 11, Filament v3, dan Cohere AI untuk parsing struk cerdas.

---

## 2. Latar Belakang & Tujuan

### Masalah
- Banyak orang kesulitan mencatat keuangan harian secara konsisten karena prosesnya dianggap merepotkan.
- Input manual memakan waktu, terutama saat membeli banyak item sekaligus.
- Struk belanja sering hilang atau tidak tercatat, menyebabkan data keuangan tidak akurat.

### Tujuan Produk
- Memudahkan pencatatan keuangan harian dengan antarmuka yang sederhana dan intuitif.
- Mempercepat proses input data melalui scan struk belanja berbasis AI.
- Memberikan gambaran keuangan yang jelas melalui laporan dan visualisasi data.

---

## 3. Target Pengguna

| Segmen | Deskripsi |
|--------|-----------|
| Primer | Individu usia 18–40 tahun yang ingin mengelola keuangan pribadi |
| Sekunder | Pasangan / keluarga yang berbagi pencatatan keuangan rumah tangga |

**Kebutuhan utama pengguna:**
- Input cepat, minimal langkah
- Bisa diakses dari HP (mobile-friendly)
- Laporan yang mudah dipahami

---

## 4. Ruang Lingkup

### Dalam Scope (v1.0)
- Autentikasi pengguna
- Input transaksi manual (pemasukan & pengeluaran)
- Scan struk belanja dengan OCR + parsing Cohere AI
- Kategorisasi transaksi
- Dashboard ringkasan keuangan
- Laporan harian, mingguan, bulanan
- Export PDF dan CSV

### Di Luar Scope (v1.0)
- Multi-currency
- Integrasi rekening bank / e-wallet otomatis
- Fitur berbagi antar pengguna
- Aplikasi mobile native (iOS/Android)
- Notifikasi push

---

## 5. Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Backend | Laravel 11 |
| Admin Panel & UI | Filament v3 |
| Database | MySQL 8 / PostgreSQL |
| OCR | Tesseract (lokal) atau Google Cloud Vision API |
| AI Parsing | Cohere API (`command-r-plus`) |
| Chart | ApexCharts (via Filament widget) |
| Export PDF | `barryvdh/laravel-dompdf` |
| Storage | Laravel Storage (local / S3) |
| Auth | Filament built-in authentication |

---

## 6. Arsitektur Data

### 6.1 Tabel `users`
```
id, name, email, password, currency (default: IDR), created_at, updated_at
```

### 6.2 Tabel `categories`
```
id, user_id, name, type (income|expense), color, icon, created_at, updated_at
```

### 6.3 Tabel `transactions`
```
id, user_id, category_id, receipt_id (nullable),
type (income|expense), amount, description,
transaction_date, source (manual|scan), created_at, updated_at
```

### 6.4 Tabel `receipts`
```
id, user_id, image_path, raw_ocr_text, parsed_json,
status (pending|parsed|failed), store_name,
receipt_date, total_amount, created_at, updated_at
```

### 6.5 Tabel `receipt_items`
```
id, receipt_id, name, price, quantity, subtotal
```

---

## 7. Fitur & Requirement Fungsional

### 7.1 Autentikasi

| ID | Requirement |
|----|-------------|
| AUTH-01 | Pengguna dapat mendaftar dengan email dan password |
| AUTH-02 | Pengguna dapat login dan logout |
| AUTH-03 | Session aman dengan remember me opsional |
| AUTH-04 | Reset password via email |

---

### 7.2 Manajemen Transaksi (Input Manual)

| ID | Requirement |
|----|-------------|
| TRX-01 | Pengguna dapat menambah transaksi baru (pemasukan atau pengeluaran) |
| TRX-02 | Field wajib: tipe, nominal, kategori, tanggal |
| TRX-03 | Field opsional: deskripsi/catatan |
| TRX-04 | Pengguna dapat mengedit transaksi yang sudah ada |
| TRX-05 | Pengguna dapat menghapus transaksi |
| TRX-06 | Pengguna dapat melihat daftar transaksi dengan filter tanggal dan kategori |
| TRX-07 | Daftar transaksi dapat diurutkan berdasarkan tanggal dan nominal |

---

### 7.3 Manajemen Kategori

| ID | Requirement |
|----|-------------|
| CAT-01 | Tersedia kategori default saat pertama kali pengguna mendaftar |
| CAT-02 | Pengguna dapat membuat kategori kustom |
| CAT-03 | Setiap kategori memiliki nama, ikon, warna, dan tipe (pemasukan/pengeluaran) |
| CAT-04 | Pengguna dapat mengedit dan menghapus kategori kustom |

**Kategori default (pengeluaran):** Makanan & Minuman, Transportasi, Belanja, Kesehatan, Hiburan, Pendidikan, Tagihan & Utilitas, Lainnya

**Kategori default (pemasukan):** Gaji, Freelance, Investasi, Hadiah, Lainnya

---

### 7.4 Scan Struk Belanja

| ID | Requirement |
|----|-------------|
| SCAN-01 | Pengguna dapat mengupload foto struk (JPEG, PNG, maks. 10 MB) |
| SCAN-02 | Sistem menjalankan OCR untuk mengekstrak teks dari gambar |
| SCAN-03 | Teks OCR dikirim ke Cohere AI untuk di-parse menjadi data terstruktur |
| SCAN-04 | Cohere AI mengekstrak: nama toko, tanggal, daftar item (nama + harga), dan total |
| SCAN-05 | Hasil parsing ditampilkan ke pengguna untuk direview sebelum disimpan |
| SCAN-06 | Pengguna dapat mengedit field hasil parsing sebelum konfirmasi |
| SCAN-07 | Setelah dikonfirmasi, satu transaksi pengeluaran otomatis dibuat |
| SCAN-08 | Jika OCR atau parsing gagal, sistem menampilkan pesan error dan mengarahkan ke input manual |
| SCAN-09 | Gambar struk disimpan dan dapat dilihat kembali dari detail transaksi |

#### Alur Scan Struk

```
Upload foto
    ↓
OCR (ekstrak teks)
    ↓
Kirim ke Cohere API
    ↓
Tampilkan hasil parsing
    ↓ (pengguna review & edit)
Simpan sebagai transaksi
```

#### Contoh Prompt ke Cohere API

```
Kamu adalah asisten pencatat keuangan. Ekstrak data dari teks struk belanja berikut
dan kembalikan HANYA objek JSON valid dengan format ini:
{
  "store_name": "string",
  "receipt_date": "YYYY-MM-DD",
  "items": [{"name": "string", "quantity": number, "price": number}],
  "total": number,
  "currency": "IDR"
}
Jika data tidak ditemukan, isi dengan null. Teks struk: [teks OCR]
```

---

### 7.5 Dashboard

| ID | Requirement |
|----|-------------|
| DASH-01 | Menampilkan saldo bersih (total pemasukan - total pengeluaran) bulan berjalan |
| DASH-02 | Menampilkan total pemasukan dan pengeluaran bulan berjalan |
| DASH-03 | Chart pengeluaran per kategori (pie/donut chart) |
| DASH-04 | Chart tren pengeluaran harian dalam 30 hari terakhir (line/bar chart) |
| DASH-05 | Daftar 10 transaksi terbaru dengan link ke detail |

---

### 7.6 Laporan

| ID | Requirement |
|----|-------------|
| RPT-01 | Laporan dapat difilter berdasarkan periode: harian, mingguan, bulanan, custom range |
| RPT-02 | Laporan menampilkan ringkasan pemasukan, pengeluaran, dan saldo |
| RPT-03 | Tabel detail transaksi per periode dengan kolom: tanggal, kategori, deskripsi, nominal |
| RPT-04 | Pengguna dapat mengexport laporan ke PDF |
| RPT-05 | Pengguna dapat mengexport laporan ke CSV |

---

## 8. Requirement Non-Fungsional

| Aspek | Requirement |
|-------|-------------|
| Performa | Halaman dashboard load < 3 detik pada koneksi 4G |
| Responsivitas | UI optimal di desktop dan mobile (min. 375px lebar) |
| Keamanan | Password di-hash (bcrypt), input di-sanitasi, proteksi CSRF |
| Ketersediaan | Uptime target 99% |
| Privasi | Data keuangan pengguna terisolasi per akun |
| OCR timeout | Proses scan maksimal 30 detik sebelum timeout |
| File upload | Maks. ukuran file struk 10 MB |

---

## 9. Rencana Pengembangan

### Fase 1 — Setup & Fondasi (±1 minggu)
- [ ] Install Laravel 11 + Filament v3
- [ ] Konfigurasi database dan migrations
- [ ] Setup autentikasi Filament
- [ ] Buat kategori default via seeder
- [ ] Konfigurasi storage untuk upload file

### Fase 2 — Fitur Inti: Input Manual (±1–2 minggu)
- [ ] Filament Resource: Categories (CRUD)
- [ ] Filament Resource: Transactions (CRUD)
- [ ] Filter dan sorting pada daftar transaksi
- [ ] Filament Widgets untuk dashboard (stats + chart)

### Fase 3 — AI & Scan Struk (±2 minggu)
- [ ] Form upload struk (validasi file)
- [ ] Integrasi library OCR
- [ ] Integrasi Cohere API (service class)
- [ ] UI review hasil parsing
- [ ] Simpan struk & buat transaksi otomatis
- [ ] Handling error dan fallback manual

### Fase 4 — Laporan & Polish (±1 minggu)
- [ ] Halaman laporan dengan filter periode
- [ ] Export PDF (laravel-dompdf)
- [ ] Export CSV
- [ ] Optimasi tampilan mobile
- [ ] Testing end-to-end

**Total estimasi: 5–6 minggu**

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Akurasi OCR rendah untuk foto buram | Hasil parsing tidak akurat | Tampilkan preview & izinkan edit manual sebelum simpan |
| Cohere API rate limit atau downtime | Fitur scan tidak berfungsi | Fallback ke input manual; queue job dengan retry |
| Foto struk format tidak standar | AI gagal parse | Prompt engineering yang robust + validasi output JSON |
| Biaya API Cohere membengkak | Overspend | Set limit penggunaan per user per hari |

---

## 11. Kriteria Keberhasilan (Definition of Done)

- Pengguna dapat mendaftar, login, dan mencatat transaksi manual dari awal hingga selesai tanpa error.
- Pengguna dapat mengupload foto struk, melihat hasil parsing AI, mengedit, dan menyimpan sebagai transaksi.
- Dashboard menampilkan data ringkasan yang akurat sesuai transaksi yang sudah diinput.
- Laporan dapat diexport ke PDF dan CSV dengan data yang benar.
- Semua halaman dapat diakses dan digunakan di perangkat mobile (Chrome, Safari).

---

*Dokumen ini bersifat living document dan akan diperbarui sesuai perkembangan proyek.*