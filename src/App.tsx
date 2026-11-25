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
import { PinLockScreen } from './components/PinLockScreen.tsx';
import { AppLockScreen } from './components/AppLockScreen.tsx';
import { AttendanceTab } from './components/AttendanceTab.tsx';
import { ExamResultsTab } from './components/ExamResultsTab.tsx';
import { LearningPlanTab } from './components/LearningPlanTab.tsx';
import { GalleryTab } from './components/GalleryTab.tsx';
import { TuitionTab } from './components/TuitionTab.tsx';
import { ChildSwitcher } from './components/ChildSwitcher.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { TutorDashboard } from './components/tutor/TutorDashboard.tsx';
import { ThemeTogglePill } from './components/ThemeTogglePill.tsx';
import { InstallPwaPromptModal } from './components/InstallPwaPromptModal.tsx';
import { ShieldCheck, RotateCcw, Building2, Edit3, X, Check, LogOut } from 'lucide-react';

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

  // Konfigurasi Nama Lembaga & Logo
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

  // Siswa Aktif (Identifikasi dari parameter ?token= atau sesi aktif)
  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        const found = mockStudents.find((s) => s.token === token);
        if (found) return found;
      }
      const activeId = localStorage.getItem('rbe_active_student_id');
      if (activeId) {
        const found = mockStudents.find((s) => s.id === activeId);
        if (found) return found;
      }
      const savedAvatar = localStorage.getItem('rbe_student_avatar_std_01');
      // Bersihkan sisa legacy plaintext PIN dari localStorage jika ada
      localStorage.removeItem('rbe_student_pin_std_01');
      if (savedAvatar) {
        return {
          ...mockStudents[0],
          avatar_url: savedAvatar,
        };
      }
    }
    return mockStudents[0];
  });

  // Daftar ID Siswa yang Terhubung / Unlocked di HP Ini (Multi-Child Session)
  const [unlockedStudentIds, setUnlockedStudentIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rbe_unlocked_children');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    // Default: Kenzo & Nadira aktif terhubung untuk demo multi-anak
    return ['std_01', 'std_02'];
  });

  // SISTEM LOGIN 1 KALI (Disimpan di Local Cache Browser Wali Murid)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // Cek apakah wali murid untuk siswa ini sudah pernah login sebelumnya di HP ini
      const cachedAuth = localStorage.getItem(`rbe_auth_${currentStudent.id}`);
      return cachedAuth === 'true';
    }
    return false;
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      // Simpan status login di local cache browser sehingga tidak perlu login lagi
      localStorage.setItem(`rbe_auth_${currentStudent.id}`, 'true');
      localStorage.setItem('rbe_active_student_id', currentStudent.id);
    }
  };

  // Fungsi Beralih Anak secara Instan Tanpa Login Ulang
  const handleSwitchChild = (selected: Student) => {
    setCurrentStudent(selected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rbe_active_student_id', selected.id);
      localStorage.setItem(`rbe_auth_${selected.id}`, 'true');
    }
    setIsAuthenticated(true);
  };

  // Callback saat anak baru berhasil dihubungkan via verifikasi PIN 1x
  const handleAddNewChildSuccess = (newChild: Student) => {
    setUnlockedStudentIds((prev) => {
      const next = Array.from(new Set([...prev, newChild.id]));
      if (typeof window !== 'undefined') {
        localStorage.setItem('rbe_unlocked_children', JSON.stringify(next));
        localStorage.setItem(`rbe_auth_${newChild.id}`, 'true');
        localStorage.setItem('rbe_active_student_id', newChild.id);
      }
      return next;
    });
    setCurrentStudent(newChild);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`rbe_auth_${currentStudent.id}`);
      sessionStorage.removeItem('rbe_session_unlocked');
    }
    setIsAuthenticated(false);
    setIsSessionUnlocked(false);
  };

  // KUNCI APLIKASI OPSIONAL (APP LOCK: PIN / Biometrik saat portal dibuka kembali)
  const [isAppLockEnabled, setIsAppLockEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rbe_app_lock_enabled') === 'true';
    }
    return false;
  });

  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('rbe_session_unlocked') === 'true';
    }
    return false;
  });

  const handleToggleAppLock = () => {
    setIsAppLockEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rbe_app_lock_enabled', next ? 'true' : 'false');
      }
      return next;
    });
  };

  // Fungsi Mengubah Foto Profil Siswa secara Dinamis
  const handleUpdateStudentAvatar = (newAvatarUrl: string) => {
    setCurrentStudent((prev) => {
      const updated = { ...prev, avatar_url: newAvatarUrl };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`rbe_student_avatar_${prev.id}`, newAvatarUrl);
      }
      return updated;
    });
  };

  // Fungsi Callback setelah PIN Siswa berhasil diubah via RPC
  const handleUpdateStudentPin = (_newPin: string) => {
    setCurrentStudent((prev) => {
      // Hapus data cache plaintext PIN jika sebelumnya pernah tersimpan
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`rbe_student_pin_${prev.id}`);
      }
      return { ...prev, pin_updated_at: new Date().toISOString() };
    });
  };

  // State Tab Aktif & Arah Geser untuk Animasi Slide Kiri/Kanan
  const tabOrder: ActiveTabType[] = ['attendance', 'exam_results', 'learning_plan', 'gallery', 'tuition'];
  const [activeTab, setActiveTab] = useState<ActiveTabType>('attendance');
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');

  const handleChangeTab = (nextTab: ActiveTabType) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const nextIndex = tabOrder.indexOf(nextTab);
    // Jika nomor tab berikutnya lebih besar, geser dari kanan; jika lebih kecil, geser dari kiri
    setSlideDirection(nextIndex >= currentIndex ? 'right' : 'left');
    setActiveTab(nextTab);
  };

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

  // Sinkronisasi data iuran ketika profil anak berganti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`rbe_tuition_${currentStudent.id}`);
      if (saved) {
        try {
          setTuitionRecords(JSON.parse(saved));
          return;
        } catch {
          // fallback
        }
      }
    }
    const filtered = mockTuitionRecords.filter((t) => t.student_id === currentStudent.id);
    if (filtered.length > 0) {
      setTuitionRecords(filtered);
    } else {
      // Fallback sample tagihan untuk siswa yang baru di-switch
      setTuitionRecords([
        {
          id: `tui_gen_${currentStudent.id}`,
          student_id: currentStudent.id,
          title: 'SPP Reguler Bulanan',
          period: 'November 2024',
          billing_type: 'bulanan',
          amount: 250000,
          total_amount: 250000,
          due_date: '10 November 2024',
          status: 'belum',
        },
      ]);
    }
  }, [currentStudent.id]);

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
      localStorage.removeItem(`rbe_auth_${currentStudent.id}`);
      localStorage.removeItem('rbe_institution_config');
    }
    setTuitionRecords(mockTuitionRecords.filter((t) => t.student_id === currentStudent.id));
    setCurrentStudent(mockStudents[0]);
    setInstitution(initialInstitutionConfig);
    setIsAuthenticated(false);
    alert('Data cache login dan simulasi berhasil di-reset.');
  };

  const unpaidCount = tuitionRecords.filter((t) => t.status === 'belum').length;

  // Rute Khusus Admin: /admin
  if (currentPath === '/admin') {
    return <AdminDashboard onBackToPortal={() => navigateTo('/')} onNavigate={navigateTo} />;
  }

  // Rute Khusus Tutor: /tutor
  if (currentPath === '/tutor') {
    return <TutorDashboard onNavigate={navigateTo} />;
  }

  // JIKA BELUM LOGIN: Tampilkan Layar Kunci 6-Digit PIN (Dengan Pilihan Kelas & Nama Siswa)
  if (!isAuthenticated) {
    return (
      <PinLockScreen
        currentStudent={currentStudent}
        allStudents={mockStudents}
        onSelectStudent={(selected) => setCurrentStudent(selected)}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  // JIKA SUDAH LOGIN NAMUN APP LOCK DIAKTIFKAN OLEH WALI MURID & BELUM DI-UNLOCK:
  if (isAuthenticated && isAppLockEnabled && !isSessionUnlocked) {
    return (
      <AppLockScreen
        currentStudent={currentStudent}
        onUnlockSuccess={() => {
          setIsSessionUnlocked(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('rbe_session_unlocked', 'true');
          }
        }}
        onDisableAppLock={() => {
          setIsAppLockEnabled(false);
          setIsSessionUnlocked(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('rbe_app_lock_enabled', 'false');
            sessionStorage.setItem('rbe_session_unlocked', 'true');
          }
        }}
      />
    );
  }

  // JIKA SUDAH LOGIN: Tampilkan Portal Belajar Siswa
  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-28 sm:pb-36">
      {/* Top Bar Header Resmi Lembaga */}
      <header className="sticky top-0 z-30 bg-blue-950 text-white shadow-md border-b-2 border-amber-400">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Judul Lembaga */}
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

          {/* Sisi Kanan: Child Switcher, Pemilih Tema & Tombol Keluar Akun */}
          <div className="flex items-center gap-2">
            <ChildSwitcher
              currentStudent={currentStudent}
              allStudents={mockStudents}
              unlockedStudentIds={unlockedStudentIds}
              onSelectStudent={handleSwitchChild}
              onAddNewChildSuccess={handleAddNewChildSuccess}
            />
            <ThemeTogglePill />
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-blue-900/80 hover:bg-rose-900 text-white transition-colors"
              title="Kunci / Keluar Akun"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4 text-slate-300 hover:text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Kontainer Utama Mobile-First */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-6 overflow-hidden">
        {/* Banner Selamat Datang Hangat */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="text-sm sm:text-base font-bold">
              Selamat datang, Wali dari{' '}
              <span className="text-blue-900 font-extrabold">{currentStudent.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Ganti Siswa:</span>
            <ChildSwitcher
              currentStudent={currentStudent}
              allStudents={mockStudents}
              unlockedStudentIds={unlockedStudentIds}
              onSelectStudent={handleSwitchChild}
              onAddNewChildSuccess={handleAddNewChildSuccess}
            />
          </div>
        </div>

        {/* 1. Profil Anak (Dengan Fitur Upload Ganti Foto & Ganti PIN Mandiri) */}
        <section aria-label="Profil Siswa">
          <StudentProfileHeader
            student={currentStudent}
            onUpdateAvatar={handleUpdateStudentAvatar}
            onUpdatePin={handleUpdateStudentPin}
            isAppLockEnabled={isAppLockEnabled}
            onToggleAppLock={handleToggleAppLock}
          />
        </section>

        {/* 2. Navigasi Bar Tab (Bottom Bar di HP + Top Segmen di Desktop) */}
        <section aria-label="Menu Pilihan Informasi">
          <TabNavigation
            activeTab={activeTab}
            onChangeTab={handleChangeTab}
            unpaidCount={unpaidCount}
          />
        </section>

        {/* 3. Konten Tab Terpilih dengan Efek Sentuhan Geser Kiri-Kanan Halus */}
        <section
          id="tab-content-area"
          key={activeTab}
          className={`pt-1 scroll-mt-20 ${
            slideDirection === 'right' ? 'tab-slide-right' : 'tab-slide-left'
          }`}
        >
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
            <span>Kunci Kembali & Reset Uji Coba</span>
          </button>
        </div>
      </main>

      {/* Modal Pengaturan Nama Lembaga & Logo */}
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

      {/* Banner PWA 1-Klik Install ke Layar HP */}
      <InstallPwaPromptModal />
    </div>
  );
}
