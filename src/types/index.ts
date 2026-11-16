export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';
export type TuitionStatus = 'lunas' | 'cicilan' | 'menunggu' | 'belum';
export type LearningPlanStatus = 'selesai' | 'sedang_berjalan' | 'akan_datang';
export type BillingType = 'bulanan' | 'per_pertemuan' | 'lainnya';

export interface LearningPlanItem {
  id: string;
  student_id: string;
  meeting_number: number;
  date: string;
  topic: string;
  objective: string; // 1 kalimat tujuan singkat
  status: 'selesai' | 'akan_datang';
}

export interface Student {
  id: string;
  token: string;
  name: string;
  nickname: string;
  class_id?: string; // id kelas mengajar (misal: cls_kids_a, cls_kids_b)
  class_name?: string; // nama rombel (misal: Kids A, Kids B, Teens 1)
  class_level: string; // nama level / deskripsi tingkatan
  schedule: string;
  teacher_name: string;
  teacher_whatsapp: string;
  pin?: string; // Optional: Plaintext PIN dihilangkan dari DB, hanya ada di mock data
  pin_updated_at?: string;
  avatar_url: string;
}

export interface SyncErrorLog {
  id?: string;
  action_type: string;
  payload_summary?: string;
  error_message: string;
  retry_status?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  week_number: number;
  date: string;
  topic: string;
  status: AttendanceStatus;
  teacher_note: string;
}

export interface GalleryItem {
  id: string;
  student_id: string;
  title: string;
  date: string;
  image_url: string;
  caption: string;
  category: string;
  photos?: string[]; // Multiple photos for activities like Cooking Class
}

export interface TuitionRecord {
  id: string;
  student_id: string;
  title?: string; // e.g. "SPP Bulanan", "Modul & Flashcard", "4x Pertemuan Private"
  period: string; // e.g. "November 2024"
  billing_type?: BillingType;
  amount: number; // Total tagihan
  paid_amount?: number; // Nominal yang sudah dibayarkan (untuk cicilan)
  remaining_amount?: number; // Sisa kekurangan tagihan
  due_date: string;
  status: TuitionStatus;
  payment_date?: string;
  payment_method?: string;
  proof_url?: string;
  sender_name?: string;
  sender_last4?: string;
  notes?: string;
}

export interface RecurringBillingConfig {
  billing_type: 'bulanan' | 'per_pertemuan';
  title: string;
  default_amount: number;
  due_day_of_month: number; // tanggal jatuh tempo (misal tgl 10)
  auto_generate: boolean;
}

export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
  instructions: string;
}

// 1. Data Hasil Ujian / Unit Test
export interface UnitExamResult {
  id: string;
  student_id: string;
  book_name: string;
  unit_number: number;
  unit_title: string;
  score: number;
  max_score: number;
  date: string;
  strengths: string;
  teacher_feedback: string;
}

// 3. Silabus Rencana Belajar Multi-Pertemuan per Buku
export interface CurriculumMeeting {
  meeting_number: number;
  title: string;
  grammar_focus: string;
  vocabulary: string[];
  learning_goal: string;
  status: LearningPlanStatus;
}

export interface BookCurriculum {
  id: string;
  book_title: string;
  level: string;
  total_meetings: number;
  completed_meetings: number;
  description: string;
  meetings: CurriculumMeeting[];
}

// 6. Konfigurasi Lembaga Belajar (Mudah diganti nama dan logo)
export interface InstitutionConfig {
  name: string;
  tagline: string;
  short_name: string;
  logo_url: string; // Bisa SVG atau image path
  badge_text: string;
  address: string;
  phone: string;
}
