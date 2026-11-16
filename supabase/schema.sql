-- =========================================================================
-- SQL SCHEMA LENGKAP: PORTAL WALI MURID - RUMAH BELAJAR ENGLISH (SUPABASE)
-- Paket 400 - Standar (Security Hardened)
-- Copy dan Paste seluruh isi skrip ini ke menu "SQL Editor" di dashboard Supabase Anda, lalu klik RUN.
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL STUDENTS (Data Siswa)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(64) UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    pin_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    class_id VARCHAR(50),
    class_name VARCHAR(100),
    class_level VARCHAR(255) NOT NULL,
    schedule VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_whatsapp VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL TUITIONS (Iuran / Tagihan SPP)
CREATE TABLE IF NOT EXISTS public.tuitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    period VARCHAR(100) NOT NULL, -- Contoh: "November 2024"
    amount NUMERIC(12, 2) NOT NULL DEFAULT 250000,
    due_date VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'belum' CHECK (status IN ('lunas', 'cicilan', 'menunggu', 'belum')),
    payment_date VARCHAR(50),
    payment_method VARCHAR(100),
    proof_url TEXT,
    payment_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL ATTENDANCES (Absensi Pertemuan)
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    date VARCHAR(100) NOT NULL,
    topic TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpa')),
    teacher_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL EXAM_RESULTS (Nilai Unit Test & Grafik)
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    book_name VARCHAR(255) NOT NULL,
    unit_number INT NOT NULL,
    unit_title VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL DEFAULT 100,
    date VARCHAR(100) NOT NULL,
    strengths TEXT,
    teacher_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL GALLERIES (Galeri Dokumentasi & Foto Kegiatan)
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    category VARCHAR(100) NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb, -- Array multi foto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABEL INSTITUTION_CONFIG (Pengaturan Nama & Logo Lembaga)
CREATE TABLE IF NOT EXISTS public.institution_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_profile',
    name VARCHAR(255) NOT NULL DEFAULT 'Rumah Belajar English',
    tagline TEXT DEFAULT 'Membangun Kepercayaan Diri Berbahasa Inggris Sejak Dini',
    short_name VARCHAR(50) DEFAULT 'RBE',
    logo_url TEXT,
    badge_text VARCHAR(100) DEFAULT 'Portal Resmi Wali Murid',
    address TEXT,
    phone VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL SYNC_ERROR_LOGS (Log Error Sinkronisasi Webhook)
CREATE TABLE IF NOT EXISTS public.sync_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL,
    payload_summary TEXT,
    error_message TEXT NOT NULL,
    retry_status VARCHAR(50) DEFAULT 'failed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- SERVER-SIDE RPC FUNCTIONS: BCRYPT PIN AUTHENTICATION
-- =========================================================================

-- Verifikasi PIN Murid
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
    IF p_pin IS NULL OR p_pin !~ '^\d{6}$' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Format PIN tidak valid. Masukkan tepat 6 digit angka.'
        );
    END IF;

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

-- Perbarui PIN Murid
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
    IF p_new_pin IS NULL OR p_new_pin !~ '^\d{6}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'PIN baru harus terdiri dari tepat 6 angka numerik (0-9).'
        );
    END IF;

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

    IF v_student.pin_hash IS NOT NULL AND v_student.pin_hash = crypt(p_old_pin, v_student.pin_hash) THEN
        v_old_valid := TRUE;
    END IF;

    IF NOT v_old_valid THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'PIN lama yang Anda masukkan tidak sesuai.'
        );
    END IF;

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

-- =========================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_error_logs ENABLE ROW LEVEL SECURITY;

-- Cabut akses kolom pin_hash dari anon
REVOKE SELECT (pin_hash) ON public.students FROM anon, authenticated;

-- Students: Read metadata public, Tulis via RPC atau service_role
CREATE POLICY "Allow public read students metadata" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access students" ON public.students FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Tuitions: Read public, Tulis/Update public
CREATE POLICY "Allow public read tuitions" ON public.tuitions FOR SELECT USING (true);
CREATE POLICY "Allow public insert tuitions" ON public.tuitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tuitions" ON public.tuitions FOR UPDATE USING (true);

-- Attendances: Read public, Tulis/Update public
CREATE POLICY "Allow public read attendances" ON public.attendances FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendances" ON public.attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendances" ON public.attendances FOR UPDATE USING (true);

