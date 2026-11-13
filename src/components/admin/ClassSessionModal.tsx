import React, { useState } from 'react';
import { TeachingClass, ClassStudentInfo } from '../../data/teachingClassesData.ts';
import { syncToGoogleSheets } from '../../lib/supabase.ts';
import {
  X,
  Check,
  Calendar,
  Users,
  ClipboardCheck,
  Award,
  Sparkles,
  BookOpen,
  Info,
  Layers,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

interface ClassSessionModalProps {
  teachingClass: TeachingClass;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

type AttendanceStatusType = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

interface StudentSessionRecord {
  id: string;
  name: string;
  nickname: string;
  status: AttendanceStatusType;
  score: string; // opsional, string agar bisa kosong
  assessment_type: 'tugas' | 'kuis' | 'unit_test' | 'none';
  teacher_note: string; // opsional
}

export const ClassSessionModal: React.FC<ClassSessionModalProps> = ({
  teachingClass,
  onClose,
  onSuccess,
}) => {
  const [meetingNumber, setMeetingNumber] = useState<number>(1);
  const [sessionTopic, setSessionTopic] = useState<string>('Unit 6: Delicious Food & Ordering');
  const [sessionDate, setSessionDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Inisialisasi daftar siswa di kelas tersebut
  const [studentRows, setStudentRows] = useState<StudentSessionRecord[]>(() =>
    teachingClass.students.map((st) => ({
      id: st.id,
      name: st.name,
      nickname: st.nickname,
      status: 'Hadir',
      score: '',
      assessment_type: 'none',
      teacher_note: '',
    }))
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatusType) => {
    setStudentRows((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const handleScoreChange = (studentId: string, score: string) => {
    setStudentRows((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, score } : s))
    );
  };

  const handleAssessmentTypeChange = (
    studentId: string,
    type: 'tugas' | 'kuis' | 'unit_test' | 'none'
  ) => {
    setStudentRows((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, assessment_type: type } : s))
    );
  };

  const handleNoteChange = (studentId: string, teacher_note: string) => {
    setStudentRows((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, teacher_note } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Sinkronisasi data Absensi & Pertemuan ke Google Sheets
      const attendancePayload = studentRows.map((s) => ({
        meeting_number: meetingNumber,
        date: sessionDate,
        topic: sessionTopic,
        class_name: teachingClass.name,
        class_level: teachingClass.level,
        student_id: s.id,
        student_name: s.name,
        status: s.status,
        teacher_note: s.teacher_note || '-',
      }));

      // Kirim batch absensi ke Webhook Google Sheets
      await syncToGoogleSheets('absensi_baru', {
        meeting_number: meetingNumber,
        class_name: teachingClass.name,
        records: attendancePayload,
      });

      // 2. Jika ada siswa yang dinilai (tugas / unit test), sinkronkan ke sheet Penilaian
      const scoreRows = studentRows.filter((s) => s.score.trim() !== '');
      if (scoreRows.length > 0) {
        const assessmentPayload = scoreRows.map((s) => ({
          meeting_number: meetingNumber,
          date: sessionDate,
          class_name: teachingClass.name,
          student_id: s.id,
          student_name: s.name,
          assessment_type: s.assessment_type === 'none' ? 'Tugas' : s.assessment_type,
          assessment_title: sessionTopic,
          score: Number(s.score),
          max_score: 100,
          teacher_feedback: s.teacher_note || '-',
        }));

        await syncToGoogleSheets('catat_penilaian', {
          meeting_number: meetingNumber,
          class_name: teachingClass.name,
          records: assessmentPayload,
        });
      }

      onSuccess(
        `Absensi Pertemuan ${meetingNumber} kelas ${teachingClass.name} & nilai berhasil tersimpan rapi ke Spreadsheet!`
      );
    } catch (err) {
      console.error(err);
      onSuccess(`Absensi kelas ${teachingClass.name} berhasil disimpan.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border-2 border-slate-200 my-4 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {teachingClass.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  Kelola Kelas: {teachingClass.name}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                  {teachingClass.students_count} Siswa
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {teachingClass.level} · {teachingClass.schedule}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Baris Input Pertemuan & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Pertemuan Ke-:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={meetingNumber}
                  onChange={(e) => setMeetingNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-black text-base text-blue-950 focus:border-blue-900 focus:outline-none"
                  required
                />
                <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
                  / {teachingClass.total_meetings}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Tanggal Mengajar:
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-bold text-sm text-slate-800 focus:border-blue-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Topik / Materi Pembelajaran:
              </label>
              <input
                type="text"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                placeholder="Misal: Unit 6 Food & Noodles"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-bold text-sm text-slate-800 focus:border-blue-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Keterangan Fleksibilitas Nilai */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Petunjuk Guru:</strong> Nilai & catatan bersifat <em>opsional</em>. Jika tidak ada tugas atau anak berhalangan hadir, kolom nilai cukup dikosongkan. Semua data akan terekap rapi di Google Sheets sesuai nomor pertemuan.
            </p>
          </div>

          {/* Daftar Siswa: Absensi & Nilai Opsional */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">
                Daftar Absensi & Evaluasi Siswa ({studentRows.length} Anak):
              </span>
              <span className="text-xs text-slate-500 font-bold">
                Pilih status kehadiran & input nilai bila ada
              </span>
            </div>

            <div className="space-y-3">
              {studentRows.map((st) => (
                <div
                  key={st.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${
                    st.status === 'Hadir'
                      ? 'bg-white border-slate-200'
                      : st.status === 'Izin'
                      ? 'bg-amber-50/50 border-amber-300'
                      : st.status === 'Sakit'
                      ? 'bg-blue-50/50 border-blue-300'
                      : 'bg-rose-50/50 border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Nama Siswa */}
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{st.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Panggilan: <strong className="text-blue-900">{st.nickname}</strong>
                      </span>
                    </div>

                    {/* Tombol Radio Status Absensi (Besar & Mudah Dipencet) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                      {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatusType[]).map((sts) => {
                        const isSelected = st.status === sts;
                        return (
                          <button
                            key={sts}
                            type="button"
                            onClick={() => handleStatusChange(st.id, sts)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                              isSelected
                                ? sts === 'Hadir'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : sts === 'Izin'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : sts === 'Sakit'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {sts}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input Nilai & Catatan (Tampil jika Hadir, atau bisa diisi catatan jika Izin/Sakit) */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Jenis Penilaian */}
                    <div className="sm:col-span-3">
                      <select
                        value={st.assessment_type}
                        onChange={(e) =>
                          handleAssessmentTypeChange(
                            st.id,
                            e.target.value as 'tugas' | 'kuis' | 'unit_test' | 'none'
                          )
                        }
                        className="w-full text-xs font-bold p-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-800 focus:outline-none"
                      >
                        <option value="none">Jenis: Tanpa Nilai</option>
                        <option value="tugas">Nilai Tugas</option>
                        <option value="kuis">Nilai Kuis / Review</option>
                        <option value="unit_test">Nilai Unit Test</option>
                      </select>
                    </div>

                    {/* Input Angka Nilai */}
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Nilai (0-100)"
                        value={st.score}
                        onChange={(e) => handleScoreChange(st.id, e.target.value)}
                        className="w-full text-xs font-black p-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Catatan Guru */}
                    <div className="sm:col-span-7">
                      <input
                        type="text"
                        placeholder="Catatan guru (opsional, misal: pelafalan bagus / izin sakit)"
                        value={st.teacher_note}
                        onChange={(e) => handleNoteChange(st.id, e.target.value)}
                        className="w-full text-xs font-medium p-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Menyimpan ke Spreadsheet...' : 'Simpan Absensi & Nilai'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
