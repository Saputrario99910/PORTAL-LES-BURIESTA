import React, { useState } from 'react';
import { Student } from '../types/index.ts';
import { Lock, Delete, PhoneCall, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { syncToGoogleSheets } from '../lib/supabase.ts';

interface PinLockScreenProps {
  student: Student;
  onSuccess: () => void;
  onSwitchStudent?: () => void;
  availableStudents?: Student[];
  onSelectStudent?: (student: Student) => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  student,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6 || isLoading) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage('');
    setIsError(false);

    if (newPin.length === 6) {
      validatePin(newPin);
    }
  };

  const handleBackspace = () => {
    if (isLoading) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
    setIsError(false);
  };

  const handleClear = () => {
    if (isLoading) return;
    setPin('');
    setErrorMessage('');
    setIsError(false);
  };

  const validatePin = async (inputPin: string) => {
    setIsLoading(true);

    // 1. Cek langsung ke database Google Sheets (jika webhook aktif)
    try {
      const res = await syncToGoogleSheets('verify_pin', {
        token: student.token,
        pin: inputPin,
      });

      if (res.success && res.data) {
        if (res.data.status === 'success') {
          setIsError(false);
          setIsLoading(false);
          onSuccess();
          return;
        } else if (res.data.status === 'invalid_pin') {
          handleFailedPin('PIN salah. Silakan periksa kembali 6 digit PIN Anda.');
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback offline / local
    }

    // 2. Fallback validasi lokal
    if (inputPin === student.pin || inputPin === '123456') {
      setIsError(false);
      setIsLoading(false);
      onSuccess();
    } else {
      setIsLoading(false);
      handleFailedPin('PIN 6-digit salah. Silakan coba lagi.');
    }
  };

  const handleFailedPin = (msg: string) => {
    setIsError(true);
    setErrorMessage(msg);
    setAttemptCount((prev) => prev + 1);

    setTimeout(() => {
      setPin('');
    }, 600);
  };

  const handleContactTeacher = () => {
    const text = encodeURIComponent(
      `Halo Miss Sarah, saya wali dari ${student.name}. Saya lupa 6-digit PIN untuk masuk ke Portal Belajar. Mohon bantuannya ya Miss.`
    );
    window.open(`https://wa.me/${student.teacher_whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Bagian Atas: Identitas Lembaga & Info Siswa */}
      <header className="pt-4 sm:pt-6 text-center space-y-3 max-w-md mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/80 px-4 py-1.5 rounded-full text-xs font-bold text-blue-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Akses Resmi & Aman Wali Murid</span>
        </div>

        {/* Avatar Siswa */}
        <div className="relative inline-block mx-auto pt-2">
          <img
            src={student.avatar_url}
            alt={student.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-400 shadow-xl mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://ui-avatars.com/api/?name=Kenzo+Alfarizi&background=0F2942&color=fff&size=128';
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
            Portal Belajar Siswa
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">{student.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            {student.class_level}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Masukkan <strong className="text-amber-400">6-Digit PIN</strong> untuk membuka portal belajar ananda (Cukup 1x login):
        </p>
      </header>

      {/* Bagian Tengah: Indikator 6 Digit PIN */}
      <main className="my-auto py-4 text-center space-y-4 max-w-xs mx-auto w-full">
        {/* 6 Lingkaran PIN */}
        <div
          className={`flex items-center justify-center gap-3.5 sm:gap-4 py-2 ${
            isError ? 'animate-shake' : ''
          }`}
          aria-label={`PIN terisi ${pin.length} dari 6 digit`}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-200 border-2 ${
                  isError
                    ? 'bg-rose-500 border-rose-400 scale-110'
                    : isFilled
                    ? 'bg-amber-400 border-amber-300 scale-115 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'bg-slate-800 border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Pesan Kesalahan atau Indikator Loading */}
        <div className="min-h-[28px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memverifikasi PIN ke database...</span>
            </div>
          ) : errorMessage ? (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              PIN bawaan standar demo: <strong>123456</strong>
            </span>
          )}
        </div>
      </main>

      {/* Bagian Bawah: Keypad Numerik Sentuh Besar (Mobile Friendly) */}
      <footer className="pb-4 max-w-xs sm:max-w-sm mx-auto w-full space-y-4">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLoading}
              onClick={() => handleDigitPress(num)}
              className="h-16 sm:h-18 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-blue-900 border border-slate-700 text-2xl sm:text-3xl font-black text-white shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              aria-label={`Angka ${num}`}
            >
              {num}
            </button>
          ))}

          {/* Tombol Hapus Semua (Clear) */}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleClear}
            className="h-16 sm:h-18 rounded-2xl bg-slate-800/50 hover:bg-slate-700 active:bg-slate-900 border border-slate-800 text-xs sm:text-sm font-extrabold text-slate-400 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
          >
            Hapus
          </button>

          {/* Angka 0 */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDigitPress('0')}
            className="h-16 sm:h-18 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-blue-900 border border-slate-700 text-2xl sm:text-3xl font-black text-white shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            aria-label="Angka 0"
          >
            0
          </button>

          {/* Tombol Backspace (Hapus 1 Karakter Terakhir) */}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleBackspace}
            className="h-16 sm:h-18 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-rose-950 border border-slate-700 text-slate-300 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
            aria-label="Hapus satu angka"
          >
            <Delete className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Bantuan Lupa PIN via WhatsApp Tutor */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleContactTeacher}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Lupa PIN? Hubungi Miss Sarah (WhatsApp)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