-- Exam Results & Galleries: Read public, Tulis public
CREATE POLICY "Allow public read exam_results" ON public.exam_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert exam_results" ON public.exam_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read galleries" ON public.galleries FOR SELECT USING (true);
CREATE POLICY "Allow public insert galleries" ON public.galleries FOR INSERT WITH CHECK (true);

-- Institution Config: Read & Update public
CREATE POLICY "Allow public read institution_config" ON public.institution_config FOR SELECT USING (true);
CREATE POLICY "Allow public update institution_config" ON public.institution_config FOR UPDATE USING (true);

-- Sync Error Logs: Insert anon, Select service_role
CREATE POLICY "Allow anon insert error logs" ON public.sync_error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service_role view error logs" ON public.sync_error_logs FOR SELECT TO service_role USING (true);

-- RPC Grants
GRANT EXECUTE ON FUNCTION public.verify_student_pin(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_student_pin(TEXT, TEXT, TEXT) TO anon, authenticated;

-- =========================================================================
-- SEED DATA AWAL (Contoh Siswa Kenzo Alfarizi Pratama)
-- =========================================================================
INSERT INTO public.students (id, token, pin_hash, name, nickname, class_name, class_level, schedule, teacher_name, teacher_whatsapp, avatar_url)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'kenzo-404',
    crypt('123456', gen_salt('bf', 10)),
    'Kenzo Alfarizi Pratama',
    'Kenzo',
    'Primary Explorer A',
    'Primary English Explorer (Kelas 3 SD)',
    'Selasa & Kamis · 15.30 - 17.00 WIB',
    'Miss Sarah Amalia, S.Pd.',
    '6281234567890',
    'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80'
) ON CONFLICT (token) DO NOTHING;

-- Seed Tagihan SPP
INSERT INTO public.tuitions (student_id, period, amount, due_date, status, payment_date, payment_method)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'November 2024', 250000, '10 November 2024', 'belum', NULL, NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Oktober 2024', 250000, '10 Oktober 2024', 'menunggu', '9 Oktober 2024', 'Transfer Bank BCA'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'September 2024', 250000, '10 September 2024', 'lunas', '5 September 2024', 'Transfer Bank BCA')
ON CONFLICT DO NOTHING;

-- Seed Nilai Unit Test Kenzo
INSERT INTO public.exam_results (student_id, book_name, unit_number, unit_title, score, max_score, date, strengths, teacher_feedback)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Book 1: Welcome & My World', 1, 'Unit 1: Hello & My Classroom', 82, 100, '12 September 2024', 'Mengenal nama-nama benda ruang kelas dan greeting.', 'Awal yang bagus! Kenzo sudah percaya diri menyapa teman-teman.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Book 1: Welcome & My World', 2, 'Unit 2: Colors, Shapes & Numbers', 88, 100, '26 September 2024', 'Ejaan angka 1-20 dan pengelompokan warna primer.', 'Skor meningkat! Hafalan angka Kenzo sangat kuat dan teliti.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Book 1: Welcome & My World', 3, 'Unit 3: My Family & Big House', 85, 100, '10 Oktober 2024', 'Vocabulary sebutan silsilah keluarga inti.', 'Bagus sekali! Perlu sedikit latihan membedakan He is / She is.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Book 1: Welcome & My World', 4, 'Unit 4: Fun Toys & Daily Hobbies', 94, 100, '24 Oktober 2024', 'Listening test sempurna dan pengucapan hobi.', 'Luar biasa! Nilai melonjak tinggi karena Kenzo sangat antusias di topik hobi.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Book 1: Welcome & My World', 5, 'Unit 5: Animals & Nature Friends', 90, 100, '7 November 2024', 'Menulis deskripsi ciri hewan dengan rapi.', 'Konsisten di atas 90! Lembar kerja tulisan tangan sangat rapi.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Book 1: Welcome & My World', 6, 'Unit 6: Final Review & Speaking Test', 96, 100, '14 November 2024', 'Presentasi lisan lancar dan interaktif.', 'Skor tertinggi di kelas! Kenzo siap melanjutkan ke Book 2.')
ON CONFLICT DO NOTHING;

-- Seed Identitas Lembaga
INSERT INTO public.institution_config (id, name, tagline, short_name, badge_text)
VALUES ('main_profile', 'Rumah Belajar English', 'Membangun Kepercayaan Diri Berbahasa Inggris Sejak Dini', 'RBE', 'Portal Resmi Wali Murid')
ON CONFLICT (id) DO NOTHING;
