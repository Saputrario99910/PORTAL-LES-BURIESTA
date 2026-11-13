import React from 'react';
import {
  CalendarCheck,
  BookOpen,
  Image,
  WalletCards,
  ChevronRight,
  CheckCircle2,
  Award,
} from 'lucide-react';

export type ActiveTabType = 'attendance' | 'exam_results' | 'learning_plan' | 'gallery' | 'tuition';

interface TabNavigationProps {
  activeTab: ActiveTabType;
  onChangeTab: (tab: ActiveTabType) => void;
  unpaidCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onChangeTab,
  unpaidCount,
}) => {
  const tabs = [
    {
      id: 'attendance' as ActiveTabType,
      number: '1',
      title: 'Absensi & Catatan Guru',
      subtitle: 'Riwayat 8 pekan, kehadiran & evaluasi belajar',
      icon: CalendarCheck,
      bottomLabel: 'Absensi',
    },
    {
      id: 'exam_results' as ActiveTabType,
      number: '2',
      title: 'Hasil Ujian & Grafik Nilai',
      subtitle: 'Grafik naik-turun nilai per unit (Buku 1 selesai)',
      icon: Award,
      badge: 'Baru ✨',
      bottomLabel: 'Nilai Ujian',
    },
    {
      id: 'learning_plan' as ActiveTabType,
      number: '3',
      title: 'Rencana Belajar (Silabus Buku)',
      subtitle: 'Peta materi lengkap 12 pertemuan per buku',
      icon: BookOpen,
      bottomLabel: 'Silabus',
    },
    {
      id: 'gallery' as ActiveTabType,
      number: '4',
      title: 'Galeri Karya & Foto Kelas',
      subtitle: 'Cooking class 10 foto, karya tulis & generator AI',
      icon: Image,
      bottomLabel: 'Galeri',
    },
    {
      id: 'tuition' as ActiveTabType,
      number: '5',
      title: 'Iuran Les & Konfirmasi Bayar',
      subtitle: 'Tombol sudah bayar, nomor rekening & kirim bukti',
      icon: WalletCards,
      badge: unpaidCount > 0 ? `${unpaidCount} Perlu Bayar` : undefined,
      bottomLabel: 'Iuran SPP',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Menu Vertikal Menumpuk ke Bawah (Tombol Sangat Besar & Mudah Dipencet untuk Orang Tua) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm sm:text-base font-extrabold text-slate-800">
            Pilih Informasi yang Ingin Dilihat:
          </label>
          <span className="text-xs text-slate-500 font-semibold">5 Menu Tersedia</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onChangeTab(tab.id);
                  // Halus scroll ke area konten jika di layar kecil
                  const el = document.getElementById('tab-content-area');
                  if (el && window.innerWidth < 640) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`w-full min-h-[64px] p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-left transition-all border-2 active:scale-98 cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white border-blue-950 shadow-md ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Lingkaran Ikon & Nomor */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-base shadow-xs ${
                      isActive
                        ? 'bg-amber-400 text-blue-950'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Judul & Keterangan */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-base sm:text-lg font-extrabold truncate ${
                          isActive ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {tab.title}
                      </h3>
                      {tab.badge && (
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-xs ${
                            isActive
                              ? 'bg-amber-400 text-blue-950'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-medium line-clamp-1 ${
                        isActive ? 'text-blue-100' : 'text-slate-600'
                      }`}
                    >
                      {tab.subtitle}
                    </p>
                  </div>
                </div>

                {/* Indikator Panah Kanan / Checklist */}
                <div className="shrink-0 flex items-center pl-2">
                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 font-bold" />
                    </div>
                  ) : (
                    <ChevronRight className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Fixed Bottom Navigation Bar (Sangat Membantu Navigasi Mobile HP) */}
      <nav
        aria-label="Navigasi Bawah Layar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-xl px-2 py-2"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onChangeTab(tab.id);
                  const el = document.getElementById('tab-content-area');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex-1 min-w-0 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'text-blue-900 font-extrabold bg-blue-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-900 font-bold'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'stroke-[2.5] text-blue-900' : ''
                    }`}
                  />
                  {tab.id === 'tuition' && unpaidCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] truncate mt-0.5 tracking-tight">
                  {tab.bottomLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
