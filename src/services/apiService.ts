import { supabase, isSupabaseConfigured, syncToGoogleSheets } from '../lib/supabase.ts';
import {
  Student,
  AttendanceRecord,
  TuitionRecord,
  UnitExamResult,
  GalleryItem,
  InstitutionConfig,
} from '../types/index.ts';
import {
  mockStudents,
  mockAttendanceRecords,
  mockTuitionRecords,
  mockUnitExamResults,
  mockGalleryItems,
  initialInstitutionConfig,
} from '../data/mockData.ts';

/**
 * Service Siswa
 */
export async function getStudentByToken(token: string): Promise<Student> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('token', token)
        .single();
      if (!error && data) {
        return data as Student;
      }
    } catch (e) {
      console.warn('Gagal memuat siswa dari Supabase, beralih ke mockData:', e);
    }
  }
  const found = mockStudents.find((s) => s.token === token);
  return found || mockStudents[0];
}

/**
 * Update Foto Profil Siswa
 */
export async function updateStudentAvatar(studentId: string, avatarUrl: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('students')
        .update({ avatar_url: avatarUrl })
        .eq('id', studentId);
      if (!error) return true;
    } catch (e) {
      console.warn('Gagal update avatar ke Supabase:', e);
    }
  }
  return true;
}

/**
 * Ambil Riwayat Iuran SPP
 */
export async function getTuitionRecords(studentId: string): Promise<TuitionRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tuitions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as TuitionRecord[];
      }
    } catch (e) {
      console.warn('Gagal memuat iuran dari Supabase, beralih ke mockData:', e);
    }
  }
  return mockTuitionRecords.filter((t) => t.student_id === studentId);
}

/**
 * Update Status Iuran & Otomatis Sinkronisasi ke Google Sheets jika Lunas
 */
export async function updateTuitionRecord(
  student: Student,
  record: TuitionRecord
): Promise<boolean> {
  // 1. Simpan ke Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('tuitions')
        .update({
          status: record.status,
          payment_date: record.payment_date,
          payment_method: record.payment_method,
          proof_url: record.proof_url,
        })
        .eq('id', record.id);
    } catch (e) {
      console.warn('Gagal menyimpan iuran ke Supabase:', e);
    }
  }

  // 2. Jika status berubah jadi "lunas", sinkronkan otomatis baris baru ke Google Sheets
  if (record.status === 'lunas') {
    syncToGoogleSheets('pembayaran_lunas', {
      student_name: student.name,
      class_level: student.class_level,
      period: record.period,
      amount: record.amount,
      payment_method: record.payment_method,
      payment_date: record.payment_date,
    });
  }

  return true;
}

/**
 * Ambil Nilai Ujian Unit Test
 */
export async function getExamResults(studentId: string): Promise<UnitExamResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_id', studentId)
        .order('unit_number', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as UnitExamResult[];
      }
    } catch (e) {
      console.warn('Gagal memuat ujian dari Supabase, beralih ke mockData:', e);
    }
  }
  return mockUnitExamResults.filter((e) => e.student_id === studentId);
}

/**
 * Simpan Absensi Kelas Baru (sekaligus sync ke Google Sheets)
 */
export async function recordClassAttendance(attendanceList: {
  student_name: string;
  class_name: string;
  date: string;
  status: string;
  teacher_note?: string;
}[]) {
  for (const item of attendanceList) {
    syncToGoogleSheets('absensi_baru', item);
  }
}
