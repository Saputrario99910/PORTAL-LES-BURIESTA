-- =========================================================================
-- MIGRASI: WEB PUSH NOTIFICATION SUBSCRIPTIONS
-- Menampung endpoint dan token enkripsi (p256dh, auth) dari browser HP pengguna
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk pencarian cepat berdasarkan student_id dan endpoint
CREATE INDEX IF NOT EXISTS idx_push_subs_student ON public.push_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.push_subscriptions(endpoint);

-- Enable Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Publik/Anon diperbolehkan mendaftarkan (INSERT) dan memperbarui subscription HP-nya
CREATE POLICY "Allow public insert and update push subscriptions"
ON public.push_subscriptions
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
