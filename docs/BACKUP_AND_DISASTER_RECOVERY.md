# Panduan Backup Database & Disaster Recovery (Paket 400 - Standar)
**Portal Wali Murid & Dashboard Pengelola Les (Rumah Belajar English)**

---

## 1. Arsitektur Data & Source of Truth

- **Source of Truth Utama**: **Supabase (PostgreSQL)**
  - Seluruh data operasional siswa, absensi, tagihan SPP, cicilan, nilai evaluasi, konfigurasi lembaga, dan hash PIN (`pin_hash`) tersimpan dan divalidasi langsung di Supabase.
- **Satu Arah (One-Way Outbound Mirror)**: **Google Sheets**
  - Google Sheets berfungsi sebagai **cermin ekspor & backup sekunder** yang mudah dibaca langsung oleh admin secara offline/real-time tanpa membebani database utama.
  - Segala bentuk penulisan dari Google Sheets ke Supabase ditiadakan (inbound write disabled) untuk menjaga konsistensi dan integritas data ACID PostgreSQL.

---

## 2. Keamanan Webhook & Idempotensi (Anti-Duplikasi)

### Shared Secret Authentication
Setiap request sinkronisasi dari portal ke Google Apps Script webhook dilindungi dengan shared secret:
- Variabel lingkungan: `VITE_GOOGLE_SHEETS_WEBHOOK_SECRET`
- Nilai secret diverifikasi pada setiap request `doPost(e)` di Google Apps Script. Request tanpa secret yang valid akan ditolak secara otomatis (`HTTP 401 Unauthorized`).

### Proteksi Idempotensi
- Setiap aksi sinkronisasi menyertakan `idempotency_key` unik (berbasis timestamp dan ID rekaman).
- Google Apps Script menyimpan kunci idempotensi di `CacheService` selama 6 jam. Jika ada pengiriman ulang (retry koneksi atau klik ganda admin), baris duplikat tidak akan dicatat dua kali ke Spreadsheet.

---

## 3. Rencana Backup Harian Supabase

### A. Backup Otomatis Supabase (Standar Cloud)
1. Supabase secara otomatis mencadangkan database PostgreSQL setiap hari pada tingkat infrastruktur.
2. Status backup dapat dipantau di: **Dashboard Supabase -> Project Settings -> Database -> Backups**.

### B. Prosedur Ekspor Backup Mandiri Mingguan/Bulanan (Disarankan untuk Pengelola)
1. **Ekspor CSV per Tabel**:
   - Buka menu **Table Editor** di Supabase.
   - Pilih tabel (misal: `students`, `tuitions`, `attendances`, `exam_results`).
   - Klik tombol **Export** -> **Download CSV**.
2. **Ekspor SQL Dump Lengkap (Opsional via Supabase CLI)**:
   ```bash
   npx supabase db dump --project-ref fjuxdinlgmxknifdamjf -f rbe_backup_latest.sql
   ```

---

## 4. Pemulihan Kendala Sinkronisasi (Sync Error Logging)

Apabila terjadi gangguan koneksi internet atau Google Apps Script timeout, sistem tidak akan macet:
1. Kesalahan sinkronisasi otomatis dicatat ke tabel `public.sync_error_logs` di Supabase.
2. Kolom yang dicatat:
   - `action_type`: jenis transaksi (misal: `catat_pembayaran`, `absensi_baru`).
   - `payload_summary`: ringkasan data tersanitasi (tanpa data sensitif/media besar).
   - `error_message`: pesan error kegagalan.
   - `retry_status`: status tindak lanjut (`failed`).
   - `created_at`: waktu terjadinya error.
3. Pengelola/admin dapat memeriksa log kegagalan langsung melalui query SQL di Supabase:
   ```sql
   SELECT * FROM public.sync_error_logs ORDER BY created_at DESC LIMIT 20;
   ```
