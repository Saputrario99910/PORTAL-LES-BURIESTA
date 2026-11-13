# Dashboard Admin (/admin) - Rumah Belajar English

Rencana penambahan halaman **Dashboard Admin** (`/admin`) khusus untuk pemilik lembaga les bahasa Inggris rumahan. Halaman ini berfokus pada dua tugas harian esensial: verifikasi bukti pembayaran SPP yang diunggah wali murid dan pengelolaan unggahan foto kegiatan/lembar kerja kelas ke galeri.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan desain dan arsitektur yang disepakati bersama pengguna:

- **Akses Navigasi Dual-Way**: Halaman admin dapat diakses langsung via URL browser `/admin` maupun melalui tombol pintas **"Mode Admin (Pengajar)"** di bilah atas (*top bar*) portal wali murid untuk kemudahan peninjauan (*preview*).
- **Perilaku Tabel Verifikasi**: Saat tombol "Verifikasi" (warna hijau) ditekan, status baris siswa langsung berganti menjadi badge hijau **"Lunas"** dengan tanggal verifikasi hari ini, dilengkapi filter tab cepat: **"Semua"**, **"Menunggu Verifikasi"**, dan **"Sudah Lunas"**.
- **Aksi Tanpa Kompleksitas Berlebih**: Sesuai arahan pengguna, verifikasi fokus pada pengubahan state tabel secara instan dan rapi tanpa tombol pengiriman pesan WhatsApp tambahan.
- **Upload Foto Galeri**: Tombol besar **"Upload Foto Kegiatan"** di kanan atas membuka modal form (Pilih nama siswa, upload gambar/file preview, input caption, tombol Simpan), disertai notifikasi mengambang (*toast*) "Foto berhasil diunggah".

---

### 1. Overview & Core Concept

- **What It Does**: Memberikan konsol desktop yang bersih, terorganisir, dan berfokus pada efisiensi kerja pemilik lembaga:
  1. Melihat daftar 10 siswa yang telah mengunggah bukti bayar iuran, memeriksa gambar struk transfer, dan memvalidasi pembayaran dalam 1 klik.
  2. Mengunggah dokumentasi kegiatan belajar atau foto hasil lembar kerja siswa baru yang nantinya langsung tampil di tab Galeri wali murid.
- **Target Audience / Persona**: Pemilik / Pengelola les rumahan (*Miss Sarah*) yang membuka sistem di laptop/komputer desktop untuk mengecek mutasi bank dan merapikan dokumentasi kelas.
- **Key Value**: Operasional lembaga les menjadi transparan, cepat, dan tanpa friksi administrasi.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Navigasi ke Dashboard Admin**:
   - Pengguna membuka rute `/admin` atau menekan tombol **"Mode Admin"** di header utama.
   - Halaman beralih ke layout desktop elegan (lebar kontras tinggi, latar belakang Slate-50/White yang bersih).
   - Terdapat tombol kembali **"← Kembali ke Portal Wali"** di pojok kiri atas.

2. **Fitur 1: Tabel Verifikasi Pembayaran Menunggu**:
   - Terletak di bagian atas sebagai prioritas utama kerja harian.
   - **Header & Filter**: Judul jelas *"Menunggu Verifikasi Pembayaran"*, sub-teks ringkas, metrik kartu cepat (e.g. *Total Menunggu: 10 Siswa · Estimasi Dana: Rp 2.500.000*), dan filter tab status (*Menunggu Verifikasi*, *Sudah Lunas*, *Semua*).
   - **Kolom Tabel**:
     1. Nama Siswa (dengan foto profil kecil & nama panggilan)
     2. Kelas Les (misal: *Primary 3 SD*)
     3. Bulan Tagihan (misal: *November 2024*)
     4. Nominal (format rapi `font-mono tabular-nums`: *Rp 250.000*)
     5. Tanggal Upload (misal: *8 Nov 2024, 09.30 WIB*)
     6. Aksi:
        - Tombol **"Lihat Bukti"** (ikon mata/struk, membuka modal pratinjau gambar struk transfer berukuran 400x600).
        - Tombol **"Verifikasi"** (warna hijau kontras tinggi emerald/green-700, langsung mengubah status baris menjadi "Lunas").
   - **Modal Lihat Bukti**: Menampilkan preview struk transfer beresolusi jelas (`https://picsum.photos/seed/struk.../400/600`), nama bank pengirim, dan tanggal transfer dengan tombol tutup besar.

