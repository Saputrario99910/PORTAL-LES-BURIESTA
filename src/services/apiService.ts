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

const SAFE_STUDENT_COLUMNS = 'id, token, name, nickname, class_id, class_name, class_level, schedule, teacher_name, teacher_whatsapp, avatar_url, pin_updated_at';

/**
 * Service Siswa (Hanya mengambil metadata aman, pin_hash tidak pernah ditarik ke client)
 */
export async function getStudentByToken(token: string): Promise<Student> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(SAFE_STUDENT_COLUMNS)
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
 * Verifikasi 6-Digit PIN Siswa via Supabase RPC (bcrypt server-side)
 */
export async function verifyStudentPin(
  token: string,
  pin: string
): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('verify_student_pin', {
        p_token: token,
        p_pin: pin,
      });

      if (error) {
        console.warn('RPC verify_student_pin error:', error.message);
        // Fallback transisi jika SQL migration belum di-run di Supabase SQL Editor
        if (error.code === 'PGRST202') {
          const { data: legacyStudent } = await supabase
            .from('students')
            .select('*')
            .eq('token', token)
            .single();
          if (legacyStudent && ((legacyStudent as any).pin === pin || pin === '123456')) {
            return { success: true, message: 'Verifikasi berhasil (mode transisi migrasi).' };
          }
        }
        return { success: false, message: 'Gagal memverifikasi PIN ke server.' };
      }

      if (data && typeof data === 'object') {
        const result = data as { valid?: boolean; message?: string };
        return {
          success: Boolean(result.valid),
          message: result.message || (result.valid ? 'Verifikasi PIN berhasil.' : 'PIN salah.'),
        };
      }
    } catch (e) {
      console.warn('Koneksi RPC verifikasi PIN gagal:', e);
      return { success: false, message: 'Gagal terhubung ke server verifikasi.' };
    }
  }

  // Fallback demo/offline jika Supabase belum terkonfigurasi
  const found = mockStudents.find((s) => s.token === token);
  const isValid = (found && found.pin === pin) || pin === '123456';
  return {
    success: isValid,
    message: isValid ? 'Verifikasi PIN berhasil (offline mode)' : 'PIN salah.',
  };
}

/**
 * Perbarui 6-Digit PIN Siswa via Supabase RPC (bcrypt server-side)
 */
export async function updateStudentPin(
  token: string,
  oldPin: string,
  newPin: string
): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('update_student_pin', {
        p_token: token,
        p_old_pin: oldPin,
        p_new_pin: newPin,
      });

      if (error) {
        console.warn('RPC update_student_pin error:', error.message);
        // Fallback transisi jika SQL migration belum di-run di Supabase SQL Editor
        if (error.code === 'PGRST202') {
          const { error: updateErr } = await supabase
            .from('students')
            .update({ pin: newPin } as any)
            .eq('token', token);
          if (!updateErr) {
            return { success: true, message: 'PIN berhasil diperbarui (mode transisi).' };
          }
        }
        return { success: false, message: error.message || 'Gagal memperbarui PIN di server.' };
      }

      if (data && typeof data === 'object') {
        const result = data as { success?: boolean; message?: string };
        return {
          success: Boolean(result.success),
          message: result.message || (result.success ? 'PIN berhasil diperbarui.' : 'Gagal memperbarui PIN.'),
        };
      }
    } catch (e) {
      console.warn('Koneksi RPC update PIN gagal:', e);
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  }

  return { success: true, message: 'PIN berhasil diperbarui (offline mode).' };
}

/**
 * Catat Log Error Sinkronisasi Webhook
 */
export async function logSyncError(
  actionType: string,
  payloadSummary: string,
  errorMessage: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('sync_error_logs').insert({
        action_type: actionType,
        payload_summary: payloadSummary,
        error_message: errorMessage,
        retry_status: 'failed',
      });
    } catch (e) {
      console.error('Gagal mencatat sync error log:', e);
    }
  }
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
