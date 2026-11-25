import React from 'react';
import {
  CalendarCheck,
  BookOpen,
  Image,
  WalletCards,
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
      title: 'Absensi',
      icon: CalendarCheck,
    },
    {
      id: 'exam_results' as ActiveTabType,
      title: 'Nilai Tes',
      icon: Award,
    },
    {
      id: 'learning_plan' as ActiveTabType,
      title: 'Materi Unit',
      icon: BookOpen,
    },
    {
      id: 'gallery' as ActiveTabType,
      title: 'Galeri',
      icon: Image,
    },
    {
      id: 'tuition' as ActiveTabType,
      title: 'SPP',
      icon: WalletCards,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
    },
  ];

  // Helper fungsi untuk menggulir halaman tepat ke awal konten tab baru
  const handleTabClick = (tabId: ActiveTabType) => {
    onChangeTab(tabId);

    // Beri sedikit jeda rendering DOM agar komponen konten siap, lalu scroll halus tepat ke area konten
    setTimeout(() => {
      const contentSection = document.getElementById('tab-content-area');
      if (contentSection) {
        // Ambil posisi absolut terhadap viewport dikurangi tinggi header sticky (sekitar 70px)
        const elementPosition = contentSection.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - 75;

        window.scrollTo({
          top: offsetPosition > 0 ? offsetPosition : 0,
          behavior: 'smooth',
        });
      }
    }, 50);
  };

  return (
    <>
      {/* 1. Sticky 5-Tab Navigation Bar (Desktop & Mobile Selaras Stitch.io) */}
      <div className="grid grid-cols-5 gap-1 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm min-h-14 sm:min-h-11 transition-all relative ${
                isActive
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full">{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Fixed Bottom Navigation Bar Khusus Tampilan Layar HP (Mobile App Experience) */}
      <nav
        aria-label="Navigasi Utama HP"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-2xl px-2 py-1.5"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 min-w-0 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'text-blue-900 font-extrabold bg-blue-50/90 scale-105'
                    : 'text-slate-500 hover:text-slate-900 font-bold'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'stroke-[2.5] text-blue-900' : ''
                    }`}
                  />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] truncate mt-0.5 font-bold">
                  {tab.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
