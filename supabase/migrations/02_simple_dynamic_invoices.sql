-- =========================================================================
-- MIGRATION 02: SIMPLE DYNAMIC INVOICES & LINE ITEMS
-- Portal Wali Murid & Dashboard Pengelola Les (Rumah Belajar English)
-- Paket 400 - Standar
-- =========================================================================

-- 1. TAMBAH KOLOM LINE_ITEMS (JSONB) & TOTAL_AMOUNT KE TABEL TUITIONS
ALTER TABLE public.tuitions ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tuitions ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2);

-- Update record yang sudah ada agar total_amount terisi sama dengan amount
UPDATE public.tuitions
SET total_amount = amount
WHERE total_amount IS NULL;

-- 2. SEED CONTOH LINE ITEMS UNTUK TAGIHAN NOVEMBER (KENZO)
UPDATE public.tuitions
SET 
    total_amount = 350000,
    amount = 350000,
    line_items = '[
        {
            "id": "item_spp_nov",
            "kind": "spp",
            "description": "SPP Reguler Periode November 2024",
            "quantity": 1,
            "unit_price": 250000,
            "line_total": 250000
        },
        {
            "id": "item_buku_nov",
            "kind": "buku",
            "description": "Buku Paket Modul Level 3 & Flashcard",
            "quantity": 1,
            "unit_price": 100000,
            "line_total": 100000
        }
    ]'::jsonb
WHERE student_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND period = 'November 2024';

-- =========================================================================
-- 3. QUERY AUDIT UNTUK VERIFIKASI MIGRASI 02
-- =========================================================================
-- SELECT id, period, amount, total_amount, line_items 
-- FROM public.tuitions 
-- LIMIT 5;
