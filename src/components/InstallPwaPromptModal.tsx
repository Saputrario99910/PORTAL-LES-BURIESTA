import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, ArrowUpRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaPromptModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // Langsung munculkan banner
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showAndroidManualTip, setShowAndroidManualTip] = useState<boolean>(false);

  useEffect(() => {
    // Cek apakah web sudah dalam mode terinstall (standalone)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isInStandaloneMode) {
      setIsStandalone(true);
      setShowPrompt(false);
      return;
    }

    // Deteksi perangkat iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Cek apakah user pernah menutup banner dalam 1 hari terakhir
    const dismissedUntil = localStorage.getItem('rbe_install_prompt_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      setShowPrompt(false);
      return;
    }

    setShowPrompt(true);

    // Listener browser Android/Chrome untuk memicu prompt install otomatis
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Tampilkan popup native sistem Android langsung ke layar pengguna
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowAndroidManualTip(true);
      }
    } else {
      // Jika browser belum melempar event native, buka petunjuk visual 1 langkah
      setShowAndroidManualTip(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Simpan penundaan 3 hari agar tidak mengganggu jika pengguna sengaja belum ingin install
    localStorage.setItem(
      'rbe_install_prompt_dismissed_until',
      String(Date.now() + 3 * 24 * 60 * 60 * 1000)
    );
  };

  // Jangan tampilkan jika sudah di-install sebagai aplikasi
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-amber-300/60 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full bg-white/10 active:scale-95 transition-all"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-white text-blue-900 p-1 flex items-center justify-center shrink-0 shadow-md">
            <img src="/pwa-192x192.png" alt="Portal RBE" className="w-full h-full rounded-xl object-cover" />
          </div>

          <div className="flex-1">
            <span className="text-[10px] font-black tracking-wider uppercase bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full">
              Resmi & Gratis
            </span>
            <h4 className="text-base font-extrabold text-white mt-1 leading-snug">
              Pasang Aplikasi di Layar HP
            </h4>
            <p className="text-xs text-blue-100 font-medium mt-0.5 leading-relaxed">
              Buka portal ananda lebih cepat langsung dari layar utama tanpa repot buka browser!
            </p>
          </div>
        </div>

        {/* Tombol Eksekusi Aksi */}
        <div className="mt-3.5 pt-3 border-t border-white/15">
          {!isIos ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-blue-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Pasang Sekarang (1-Klik)</span>
              </button>

              {showAndroidManualTip && (
                <div className="bg-white/10 rounded-xl p-2.5 text-xs text-amber-200 font-semibold space-y-1">
                  <p className="text-[11px] text-blue-100 leading-tight">
                    💡 <strong>Tips Tambahan:</strong> Jika popup sistem tidak muncul, cukup tap ikon <strong>titik tiga (⋮)</strong> di browser lalu pilih <strong>"Tambahkan ke Layar Utama" / "Install Aplikasi"</strong>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 rounded-xl p-2.5 text-xs text-amber-200 font-semibold space-y-1">
              <div className="flex items-center gap-1.5 text-white font-extrabold">
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                <span>Pengguna iPhone / iPad:</span>
              </div>
              <p className="text-[11px] text-blue-100 leading-tight">
                1. Tap tombol <strong>Share / Bagikan</strong> (ikon kotak panah ke atas) di Safari.
                <br />
                2. Pilih <strong>"Tambah ke Layar Utama"</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