3. **Fitur 2: Tombol & Modal Upload Galeri (Kanan Atas)**:
   - Tombol besar **"Upload Foto Kegiatan"** dengan ikon kamera/unggah di sudut kanan atas header tabel.
   - **Modal Form**:
     - Dropdown pilihan nama siswa (10 siswa Indonesia).
     - Input file foto kegiatan / drag-and-drop dengan live preview.
     - Input teks Caption / Keterangan apresiatif guru.
     - Tombol aksi "Simpan Foto".
   - **Notifikasi Toast**: Setelah disimpan, modal tertutup otomatis dan muncul animasi toast hijau di pojok kanan bawah: *"Foto berhasil diunggah ke Galeri Siswa!"*.

#### Visual Identity & Theme (SaaS / Admin Standards)
- **Aesthetic**: Desktop-first, clean corporate slate with high-contrast emerald green accents for positive actions.
- **Palette**: Slate-900 typography, Slate-100/200 borders, Emerald-600/700 for verification buttons, Amber-500 accents matching Rumah Belajar English branding.
- **Typography**: Tabular numerals for rupiah amounts, clean sans headings (`font-bold text-slate-900`), single-line cell alignments with generous padding (`py-3.5 px-4`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Routing `/admin`**:
  - *Chosen Approach*: Sinkronisasi URL pathname (`window.location.pathname`) dan event `popstate`/`pushState` tanpa reload penuh.
  - *Why*: Memenuhi spesifikasi tepat "route /admin" di Vite SPA tanpa memerlukan server rendering rumit.
- **Decision 2: Pemisahan Data Dummy Siswa & Verifikasi**:
  - *Chosen Approach*: Membuat `src/data/adminMockData.ts` berisi 10 siswa Indonesia (Kenzo Alfarizi, Nadira Alya, Dimas Prasetyo, Raisa Zahra, Fadhil Ramadhan, Annisa Maharani, Bagas Wicaksono, Tiara Andini, Rian Saputra, Clarissa Aurelia) lengkap dengan detail tagihan dan URL struk transfer.
  - *Why*: Menjaga isolasi kode dan kesiapan integrasi backend Supabase.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌──────────────────────────────────────────────────────────────┐
│                  Rumah Belajar English                       │
│                     Router Controller                        │
└──────────────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     Path: "/" atau lain                  Path: "/admin"
   [ Portal Wali Murid ]              [ Admin Dashboard View ]
   - Profil Siswa                     - Header + Tombol Upload Galeri
   - Absensi, Rencana, Galeri, Iuran  - Metrik Ringkas Verifikasi
                                      - Tabel Menunggu Verifikasi
                                      ┌──────────┴──────────┐
                                      ▼                     ▼
                               [Modal Bukti]         [Modal Upload]
                               - Gambar Struk        - Dropdown Siswa
                               - Info Rekening       - Image Preview
                                                     - Toast Notifikasi
```

#### Struktur Komponen yang Direncanakan
1. `src/data/adminMockData.ts`: 10 siswa dengan status `menunggu` dan URL struk transfer.
2. `src/components/admin/AdminDashboard.tsx`: Halaman utama admin desktop lebar.
3. `src/components/admin/ProofModal.tsx`: Modal pratinjau bukti transfer 400x600.
4. `src/components/admin/UploadGalleryModal.tsx`: Modal unggah foto kegiatan dengan dropdown siswa dan preview.
5. `src/App.tsx`: Routing switch antara Portal Wali (`/`) dan Admin Dashboard (`/admin`), dengan tombol pintas di kedua arah.
