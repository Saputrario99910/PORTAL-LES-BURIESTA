-- =========================================================================
-- MIGRATION 01: DATABASE SECURITY, PASSWORD HASHING (BCRYPT) & RLS HARDENING
-- Portal Wali Murid & Dashboard Pengelola Les (Rumah Belajar English)
-- Paket 400 - Standar
-- =========================================================================

-- 1. AKTIFKAN EKSTENSI BCRYPT (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MIGRASI KOLOM PIN PADA TABEL STUDENTS
-- Tambahkan kolom pin_hash dan pin_updated_at jika belum ada
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrasikan PIN plaintext yang ada ke format bcrypt (jika kolom pin masih ada)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'students' 
          AND column_name = 'pin'
    ) THEN
        UPDATE public.students
        SET pin_hash = crypt(pin, gen_salt('bf', 10)),
            pin_updated_at = NOW()
        WHERE pin_hash IS NULL AND pin IS NOT NULL;
        
        -- Hapus kolom plaintext PIN demi keamanan data
        ALTER TABLE public.students DROP COLUMN pin;
    END IF;
END $$;

-- Pastikan jika ada siswa yang belum punya pin_hash, berikan default '123456' ter-hash
UPDATE public.students
SET pin_hash = crypt('123456', gen_salt('bf', 10)),
    pin_updated_at = NOW()
WHERE pin_hash IS NULL;

-- 3. FUNGSI SERVER-SIDE RPC: VERIFIKASI PIN SISWA
-- Memeriksa PIN secara aman di server tanpa membocorkan hash ke client/Google Sheets
CREATE OR REPLACE FUNCTION public.verify_student_pin(
    p_token TEXT,
    p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_student RECORD;
    v_is_valid BOOLEAN := FALSE;
BEGIN
    -- Validasi format PIN harus tepat 6 digit angka
    IF p_pin IS NULL OR p_pin !~ '^\d{6}$' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Format PIN tidak valid. Masukkan tepat 6 digit angka.'
        );
    END IF;

    -- Ambil data siswa berdasarkan token
    SELECT id, token, pin_hash INTO v_student
    FROM public.students
    WHERE token = p_token
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Data siswa tidak ditemukan.'
        );
    END IF;

    -- Periksa kecocokan PIN menggunakan crypt()
    IF v_student.pin_hash IS NOT NULL AND v_student.pin_hash = crypt(p_pin, v_student.pin_hash) THEN
        v_is_valid := TRUE;
    END IF;

    IF v_is_valid THEN
        RETURN jsonb_build_object(
            'valid', true,
            'student_id', v_student.id,
            'message', 'Verifikasi PIN berhasil.'
        );
    ELSE
        RETURN jsonb_build_object(
            'valid', false,
            'message', '6-Digit PIN salah. Silakan periksa kembali.'
        );
    END IF;
END;
$$;

-- 4. FUNGSI SERVER-SIDE RPC: UBAH PIN SISWA
-- Memperbarui PIN siswa secara mandiri oleh wali murid dengan validasi PIN lama
CREATE OR REPLACE FUNCTION public.update_student_pin(
    p_token TEXT,
    p_old_pin TEXT,
    p_new_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_student RECORD;
    v_old_valid BOOLEAN := FALSE;
BEGIN
    -- Validasi format PIN baru
    IF p_new_pin IS NULL OR p_new_pin !~ '^\d{6}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'PIN baru harus terdiri dari tepat 6 angka numerik (0-9).'
        );
    END IF;

    -- Ambil siswa berdasarkan token
    SELECT id, pin_hash INTO v_student
    FROM public.students
    WHERE token = p_token
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Siswa tidak ditemukan.'
        );
    END IF;

    -- Cek kecocokan PIN lama
    IF v_student.pin_hash IS NOT NULL AND v_student.pin_hash = crypt(p_old_pin, v_student.pin_hash) THEN
        v_old_valid := TRUE;
    END IF;

    IF NOT v_old_valid THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'PIN lama yang Anda masukkan tidak sesuai.'
        );
    END IF;

    -- Update pin_hash dengan bcrypt salt baru
    UPDATE public.students
    SET pin_hash = crypt(p_new_pin, gen_salt('bf', 10)),
        pin_updated_at = NOW()
    WHERE id = v_student.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'PIN berhasil diperbarui.'
    );
END;
$$;

-- 5. TABEL SYNC_ERROR_LOGS (Pencatatan Error Sinkronisasi Webhook)
CREATE TABLE IF NOT EXISTS public.sync_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL,
    payload_summary TEXT,
    error_message TEXT NOT NULL,
    retry_status VARCHAR(50) DEFAULT 'failed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PENEGAKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_error_logs ENABLE ROW LEVEL SECURITY;

-- Cabut akses langsung SELECT pada kolom pin_hash untuk anon dan authenticated
-- agar hash bcrypt tidak pernah dapat dibaca dari client-side
REVOKE SELECT (pin_hash) ON public.students FROM anon, authenticated;

-- Bersihkan policy lama jika ada untuk students
DROP POLICY IF EXISTS "Allow public read students" ON public.students;
DROP POLICY IF EXISTS "Allow public update students" ON public.students;

-- Policy baru untuk students:
-- BACA: Siapapun (anon) boleh membaca metadata siswa non-rahasia
CREATE POLICY "Allow public read students metadata" 
    ON public.students 
    FOR SELECT 
    USING (true);

-- TULIS/UPDATE: Hanya bisa lewat RPC (SECURITY DEFINER) atau service_role
CREATE POLICY "Allow service_role full access students" 
    ON public.students 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Policy untuk sync_error_logs:
DROP POLICY IF EXISTS "Allow anon insert error logs" ON public.sync_error_logs;
DROP POLICY IF EXISTS "Allow service_role view error logs" ON public.sync_error_logs;

CREATE POLICY "Allow anon insert error logs" 
    ON public.sync_error_logs 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow service_role view error logs" 
    ON public.sync_error_logs 
    FOR SELECT 
    TO service_role 
    USING (true);

-- 7. BERIKAN HAK EKSEKUSI RPC KEPADA ANON & AUTHENTICATED
GRANT EXECUTE ON FUNCTION public.verify_student_pin(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_student_pin(TEXT, TEXT, TEXT) TO anon, authenticated;

-- =========================================================================
-- 8. QUERY AUDIT RLS & VERIFIKASI KEAMANAN
-- Jalankan query di bawah ini untuk memastikan seluruh tabel memiliki RLS aktif (relrowsecurity = true)
-- =========================================================================
-- SELECT 
--     relname AS table_name, 
--     relrowsecurity AS rls_enabled
-- FROM pg_class 
-- JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
-- WHERE pg_namespace.nspname = 'public' 
--   AND relkind = 'r' 
--   AND relname IN ('students', 'tuitions', 'attendances', 'exam_results', 'galleries', 'institution_config', 'sync_error_logs');
