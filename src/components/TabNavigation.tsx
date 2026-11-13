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

  return (
    <>
      {/* 1. Header Pil Segmented Control di Desktop/Tablet (Sangat Rapi & Bersih) */}
      <div className="hidden sm:flex items-center justify-between bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-xs gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm ring-1 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.title}</span>
              {tab.badge && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
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
                onClick={() => {
                  onChangeTab(tab.id);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
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
