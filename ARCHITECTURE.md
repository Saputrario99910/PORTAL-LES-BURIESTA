# System Architecture

This document describes the high-level architecture, security boundaries, and data flows of the Tutoring Portal & Management Dashboard.

---

## 1. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                   |
|                                                                                         |
|   +------------------------------------+       +------------------------------------+   |
|   |         PARENT PORTAL              |       |          ADMIN DASHBOARD           |   |
|   |   - PIN Lock / Student Selection   |       |   - Class & Meeting Manager        |   |
|   |   - Attendance, Grades, Gallery    |       |   - Tuition & Installment Register |   |
|   |   - Invoices & Partial Payments    |       |   - Gallery Upload & Sync Controls |   |
|   +-----------------+------------------+       +-----------------+------------------+   |
+---------------------|--------------------------------------------|----------------------+
                      |                                            |
                      | Direct Client HTTPS Queries                | Direct Client HTTPS
                      | (Anon Key + PostgREST)                     |
                      v                                            v
+-----------------------------------------------------------------------------------------+
|                                   SUPABASE PLATFORM                                     |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                           PostgreSQL 15+ with RLS                               |   |
|   |                                                                                 |   |
|   |   [public.students]            [public.tuitions]        [public.attendances]    |   |
|   |   [public.exam_results]        [public.galleries]       [public.sync_error_logs]|   |
|   |   [public.institution_config]                                                   |   |
|   |                                                                                 |   |
|   |   SECURITY DEFINER RPCs (bcrypt pgcrypto):                                      |   |
|   |   - verify_student_pin(p_token, p_pin)                                          |   |
|   |   - update_student_pin(p_token, p_old_pin, p_new_pin)                           |   |
|   +---------------------------------------------------------------------------------+   |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                                Supabase Storage                                 |   |
|   |   - Client-compressed payment proofs, student avatars, and activity galleries   |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
                                           |
                                           | Async Webhook POST (One-Way Outbound)
                                           | Headers: Shared Secret + Idempotency Key
                                           v
+-----------------------------------------------------------------------------------------+
|                                  GOOGLE WORKSPACE                                       |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                           Google Apps Script Webhook                            |   |
|   |   - Validates EXPECTED_WEBHOOK_SECRET                                           |   |
|   |   - Checks CacheService for duplicate idempotency keys                          |   |
|   |   - Rejects inbound verify_pin requests (One-way outbound only)                 |   |
|   +---------------------------------------------------------------------------------+   |
|                                          |
|                                          v
|   +---------------------------------------------------------------------------------+   |
|   |                           Google Sheets (Archive Copy)                          |   |
|   |   - Tab: Data Akun Siswa (Archived Metadata)                                    |   |
|   |   - Tab: Pembayaran SPP (Ledger: Full & Partial Payments)                      |   |
|   |   - Tab: Absensi Siswa (Meetings & Notes Archive)                               |   |
|   |   - Tab: Nilai & Evaluasi Siswa (Unit Test Archive)                             |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Flow

### PIN Authentication Flow
1. **Entry Point**: The parent accesses the site with or without a query parameter (e.g. `/?token=kenzo-404`).
2. **Student & Class Selection**: If no token is provided or the user switches students, the UI presents class selection (`Kids A`, `Kids B`, `Teens 1`, etc.) followed by the student list.
3. **Server-Side Validation**:
   - The client invokes the PostgreSQL stored procedure:
     ```sql
     supabase.rpc('verify_student_pin', { p_token: token, p_pin: pin })
     ```
   - The procedure runs with `SECURITY DEFINER` privileges.
   - It executes `v_student.pin_hash = crypt(p_pin, v_student.pin_hash)` via `pgcrypto`.
   - The raw hash (`pin_hash`) is **revoked from public SELECT** and is never transmitted to the browser.
4. **Session Persistence**:
   - Upon successful verification, the browser stores an authentication flag in `localStorage` under `rbe_auth_<student_id>`.
   - Subsequent visits on the same device bypass the PIN screen until manually logged out.
5. **PIN Change**:
   - Parents can update their 6-digit PIN via `update_student_pin(p_token, p_old_pin, p_new_pin)`. The procedure validates the current PIN before generating a new bcrypt salt and updating `pin_hash`.

---

## 3. Module Data Flows

### A. Attendance (`attendances`)
- Admin marks attendance per class meeting (meeting number, date, topic, student status: `hadir`, `izin`, `sakit`, `alpa`, and notes).
- Saved directly to `attendances` in Supabase.
- A one-way outbound sync fires to Google Apps Script (`action: 'absensi_baru'`), writing an archive row to the "Absensi Siswa" sheet.

### B. Exam Results & Learning Plan (`exam_results`)
- Unit test scores, book titles, strengths, and feedback are recorded in Supabase.
- Displayed in the parent portal as visual score trends and progress bars.
- Outbound sync fires to Google Apps Script (`action: 'catat_penilaian'`).

### C. Invoices & Partial Payments (`tuitions`)
- Invoices are created with total amounts, due dates, and dynamic `line_items` (SPP, books, registration).
- Payments can be recorded in two ways:
  - **Full Payment (`lunas`)**: Resolves remaining balance to zero.
  - **Partial / Installment Payment (`cicilan`)**: Records paid amount, recalculates remaining amount, and appends a record to `payment_history` JSONB.
- Each payment transaction fires `syncToGoogleSheets('pembayaran_lunas')` to populate the "Pembayaran SPP" sheet with total billed, paid amount, remaining balance, and payment method.

### D. Gallery Documentation (`galleries`)
- Media items are uploaded and linked to specific students or general activities.
- Image URLs point to external CDNs or Supabase Storage buckets.

---

## 4. Google Sheets Non-Involvement in Real-Time Auth

> **CRITICAL ARCHITECTURAL BOUNDARY:**
> - Google Sheets is strictly an **outbound backup mirror**.
> - Google Sheets is **NOT** used for runtime authentication.
> - Google Sheets is **NOT** a write path back into Supabase.
> - The Apps Script `doPost` handler explicitly deprecates and rejects any `verify_pin` action. All authentication authority resides exclusively within Supabase.

---

## 5. Media & Storage Architecture

- **Asset Compression**: Images (payment receipts, student avatars) are scaled and compressed client-side via HTML Canvas / FileReader before transmission.
- **Storage Target**: Uploaded media is stored directly in Supabase Storage buckets or hosted on an external CDN.
- **Hosting Isolation**: Netlify serves **only** compiled static HTML, CSS, and JS bundles (`dist/`). Media files do not consume Netlify Edge bandwidth credits.

---

## 6. Deployment Topology & Multi-Tenancy

- **Single Client per Project (Recommended)**: Each tutoring institution runs under its own Supabase project and Netlify site/team.
- **Team Isolation**: Isolating Netlify teams prevents credit pooling exhaustion between different institutional clients.
- **Data Isolation**: Isolating Supabase projects ensures complete physical and regulatory separation of student and financial data.
