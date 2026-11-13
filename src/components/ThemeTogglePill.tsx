import React, { useState } from 'react';
import { useTheme, ThemeType } from '../context/ThemeContext.tsx';
import { Palette, Check, Sparkles, Feather, Shield } from 'lucide-react';

export const ThemeTogglePill: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: ThemeType; name: string; subtitle: string; icon: React.ReactNode; previewColors: string[] }[] = [
    {
      id: 'navy-amber',
      name: 'Navy & Amber (Asli)',
      subtitle: 'Kontras tinggi, resmi & profesional',
      icon: <Shield className="w-4 h-4 text-amber-500" />,
      previewColors: ['bg-blue-950', 'bg-amber-400'],
    },
    {
      id: 'clean-minimal',
      name: 'Clean & Minimalis',
      subtitle: 'Tema edukasi: Putih & Teal/Sky Blue',
      icon: <Feather className="w-4 h-4 text-teal-600" />,
      previewColors: ['bg-white border border-slate-300', 'bg-teal-600'],
    },
    {
      id: 'playful-kids',
      name: 'Ceria & Ramah Anak',
      subtitle: 'Font rounded, aksen Oranye & Kuning',
      icon: <Sparkles className="w-4 h-4 text-orange-500" />,
      previewColors: ['bg-orange-500', 'bg-amber-400'],
    },
  ];

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative inline-block text-left z-40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/25 shadow-xs transition-all active:scale-95"
        title="Ganti Tema Visual Aplikasi"
      >
        <Palette className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Tema:</span>
        <span className="font-extrabold text-amber-300 truncate max-w-[110px]">
          {theme === 'navy-amber' ? 'Navy' : theme === 'clean-minimal' ? 'Clean' : 'Ceria'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white text-slate-900 shadow-2xl border-2 border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Pilih Variasi Tema
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                3 Pilihan
              </span>
            </div>

            <div className="p-1 space-y-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-100 border-2 border-blue-900 shadow-xs'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 rounded-lg bg-slate-100 shrink-0">
                        {t.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {t.name}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {t.previewColors.map((color, i) => (
                              <span key={i} className={`w-2.5 h-2.5 rounded-full ${color}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                          {t.subtitle}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
