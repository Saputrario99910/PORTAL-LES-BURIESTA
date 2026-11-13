import React, { useState } from 'react';
import { X, Check, Calendar, Users, ClipboardCheck } from 'lucide-react';

interface AttendanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AttendanceStatusType = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

interface StudentAttendanceRow {
  id: string;
  name: string;
  nickname: string;
  status: AttendanceStatusType;
}

const initialFiveStudents: StudentAttendanceRow[] = [
  { id: 'st_1', name: 'Kenzo Alfarizi Pratama', nickname: 'Kenzo', status: 'Hadir' },
  { id: 'st_2', name: 'Nadira Alya Putri', nickname: 'Alya', status: 'Hadir' },
  { id: 'st_3', name: 'Dimas Prasetyo Nugroho', nickname: 'Dimas', status: 'Hadir' },
  { id: 'st_4', name: 'Raisa Zahra Salsabila', nickname: 'Raisa', status: 'Hadir' },
  { id: 'st_5', name: 'Fadhil Ramadhan Hidayat', nickname: 'Fadhil', status: 'Hadir' },
];

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ onClose, onSuccess }) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    'Primary English Explorer (Kelas 3 SD)'
  );
  const [attendanceDate, setAttendanceDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [students, setStudents] = useState<StudentAttendanceRow[]>(initialFiveStudents);

  const handleStatusChange = (studentId: string, status: AttendanceStatusType) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-slate-200 my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Isi Absensi Kelas
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Catat kehadiran siswa untuk sesi pertemuan les
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Tutup formulir absensi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Formulir */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Baris 1: Pilih Kelas & Input Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Dropdown Pilih Kelas */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                Pilih Kelas:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-hidden"
              >
                <option value="Primary English Explorer (Kelas 3 SD)">
                  Primary English Explorer (Kelas 3 SD)
                </option>
                <option value="Beginner Kids Phonics (Kelas 1 SD)">
                  Beginner Kids Phonics (Kelas 1 SD)
                </option>
                <option value="Intermediate Young Storytellers (Kelas 5 SD)">
                  Intermediate Young Storytellers (Kelas 5 SD)
                </option>
              </select>
            </div>

            {/* Input Tanggal */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Tanggal Pertemuan:
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-hidden"
              />
            </div>
          </div>

          {/* Baris 2: Daftar 5 Siswa dengan Pilihan Status (Hadir / Izin / Sakit / Alpa) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Daftar Siswa (5 Anak)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Pilih status kehadiran tiap anak
              </span>
            </div>

            <div className="space-y-2.5">
              {students.map((student, idx) => (
                <div
                  key={student.id}
                  className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Panggilan: <strong className="text-blue-900">{student.nickname}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Pilihan Status (Hadir / Izin / Sakit / Alpa) */}
                  <div className="grid grid-cols-4 gap-1.5 shrink-0">
                    {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatusType[]).map((status) => {
                      const isSelected = student.status === status;
                      const colorStyles =
                        status === 'Hadir'
                          ? isSelected
                            ? 'bg-emerald-600 text-white font-black border-emerald-600 shadow-xs'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                          : status === 'Izin'
                          ? isSelected
                            ? 'bg-blue-600 text-white font-black border-blue-600 shadow-xs'
                            : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                          : status === 'Sakit'
                          ? isSelected
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-xs'
                            : 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100'
                          : isSelected
                          ? 'bg-rose-600 text-white font-black border-rose-600 shadow-xs'
                          : 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100';

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all select-none active:scale-95 ${colorStyles}`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Tombol Simpan Absensi */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Absensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
