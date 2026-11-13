export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';
export type TuitionStatus = 'lunas' | 'menunggu' | 'belum';
export type LearningPlanStatus = 'selesai' | 'sedang_berjalan' | 'akan_datang';

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
  class_level: string;
  schedule: string;
  teacher_name: string;
  teacher_whatsapp: string;
  pin: string;
  avatar_url: string;
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
  period: string; // e.g. "November 2024"
  amount: number;
  due_date: string;
  status: TuitionStatus;
  payment_date?: string;
  payment_method?: string;
  proof_url?: string;
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
