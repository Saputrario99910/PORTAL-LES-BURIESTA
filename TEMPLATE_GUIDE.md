# Client Template Instantiation Guide

This guide details the step-by-step process for instantiating this tutoring portal application for a **new client** (applicable to any tutoring center, music academy, or learning institution).

---

## 1. Prerequisites for New Client Setup

- A dedicated GitHub repository (or new branch) cloned from this template.
- A new **Supabase project** created under the client’s organization.
- A new **Netlify site** created under a dedicated team (to prevent credit pooling).
- A new **Google Spreadsheet** (if one-way backup archiving is requested).

---

## 2. Step-by-Step Instantiation

### Step 1: Clone and Clean Repository
```bash
git clone https://github.com/Saputrario99910/PORTAL-LES-BURIESTA.git client-portal
cd client-portal
npm install
```

### Step 2: Set Up New Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name the project after the client (e.g. `bimbel-bintang-cemerlang`).
3. Note the Database Password and select your nearest geographic region.
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### Step 3: Run Database Migrations
1. Open the Supabase **SQL Editor**.
2. Copy and execute `supabase/schema.sql`.
3. Verify that all 7 tables and the 2 stored procedures (`verify_student_pin`, `update_student_pin`) exist.
4. Run this query in the SQL Editor to ensure RLS is active:
   ```sql
   SELECT relname, relrowsecurity 
   FROM pg_class 
   JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
   WHERE pg_namespace.nspname = 'public' 
     AND relname IN ('students', 'tuitions', 'attendances', 'exam_results', 'galleries', 'institution_config', 'sync_error_logs');
   ```

### Step 4: Seed Client-Specific Data
Never leave demo records (`Kenzo`, `Nadira`) in a live client system. Seed real classes, fee structures, and students:

```sql
-- Seed Institution Branding
INSERT INTO public.institution_config (id, name, tagline, short_name, badge_text, phone, address)
VALUES (
    'main_profile',
    'Bimbel Bintang Cemerlang',
    'Membimbing Siswa Berprestasi Sejak Dini',
    'BBC',
    'Portal Resmi Wali Murid',
    '6281298765432',
    'Jl. Anggrek No. 45, Surabaya'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    short_name = EXCLUDED.short_name,
    phone = EXCLUDED.phone;

-- Seed First Student with a default PIN (123456)
INSERT INTO public.students (token, pin_hash, name, nickname, class_name, class_level, schedule, teacher_name, teacher_whatsapp)
VALUES (
    'budi-101',
    crypt('123456', gen_salt('bf', 10)),
    'Budi Santoso',
    'Budi',
    'Kelas Calistung A',
    'Tingkat TK B & SD 1',
    'Senin & Rabu · 14.00 - 15.30 WIB',
    'Kak Dewi, S.Pd.',
    '6281298765432'
);
```

### Step 5: Configure Google Sheets Outbound Webhook (Optional)
If the client desires automated spreadsheet archives:
1. Open a new Google Sheet: `https://sheets.new`.
2. Go to **Extensions → Apps Script**.
3. Replace the code with the contents of `google-apps-script/code.js`.
4. Run `setupDatabaseMaster()` from the Apps Script toolbar to create the required sheet tabs.
5. Click **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the web app URL and assign it to `VITE_GOOGLE_SHEETS_WEBHOOK_URL` in `.env`.

### Step 6: Branding & Configuration Mapping

Review and customize the following files for institution-specific branding:

| Aspect | Target File | Notes |
| :--- | :--- | :--- |
| **Institution Name & Slogan** | Supabase `institution_config` table and fallback in `src/data/mockData.ts` | Stored in DB; dynamically updated from Admin |
| **HTML Page Title & Meta** | `index.html` | Update `<title>` tag and favicon |
| **Bank Accounts & QRIS** | `src/data/mockData.ts` (`courseBankAccounts`) | List institution bank account numbers and payment instructions |
| **Classes & Groups** | `src/data/teachingClassesData.ts` | Define default class names (`Kids A`, `Teens 1`, etc.) |
| **Colors & Themes** | `src/index.css` & `src/context/ThemeContext.tsx` | Modify theme color tokens |

### Step 7: Create Netlify Site Under a Dedicated Team
1. In the Netlify dashboard, ensure you are in a team dedicated to this client (or isolated account).
2. Click **Add new site → Import an existing project**.
3. Connect the GitHub repository.
4. Set Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_SHEETS_WEBHOOK_URL`
   - `VITE_GOOGLE_SHEETS_WEBHOOK_SECRET`
6. Deploy the site.

---

## 3. Netlify Credit Discipline Guidelines

To operate within Netlify's free credit tier (300 credits/mo):
- **Work on a Development Branch**: Do not push everyday commits to `main`. Every production deploy costs **15 credits flat**.
- **Deploy in Batches**: Merge updates to `main` only once or twice a week (8–10 deploys/month = 120–150 credits).
- **Use Deploy Previews**: Pull requests generate preview URLs that can be tested before releasing to production.
- **Keep Media on Supabase**: Never bundle large images or payment receipts into `src/assets/` or `public/`.
- **Monitor Usage**: Check Netlify **Billing → Usage** weekly.

---

## 4. Pre-Launch Testing Checklist

Before delivering the portal to the client:

- [ ] **PIN Login**: Successfully enter the 6-digit PIN and verify access into the portal.
- [ ] **Wrong PIN Validation**: Enter an incorrect PIN and verify error feedback.
- [ ] **PIN Self-Update**: Change the PIN in the student profile header and confirm the new PIN works.
- [ ] **Attendance Submission**: Open the Admin dashboard, submit an attendance record, and verify persistence.
- [ ] **Grades & Evaluation**: Submit an exam result and verify trend chart updates.
- [ ] **Invoice Creation**: Generate an invoice with line items (e.g. SPP + Book fee) and check total amount calculation.
- [ ] **Partial / Installment Payment**: Record a partial payment (e.g. Rp 100.000 of Rp 250.000) and verify that remaining balance displays correctly in both Admin and Parent views.
- [ ] **Full Payment**: Mark an invoice as full payment and verify status badge turns green (`LUNAS`).
- [ ] **Payment Proof Upload**: Test uploading an image receipt and ensure client-side compression succeeds.
- [ ] **WhatsApp Contact Link**: Click the WhatsApp button and verify it opens the correct tutor phone number.
- [ ] **Direct URL Navigation**: Refresh the browser on nested views to confirm SPA rewrite routing works (`/index.html`).
- [ ] **RLS Verification**: Test querying `students` via the browser console with the anon key and confirm `pin_hash` cannot be selected.
