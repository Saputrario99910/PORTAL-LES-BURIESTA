# Portal Wali Murid & Dashboard Pengelola Les (Rumah Belajar English)

A production-ready React 19 + TypeScript + Vite Single Page Application (SPA) designed for tutoring and course institutions. It provides a PIN-authenticated portal for parents to monitor attendance, unit test grades, dynamic tuition invoices, and learning galleries, alongside an integrated administration dashboard for tutors and institutional owners. The application uses Supabase as its primary backend with Row Level Security (RLS) and bcrypt-hashed PIN validation, with outbound one-way synchronization to Google Sheets via an Apps Script webhook for administrative archiving.

---

## Tech Stack

- **Frontend Core**: React 19 (`19.0.1`), TypeScript (`~7.0.2`), Vite (`^8.3.0`)
- **Styling & UI**: Tailwind CSS (`^4.3.3`), `@tailwindcss/vite`, Lucide React icons (`^0.546.0`), Motion (`^12.23.24`)
- **Backend & Database**: Supabase (`@supabase/supabase-js ^2.119.0`), PostgreSQL with `pgcrypto` (bcrypt) & `uuid-ossp`
- **External Archival**: Google Apps Script Webhook (One-way outbound export to Google Sheets)
- **Deployment Target**: Netlify (Pure client-side static SPA bundle)

---

## Prerequisites

- **Node.js**: v18.x or v20.x+ LTS
- **Package Manager**: `npm` (v9+) or `pnpm`
- **Supabase Account**: A free or paid Supabase project with PostgreSQL
- **Netlify Account**: Free tier (300 credits/mo) or Personal plan (1,000 credits/mo)

---

## Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Saputrario99910/PORTAL-LES-BURIESTA.git
cd PORTAL-LES-BURIESTA
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials and Google Apps Script Webhook URL.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Preview Production Bundle
```bash
npm run build
npm run preview
```

---

## Environment Variables

All variables used by the application are prefixed with `VITE_` because this project is a client-side SPA. There are no server-side Node.js environment variables.

| Variable | Required | Description | Example Placeholder |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | HTTPS API URL of your Supabase project | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Public anonymous (`anon`) API key with RLS enforcement | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_GOOGLE_SHEETS_WEBHOOK_URL` | Optional | Web app URL generated after deploying Google Apps Script | `https://script.google.com/macros/s/AKfycb.../exec` |
| `VITE_GOOGLE_SHEETS_WEBHOOK_SECRET` | Optional | Shared authentication secret sent in webhook payload header | `rbe_sec_2026_wbk99` |

---

## Deployment to Netlify

This project builds into a static client bundle inside `dist/`.

### 1. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 2. Single Page App (SPA) Redirect Requirement
Netlify must route all browser history navigations (`/*`) to `/index.html`. You can add a `_redirects` file or use `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
*(A client rewrite is already pre-configured for Vercel/Netlify compatibility in [vercel.json](file:///C:/Users/YOGA%20260/antigravity/Portal-Wali-Murid---Rumah-Belajar-English/vercel.json)).*

### 3. Environment Variables in Netlify
Go to **Site Configuration → Environment variables** in the Netlify dashboard and add the four `VITE_*` keys listed above.

---

## Supabase Setup Summary

1. Create a new Supabase project in your regional data center.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the schema migrations in order:
   - Run `supabase/schema.sql` (Creates extensions, tables, bcrypt RPC functions, and initial RLS policies).
   - Alternatively, apply sequential files from `supabase/migrations/`:
     - `01_harden_auth_and_rls.sql` (Enables `pgcrypto`, drops plaintext PINs, creates `verify_student_pin` and `update_student_pin` RPCs, and enforces RLS).
     - `02_simple_dynamic_invoices.sql` (Adds `line_items` JSONB and `total_amount` columns).
4. Verify RLS: Ensure `relrowsecurity = true` on `students`, `tuitions`, `attendances`, `exam_results`, `galleries`, `institution_config`, and `sync_error_logs`.
5. Storage Bucket: Create a public or authenticated bucket named `receipts` or `avatars` for user uploads if using Supabase Storage.

---

## Google Sheets Sync (One-Way Outbound)

- **One-way mirror only**: Data is sent from the client application directly to Google Apps Script via `POST` requests. Google Sheets is **never** used for real-time authentication or as a write path back into Supabase.
- **Webhook Authentication**: Every request includes `secret: VITE_GOOGLE_SHEETS_WEBHOOK_SECRET`. Requests lacking this secret are rejected with `401 Unauthorized`.
- **Idempotency**: Requests carry a unique `idempotency_key` cached for 6 hours in Google Apps Script `CacheService` to prevent duplicate rows.
- **Error Logging**: Network failures or non-200 responses are automatically logged to the Supabase table `sync_error_logs`.

---

## Documentation Links

- [ARCHITECTURE.md](file:///C:/Users/YOGA%20260/antigravity/Portal-Wali-Murid---Rumah-Belajar-English/ARCHITECTURE.md) - System architecture, authentication flows, data flows, and security model.
- [DATABASE.md](file:///C:/Users/YOGA%20260/antigravity/Portal-Wali-Murid---Rumah-Belajar-English/DATABASE.md) - Comprehensive database schema, table purposes, RLS policies, and RPC specifications.
- [TEMPLATE_GUIDE.md](file:///C:/Users/YOGA%20260/antigravity/Portal-Wali-Murid---Rumah-Belajar-English/TEMPLATE_GUIDE.md) - Step-by-step instantiation guide for deploying this template to new tutoring centers.
- [DEPLOY_LOG.md](file:///C:/Users/YOGA%20260/antigravity/Portal-Wali-Murid---Rumah-Belajar-English/DEPLOY_LOG.md) - Deployment audit log and Netlify credit budget tracker.
- [CHANGELOG.md](file:///C:/Users/YOGA%20260/antigravity/Portal-Wali-Murid---Rumah-Belajar-English/CHANGELOG.md) - Version history and release notes.
