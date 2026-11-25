# Changelog

All notable changes to the Tutoring Portal & Management Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-11-16

### Added
- **PIN-Authenticated Parent Portal**:
  - Class-first selection workflow (`Kids A`, `Kids B`, `Teens 1`, `Teens 2`) with filtered student dropdown.
  - Server-side bcrypt PIN verification via PostgreSQL stored procedure (`verify_student_pin`).
  - Self-service PIN modification from student profile header (`update_student_pin`).
  - Persistent login session in browser `localStorage` (`rbe_auth_<student_id>`).
- **Tuition & Dynamic Invoice Management**:
  - Full payment (`Lunas`) and partial installment (`Cicilan`) recording.
  - Transparent balance breakdown displaying total billed, amount paid, and remaining balance.
  - Dynamic invoice line items (`line_items` JSONB) supporting SPP, textbooks, and event fees.
  - Total amount snapshot preservation (`total_amount`).
  - Recurring monthly invoice generator with custom due dates.
- **Attendance & Evaluation Module**:
  - Class session attendance tracking with meeting numbers, topics, and teacher notes.
  - Exam results reporting with unit test scores, strengths, and feedback trends.
- **Media & Gallery Showcase**:
  - Learning activity photo gallery with client-side image compression.
- **One-Way Google Sheets Export**:
  - Outbound synchronization to Google Apps Script webhook with shared secret authentication (`VITE_GOOGLE_SHEETS_WEBHOOK_SECRET`).
  - Webhook idempotency protection via script caching.
  - Failure logging to Supabase table `sync_error_logs`.
- **Comprehensive Technical Documentation**:
  - `README.md`, `ARCHITECTURE.md`, `DATABASE.md`, `TEMPLATE_GUIDE.md`, `DEPLOY_LOG.md`, `.env.example`, and `CHANGELOG.md`.

### Security Hardening
- Enabled PostgreSQL Row Level Security (RLS) on all seven database tables.
- Revoked public `SELECT` access on column `pin_hash` to prevent bcrypt hash extraction.
- Strict isolation of Google Sheets as an export-only sink; inbound authentication requests (`verify_pin`) are explicitly deprecated and rejected by the webhook handler.

### Known Limitations
- The Admin dashboard currently relies on client-side routing (`/admin`) and does not require a separate Supabase Auth user session (`supabase.auth.signInWithPassword`).
- If Supabase environment variables are missing, the client seamlessly falls back to offline mock datasets (`mockData.ts`).
