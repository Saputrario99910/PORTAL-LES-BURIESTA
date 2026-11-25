# Database Documentation

This document covers all PostgreSQL database tables, stored procedures, Row Level Security (RLS) policies, and data structures implemented in `supabase/schema.sql` and `supabase/migrations/`.

---

## 1. Table Definitions & Relationships

### `public.students`
Stores student master records, parent contact details, class metadata, and bcrypt PIN hashes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `uuid_generate_v4()` | Unique internal student ID |
| `token` | VARCHAR(64) | UNIQUE, NOT NULL | Public slug for direct URL access (`/?token=...`) |
| `pin_hash` | TEXT | NOT NULL | One-way bcrypt hash of 6-digit access PIN |
| `pin_updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Timestamp of last PIN modification |
| `name` | VARCHAR(255) | NOT NULL | Student full name |
| `nickname` | VARCHAR(100) | NOT NULL | Student calling name |
| `class_id` | VARCHAR(50) | Nullable | Class identifier (e.g. `cls_kids_a`) |
| `class_name` | VARCHAR(100) | Nullable | Group name (e.g. `Kids A`, `Teens 1`) |
| `class_level` | VARCHAR(255) | NOT NULL | Grade / curriculum level description |
| `schedule` | VARCHAR(255) | NOT NULL | Weekly schedule description |
| `teacher_name` | VARCHAR(255) | NOT NULL | Assigned tutor name |
| `teacher_whatsapp` | VARCHAR(50) | NOT NULL | Tutor WhatsApp contact (E.164 format without `+`) |
| `avatar_url` | TEXT | Nullable | Profile picture URL |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Record creation timestamp |

---

### `public.tuitions`
Tracks fee invoices, recurring monthly SPP, dynamic line items, and partial payment histories.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `uuid_generate_v4()` | Unique invoice record ID |
| `student_id` | UUID | NOT NULL, REFERENCES `public.students(id)` ON DELETE CASCADE | Target student reference |
| `period` | VARCHAR(100) | NOT NULL | Billing period label (e.g. `"November 2024"`) |
| `amount` | NUMERIC(12, 2) | NOT NULL, DEFAULT 250000 | Current remaining / active billed balance |
| `total_amount` | NUMERIC(12, 2) | DEFAULT 250000 | Immutable total invoice amount snapshot |
| `due_date` | VARCHAR(50) | NOT NULL | Due date text (e.g. `"10 November 2024"`) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `'belum'` | State: `'lunas'`, `'cicilan'`, `'menunggu'`, `'belum'` |
| `payment_date` | VARCHAR(50) | Nullable | Timestamp text when payment was verified |
| `payment_method` | VARCHAR(100) | Nullable | Bank transfer, QRIS, or cash description |
| `proof_url` | TEXT | Nullable | Transfer receipt URL |
| `line_items` | JSONB | DEFAULT `'[]'::jsonb` | Itemized invoice breakdown (see structure below) |
| `payment_history` | JSONB | DEFAULT `'[]'::jsonb` | Audit log of partial payment transactions |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Invoice creation timestamp |

#### Invoice Structure & Snapshot Rule
Invoices store line items in the `line_items` JSONB column:
```json
[
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
]
```
- **Total Amount Snapshot Rule**: `total_amount` is fixed at invoice generation time (sum of `line_total`). Subsequent partial payments decrement `amount` (the balance remaining) but leave `total_amount` unchanged.

---

### `public.attendances`
Records individual session attendances per student.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `uuid_generate_v4()` | Attendance record ID |
| `student_id` | UUID | NOT NULL, REFERENCES `public.students(id)` ON DELETE CASCADE | Student reference |
| `week_number` | INT | NOT NULL | Sequential meeting index (1, 2, 3...) |
| `date` | VARCHAR(100) | NOT NULL | Meeting date |
| `topic` | TEXT | NOT NULL | Lesson topic covered |
| `status` | VARCHAR(20) | NOT NULL, CHECK in (`'hadir'`, `'izin'`, `'sakit'`, `'alpa'`) | Attendance status |
| `teacher_note` | TEXT | Nullable | Tutor observation or homework notes |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Record creation timestamp |

---

### `public.exam_results`
Stores curriculum unit evaluations, test scores, and feedback for reporting progress.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `uuid_generate_v4()` | Test result ID |
| `student_id` | UUID | NOT NULL, REFERENCES `public.students(id)` ON DELETE CASCADE | Student reference |
| `book_name` | VARCHAR(255) | NOT NULL | Curriculum textbook identifier |
| `unit_number` | INT | NOT NULL | Unit chapter number |
| `unit_title` | VARCHAR(255) | NOT NULL | Unit title |
| `score` | INT | NOT NULL | Score achieved |
| `max_score` | INT | NOT NULL, DEFAULT 100 | Maximum possible points |
| `date` | VARCHAR(100) | NOT NULL | Evaluation date |
| `strengths` | TEXT | Nullable | Highlighted strengths |
| `teacher_feedback` | TEXT | Nullable | Tutor notes and action points |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Creation timestamp |

---

### `public.galleries`
Holds activity documentation, classroom photos, and project showcases.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `uuid_generate_v4()` | Gallery item ID |
| `student_id` | UUID | Nullable, REFERENCES `public.students(id)` ON DELETE SET NULL | Tagged student or NULL for group |
| `title` | VARCHAR(255) | NOT NULL | Activity headline |
| `date` | VARCHAR(100) | NOT NULL | Date of activity |
| `image_url` | TEXT | NOT NULL | Primary thumbnail/image URL |
| `caption` | TEXT | Nullable | Activity description |
| `category` | VARCHAR(100) | NOT NULL | Activity category (Classroom, Project, etc.) |
| `photos` | JSONB | DEFAULT `'[]'::jsonb` | Array of additional photo URLs |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Record creation timestamp |

---

### `public.institution_config`
Global institutional branding, contacts, and legal entity display text.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY, DEFAULT `'main_profile'` | Singleton row ID |
| `name` | VARCHAR(255) | NOT NULL, DEFAULT `'Rumah Belajar English'` | Institution name |
| `tagline` | TEXT | DEFAULT `'...'` | Institution motto / tagline |
| `short_name` | VARCHAR(50) | DEFAULT `'RBE'` | Short acronym |
| `logo_url` | TEXT | Nullable | URL to SVG/PNG logo |
| `badge_text` | VARCHAR(100) | DEFAULT `'Portal Resmi Wali Murid'` | Top bar badge text |
| `address` | TEXT | Nullable | Physical branch address |
| `phone` | VARCHAR(50) | Nullable | Main contact phone number |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Last update timestamp |

---

### `public.sync_error_logs`
Logs failed Google Sheets webhook dispatches for operational review and replay.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `uuid_generate_v4()` | Log ID |
| `action_type` | VARCHAR(100) | NOT NULL | Webhook action that failed |
| `payload_summary`| TEXT | Nullable | Sanitized payload metadata (PII/images stripped) |
| `error_message` | TEXT | NOT NULL | HTTP or network error response message |
| `retry_status` | VARCHAR(50) | DEFAULT `'failed'` | Replay status |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Log timestamp |

---

## 2. Server-Side Stored Procedures (RPCs)

### `verify_student_pin(p_token TEXT, p_pin TEXT) → JSONB`
- **Security Context**: `SECURITY DEFINER`, search path set to `public, pg_temp`.
- **Logic**:
  1. Validates `p_pin` regex `^\d{6}$`.
  2. Queries `students` for `p_token`.
  3. Evaluates `v_student.pin_hash = crypt(p_pin, v_student.pin_hash)`.
  4. Returns `{"valid": true, "student_id": "..."}` or `{"valid": false, "message": "..."}`.
- **Grants**: `EXECUTE` granted to `anon` and `authenticated`.

### `update_student_pin(p_token TEXT, p_old_pin TEXT, p_new_pin TEXT) → JSONB`
- **Security Context**: `SECURITY DEFINER`, search path set to `public, pg_temp`.
- **Logic**:
  1. Validates `p_new_pin` regex `^\d{6}$`.
  2. Verifies `p_old_pin` matches current `pin_hash`.
  3. Updates `pin_hash = crypt(p_new_pin, gen_salt('bf', 10))` and updates `pin_updated_at`.
- **Grants**: `EXECUTE` granted to `anon` and `authenticated`.

---

## 3. Row Level Security (RLS) Policy Summary

| Table | RLS Status | Anon Access (Public) | Authenticated / Service Role |
| :--- | :---: | :--- | :--- |
| `students` | **ENABLED** | `SELECT` metadata only (excluding `pin_hash`). Updates denied. | `service_role` has full read/write access. Updates via RPC. |
| `tuitions` | **ENABLED** | `SELECT`, `INSERT`, `UPDATE` allowed for parent payment flow. | Full read/write access. |
| `attendances`| **ENABLED** | `SELECT`, `INSERT`, `UPDATE` allowed. | Full read/write access. |
| `exam_results`| **ENABLED** | `SELECT`, `INSERT` allowed. | Full read/write access. |
| `galleries` | **ENABLED** | `SELECT`, `INSERT` allowed. | Full read/write access. |
| `institution_config`| **ENABLED** | `SELECT`, `UPDATE` allowed. | Full read/write access. |
| `sync_error_logs`| **ENABLED** | `INSERT` only (to write error traces). `SELECT` denied. | `service_role` has full `SELECT` access. |

### Column-Level Security Note:
`REVOKE SELECT (pin_hash) ON public.students FROM anon, authenticated;` is enforced in `01_harden_auth_and_rls.sql`. Direct SELECT queries on the `students` table will never expose the bcrypt hash to browser clients.

---

## 4. Known Gaps & Observations

1. **Role-Based Admin Authentication**:
   - The Admin dashboard currently runs directly inside the client without a separate Supabase Auth JWT (`supabase.auth.signInWithPassword`). As a result, tables like `tuitions` and `attendances` currently allow public `INSERT`/`UPDATE` policies. In a high-security multi-tenant setup, administrative writes should ideally be locked behind authenticated admin JWTs.
2. **Offline Mock Fallback**:
   - If `VITE_SUPABASE_URL` is unconfigured, the client seamlessly falls back to `src/data/mockData.ts`. When deploying to production, verify that the environment variables are active so real PostgreSQL queries execute.
