import React, { useState } from 'react';
import { AttendanceModal } from '../admin/AttendanceModal.tsx';
import { LearningPlanModal } from './LearningPlanModal.tsx';
import { ThemeTogglePill } from '../ThemeTogglePill.tsx';
import {
  Calendar,
  Clock,
  ClipboardCheck,
  BookOpen,
  Users,
  ShieldCheck,
  UserCheck,
  Check,
  Sparkles,
  MapPin,
  GraduationCap
} from 'lucide-react';

interface TutorDashboardProps {
  onNavigate: (path: string) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ onNavigate }) => {
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 2 Kelas Mengajar Hari Ini
  const todayClasses = [
    {
      id: 'cls_1',
      name: 'Kids A',
      level: 'Primary English Explorer (Kelas 3-4 SD)',
      time: '15:30 - 17:00 WIB',
      room: 'Ruang Belajar 1',
      studentsCount: 6,
      status: 'Akan Dimulai',
      colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'cls_2',
      name: 'Teens 1',
      level: 'Intermediate Young Storytellers (Kelas 5-6 SD)',
      time: '17:00 - 18:30 WIB',
      room: 'Ruang Belajar Utama',
      studentsCount: 8,
      status: 'Sesi Sore',
      colorBadge: 'bg-blue-100 text-blue-900 border-blue-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Header Top Bar */}
      <header className="sticky top-0 z-30 bg-blue-950 text-white border-b-2 border-amber-400 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Judul Dashboard Tutor */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xl shadow-sm">
              T
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Dashboard Tutor - Rumah Belajar English
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-blue-200 font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tutor: <strong className="text-white">Miss Sarah</strong></span>
              </div>
            </div>
          </div>

          {/* Tombol Navigasi di Pojok Kanan Atas: Tema, Mode Admin & Mode Wali */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
            <ThemeTogglePill />

            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all active:scale-95 shadow-xs"
              title="Pindah ke Dashboard Admin (/admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs transition-all active:scale-95 shadow-xs"
              title="Pindah ke Portal Wali Murid (/)"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Wali</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Banner Selamat Datang Hangat */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Selamat Bertugas, Miss Sarah!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Kelola kehadiran siswa dan rancang silabus belajar dengan cepat hari ini.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Jadwal Aktif Hari Ini</span>
          </div>
        </div>

        {/* 1. KARTU JADWAL MENGAJAR HARI INI */}
        <section aria-label="Jadwal Mengajar Hari Ini" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-900" />
              <span>Jadwal Mengajar Hari Ini</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">2 Sesi Kelas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-900 p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      {cls.name}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${cls.colorBadge}`}
                    >
                      {cls.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-3">
                    {cls.level}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <Clock className="w-4 h-4 text-blue-800" />
                      <span>{cls.time}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{cls.studentsCount} Siswa Terdaftar</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(true)}
                    className="text-xs font-extrabold text-blue-900 hover:text-blue-950 hover:underline flex items-center gap-1"
                  >
                    <span>Buka Presensi Kelas</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. DUA TOMBOL BESAR (Isi Absensi Kelas & Isi Rencana Belajar) */}
        <section aria-label="Aksi Utama Tutor" className="space-y-3">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Menu Aksi Cepat Tutor</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tombol Besar 1: Isi Absensi Kelas */}
            <button
              type="button"
              onClick={() => setShowAttendanceModal(true)}
              className="w-full min-h-[96px] p-5 sm:p-6 rounded-3xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border-2 border-emerald-600 shadow-md flex items-center gap-4 text-left transition-all active:scale-98 select-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 text-emerald-200 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight">
                  Isi Absensi Kelas
                </span>
                <span className="text-xs sm:text-sm text-emerald-100 font-medium block mt-1">
                  Catat status kehadiran siswa (Hadir/Izin/Sakit/Alpa)
                </span>
              </div>
            </button>

            {/* Tombol Besar 2: Isi Rencana Belajar */}
            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              className="w-full min-h-[96px] p-5 sm:p-6 rounded-3xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white border-2 border-blue-800 shadow-md flex items-center gap-4 text-left transition-all active:scale-98 select-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-950 text-amber-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight">
                  Isi Rencana Belajar
                </span>
                <span className="text-xs sm:text-sm text-blue-200 font-medium block mt-1">
                  Tentukan kelas, topik materi, dan tujuan pembelajaran
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Footer Ringkas */}
        <footer className="pt-6 border-t border-slate-300 text-center space-y-2 pb-6">
          <p className="text-xs text-slate-500 font-medium">
            Rumah Belajar English · Dashboard Khusus Tutor & Pengajar
          </p>
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-blue-900 hover:underline"
            >
              Portal Wali Murid
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="hover:text-blue-900 hover:underline"
            >
              Dashboard Admin
            </button>
          </div>
        </footer>
      </main>

      {/* Modal 1: Isi Absensi Kelas */}
      {showAttendanceModal && (
        <AttendanceModal
          onClose={() => setShowAttendanceModal(false)}
          onSuccess={() => {
            setShowAttendanceModal(false);
            showToast('Absensi berhasil disimpan');
          }}
        />
      )}

      {/* Modal 2: Isi Rencana Belajar */}
      {showPlanModal && (
        <LearningPlanModal
          onClose={() => setShowPlanModal(false)}
          onSuccess={() => {
            setShowPlanModal(false);
            showToast('Rencana belajar berhasil disimpan');
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
