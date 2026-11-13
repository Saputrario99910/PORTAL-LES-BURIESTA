import React from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types/index.ts';
import { CheckCircle2, Clock, HeartPulse, XCircle, MessageSquareQuote } from 'lucide-react';

interface AttendanceTabProps {
  records: AttendanceRecord[];
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ records }) => {
  // Hitung ringkasan
  const stats = records.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    { hadir: 0, izin: 0, sakit: 0, alpa: 0 } as Record<AttendanceStatus, number>
  );

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 border-2 border-emerald-500 text-emerald-900 font-extrabold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>HADIR</span>
          </span>
        );
      case 'izin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 border-2 border-blue-500 text-blue-900 font-extrabold text-sm sm:text-base">
            <Clock className="w-5 h-5 text-blue-700" />
            <span>IZIN</span>
          </span>
        );
      case 'sakit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 border-2 border-amber-500 text-amber-900 font-extrabold text-sm sm:text-base">
            <HeartPulse className="w-5 h-5 text-amber-700" />
            <span>SAKIT</span>
          </span>
        );
      case 'alpa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 border-2 border-rose-500 text-rose-900 font-extrabold text-sm sm:text-base">
            <XCircle className="w-5 h-5 text-rose-700" />
            <span>BELUM ADA KABAR</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Penjelasan Singkat */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h3 className="text-lg sm:text-xl font-extrabold text-blue-950">
          Ringkasan Kehadiran 8 Pekan Terakhir
        </h3>
        <p className="text-sm sm:text-base text-blue-900 mt-1">
          Berikut adalah catatan absensi dan evaluasi belajar ananda langsung dari pengajar.
        </p>

        {/* Kotak Statistik Hadir / Izin / Sakit / Alpa */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="bg-white p-3 rounded-xl border-2 border-emerald-300 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-700 block">Hadir</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.hadir}x</span>
          </div>
          <div className="bg-white p-3 rounded-xl border-2 border-blue-300 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-700 block">Izin</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-700">{stats.izin}x</span>
          </div>
          <div className="bg-white p-3 rounded-xl border-2 border-amber-300 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-700 block">Sakit</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700">{stats.sakit}x</span>
          </div>
          <div className="bg-white p-3 rounded-xl border-2 border-rose-300 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-700 block">Tanpa Kabar</span>
            <span className="text-2xl sm:text-3xl font-black text-rose-700">{stats.alpa}x</span>
          </div>
        </div>
      </div>

      {/* Daftar 8 Minggu Terakhir */}
      <div className="space-y-3">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-400 transition-colors"
          >
            {/* Baris Atas: Pekan & Tanggal & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-lg">
                  Pekan ke-{rec.week_number}
                </span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {rec.date}
                </span>
              </div>
              <div>{getStatusBadge(rec.status)}</div>
            </div>

            {/* Materi Pembelajaran */}
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-600 block">Materi Pelajaran:</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{rec.topic}</p>
            </div>

            {/* Catatan Pengajar */}
            <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <div className="flex items-start gap-2">
                <MessageSquareQuote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-extrabold text-amber-900 block">
                    Catatan Perkembangan dari Miss Sarah:
                  </span>
                  <p className="text-sm sm:text-base text-slate-800 font-medium mt-0.5 leading-relaxed">
                    "{rec.teacher_note}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
