import React, { useState, useEffect } from 'react';
import {
  mockStudents,
  mockAttendanceRecords,
  mockGalleryItems,
  mockTuitionRecords,
  mockLearningPlans,
  mockUnitExamResults,
  mockBookCurriculum,
  courseBankAccounts,
  initialInstitutionConfig,
} from './data/mockData.ts';
import { Student, TuitionRecord, InstitutionConfig } from './types/index.ts';
import { StudentProfileHeader } from './components/StudentProfileHeader.tsx';
import { TabNavigation, ActiveTabType } from './components/TabNavigation.tsx';
import { AttendanceTab } from './components/AttendanceTab.tsx';
import { ExamResultsTab } from './components/ExamResultsTab.tsx';
import { LearningPlanTab } from './components/LearningPlanTab.tsx';
import { GalleryTab } from './components/GalleryTab.tsx';
import { TuitionTab } from './components/TuitionTab.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { TutorDashboard } from './components/tutor/TutorDashboard.tsx';
import { ThemeTogglePill } from './components/ThemeTogglePill.tsx';
import { ShieldCheck, RotateCcw, Sparkles, Building2, Edit3, X, Check } from 'lucide-react';

export default function App() {
  // Routing internal untuk /admin, /tutor, dan / (Portal Wali Murid)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
  };

  // 6. Konfigurasi Nama Lembaga & Logo (Tersedia state dan dialog pengeditan cepat)
  const [institution, setInstitution] = useState<InstitutionConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rbe_institution_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialInstitutionConfig;
  });

  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [tempInstitutionName, setTempInstitutionName] = useState<string>(institution.name);
  const [tempInstitutionTagline, setTempInstitutionTagline] = useState<string>(institution.tagline);
  const [tempLogoUrl, setTempLogoUrl] = useState<string>(institution.logo_url);

  const handleSaveInstitutionConfig = () => {
    const updated: InstitutionConfig = {
      ...institution,
      name: tempInstitutionName.trim() || initialInstitutionConfig.name,
      tagline: tempInstitutionTagline.trim() || initialInstitutionConfig.tagline,
      logo_url: tempLogoUrl.trim(),
    };
    setInstitution(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rbe_institution_config', JSON.stringify(updated));
    }
    setShowConfigModal(false);
  };

  // State Siswa Aktif
  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        const found = mockStudents.find((s) => s.token === token);
        if (found) return found;
      }
      const savedAvatar = localStorage.getItem('rbe_student_avatar_std_01');
      if (savedAvatar) {
        return { ...mockStudents[0], avatar_url: savedAvatar };
      }
    }
    return mockStudents[0];
  });

  // 2. Fungsi Mengubah Foto Profil Siswa secara Dinamis
  const handleUpdateStudentAvatar = (newAvatarUrl: string) => {
    setCurrentStudent((prev) => {
      const updated = { ...prev, avatar_url: newAvatarUrl };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`rbe_student_avatar_${prev.id}`, newAvatarUrl);
      }
      return updated;
    });
  };

  // State Tab Aktif di Halaman Wali Murid (default: absensi)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('attendance');

  // State Status Pembayaran Iuran
  const [tuitionRecords, setTuitionRecords] = useState<TuitionRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`rbe_tuition_${currentStudent.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return mockTuitionRecords.filter((t) => t.student_id === currentStudent.id);
  });

  // Data filter per siswa aktif
  const studentAttendance = mockAttendanceRecords.filter((a) => a.student_id === currentStudent.id);
  const studentExamResults = mockUnitExamResults.filter((e) => e.student_id === currentStudent.id);
  const studentGallery = mockGalleryItems.filter(
    (g) => g.student_id === currentStudent.id || g.category.includes('Cooking')
  );

  const handleUpdateTuition = (updated: TuitionRecord) => {
    setTuitionRecords((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      if (typeof window !== 'undefined') {
        localStorage.setItem(`rbe_tuition_${currentStudent.id}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`rbe_tuition_${currentStudent.id}`);
      localStorage.removeItem(`rbe_student_avatar_${currentStudent.id}`);
      localStorage.removeItem('rbe_institution_config');
    }
    setTuitionRecords(mockTuitionRecords.filter((t) => t.student_id === currentStudent.id));
    setCurrentStudent(mockStudents[0]);
    setInstitution(initialInstitutionConfig);
    alert('Data simulasi dan konfigurasi berhasil di-reset.');
  };

  // Jumlah tagihan yang belum dibayar
  const unpaidCount = tuitionRecords.filter((t) => t.status === 'belum').length;

  // Rute Khusus Admin: /admin
  if (currentPath === '/admin') {
    return <AdminDashboard onBackToPortal={() => navigateTo('/')} onNavigate={navigateTo} />;
  }

  // Rute Khusus Tutor: /tutor
  if (currentPath === '/tutor') {
    return <TutorDashboard onNavigate={navigateTo} />;
  }

  // 7. Tampilan Utama: Portal Wali Murid Murni (Tombol Tutor & Admin dihilangkan dari header/footer)
  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-28 sm:pb-36">
      {/* Top Bar Header Resmi Lembaga */}
      <header className="sticky top-0 z-30 bg-blue-950 text-white shadow-md border-b-2 border-amber-400">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Judul Lembaga (Konfigurabel) */}
          <div className="flex items-center gap-3">
            {institution.logo_url ? (
              <img
                src={institution.logo_url}
                alt={`Logo ${institution.name}`}
                className="w-10 h-10 rounded-xl object-cover border-2 border-amber-400 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xl shadow-sm">
                {institution.short_name.charAt(0) || 'R'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  {institution.name}
                </h1>
                {/* Tombol pensil kecil untuk memudahkan Anda mengubah nama lembaga & logo */}
                <button
                  type="button"
                  onClick={() => {
                    setTempInstitutionName(institution.name);
                    setTempInstitutionTagline(institution.tagline);
                    setTempLogoUrl(institution.logo_url);
                    setShowConfigModal(true);
                  }}
                  className="opacity-70 hover:opacity-100 p-1 text-amber-300 hover:text-white transition-opacity"
                  title="Klik untuk mengganti Nama Lembaga & Logo"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-semibold text-blue-200 block">
                {institution.badge_text}
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Hanya Pemilih Tema (Bebas dari Tombol Admin & Tutor) */}
          <div className="flex items-center gap-2">
            <ThemeTogglePill />
          </div>
        </div>
      </header>

      {/* Kontainer Utama Mobile-First */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Banner Selamat Datang Hangat */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-800">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="text-sm sm:text-base font-bold">
              Selamat datang, Wali dari{' '}
              <span className="text-blue-900 font-extrabold">{currentStudent.name}</span>
            </p>
          </div>
        </div>

        {/* 1. Profil Anak (Dengan Fitur Upload Ganti Foto) */}
        <section aria-label="Profil Siswa">
          <StudentProfileHeader
            student={currentStudent}
            onUpdateAvatar={handleUpdateStudentAvatar}
          />
        </section>

        {/* 2. Menu Navigasi Vertikal Tombol Besar + Fixed Bottom Bar */}
        <section aria-label="Menu Pilihan Informasi">
          <TabNavigation
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            unpaidCount={unpaidCount}
          />
        </section>

        {/* 3. Konten Tab Terpilih */}
        <section id="tab-content-area" className="pt-2 scroll-mt-20">
          {activeTab === 'attendance' && <AttendanceTab records={studentAttendance} />}
          {activeTab === 'exam_results' && (
            <ExamResultsTab results={studentExamResults} studentName={currentStudent.nickname} />
          )}
          {activeTab === 'learning_plan' && (
            <LearningPlanTab curriculums={mockBookCurriculum} />
          )}
          {activeTab === 'gallery' && <GalleryTab items={studentGallery} />}
          {activeTab === 'tuition' && (
            <TuitionTab
              student={currentStudent}
              records={tuitionRecords}
              bankAccounts={courseBankAccounts}
              onUpdateRecord={handleUpdateTuition}
            />
          )}
        </section>

        {/* Tombol Reset Data untuk Pengujian Simulasi */}
        <div className="pt-8 pb-4 text-center">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Data Simulasi Uji Coba</span>
          </button>
        </div>
      </main>

      {/* 6. Modal Pengaturan Nama Lembaga & Logo */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-400 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>Pengaturan Identitas Lembaga</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Ubah nama lembaga dan tautan logo sesuai merek lembaga kursus Anda kapan saja.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  Nama Lembaga Belajar:
                </label>
                <input
                  type="text"
                  value={tempInstitutionName}
                  onChange={(e) => setTempInstitutionName(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-blue-900 focus:outline-none"
                  placeholder="Contoh: Rumah Belajar English"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  Slogan / Tagline Lembaga:
                </label>
                <input
                  type="text"
                  value={tempInstitutionTagline}
                  onChange={(e) => setTempInstitutionTagline(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-medium text-sm focus:border-blue-900 focus:outline-none"
                  placeholder="Contoh: Membangun Kepercayaan Diri Berbahasa Inggris"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  URL / Path Logo Lembaga (Opsional):
                </label>
                <input
                  type="text"
                  value={tempLogoUrl}
                  onChange={(e) => setTempLogoUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-medium text-sm focus:border-blue-900 focus:outline-none"
                  placeholder="Contoh: https://... atau kosongkan untuk ikon bawaan"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveInstitutionConfig}
                className="flex-1 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
