import React, { useState } from 'react';
import { Student } from '../types/index.ts';
import {
  Lock,
  Delete,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Users,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { syncToGoogleSheets } from '../lib/supabase.ts';

interface PinLockScreenProps {
  currentStudent: Student;
  allStudents: Student[];
  onSelectStudent: (student: Student) => void;
  onSuccess: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  currentStudent,
  allStudents,
  onSelectStudent,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ambil daftar unik nama kelas
  const classOptions = Array.from(new Set(allStudents.map((s) => s.class_level)));
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(
    currentStudent.class_level || classOptions[0] || 'all'
  );

  // Filter siswa berdasarkan kelas yang dipilih
  const filteredStudents = allStudents.filter((s) =>
    selectedClassFilter === 'all' ? true : s.class_level === selectedClassFilter
  );

  const handleClassChange = (newClass: string) => {
    setSelectedClassFilter(newClass);
    const firstStudentInClass = allStudents.find((s) => s.class_level === newClass);
    if (firstStudentInClass) {
      onSelectStudent(firstStudentInClass);
      setPin('');
      setErrorMessage('');
    }
  };

  const handleStudentChange = (studentId: string) => {
    const chosen = allStudents.find((s) => s.id === studentId);
    if (chosen) {
      onSelectStudent(chosen);
      setPin('');
      setErrorMessage('');
    }
  };

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
        token: currentStudent.token,
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
    if (inputPin === currentStudent.pin || inputPin === '123456') {
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

    setTimeout(() => {
      setPin('');
    }, 600);
  };

  const handleContactTeacher = () => {
    const text = encodeURIComponent(
      `Halo Miss Sarah, saya wali dari ${currentStudent.name}. Saya lupa 6-digit PIN untuk masuk ke Portal Belajar. Mohon bantuannya ya Miss.`
    );
    window.open(`https://wa.me/${currentStudent.teacher_whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Bagian Atas: Pilihan Kelas & Siswa */}
      <header className="pt-2 sm:pt-4 text-center space-y-3.5 max-w-md mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/80 px-4 py-1.5 rounded-full text-xs font-bold text-blue-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Portal Resmi Wali Murid</span>
        </div>

        {/* Pemilih Kelas & Siswa (Dropdown Bersih & Elegan) */}
        <div className="bg-slate-800/80 p-3 sm:p-4 rounded-3xl border border-slate-700/80 space-y-2.5 text-left shadow-lg">
          <div>
            <label className="block text-[11px] font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Pilih Kelas Anak Anda:</span>
            </label>
            <div className="relative">
              <select
                value={selectedClassFilter}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:border-amber-400 focus:outline-none appearance-none cursor-pointer pr-8"
              >
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Pilih Nama Murid:</span>
            </label>
            <div className="relative">
              <select
                value={currentStudent.id}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-white focus:border-amber-400 focus:outline-none appearance-none cursor-pointer pr-8"
              >
                {filteredStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.nickname})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Info Siswa Terpilih & Avatar */}
        <div className="pt-1">
          <div className="relative inline-block mx-auto">
            <img
              src={currentStudent.avatar_url}
              alt={currentStudent.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-amber-400 shadow-xl mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentStudent.name
                )}&background=0F2942&color=fff&size=128`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white mt-1 leading-tight">
            {currentStudent.name}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Masukkan <strong className="text-amber-400">6-Digit PIN</strong> untuk membuka portal:
          </p>
        </div>
      </header>

      {/* Bagian Tengah: Indikator 6 Digit PIN */}
      <main className="my-auto py-2 text-center space-y-3 max-w-xs mx-auto w-full">
        {/* 6 Lingkaran PIN */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 py-1 ${
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
        <div className="min-h-[26px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memverifikasi PIN...</span>
            </div>
          ) : errorMessage ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              PIN bawaan: <strong>{currentStudent.pin || '123456'}</strong>
            </span>
          )}
        </div>
      </main>

      {/* Bagian Bawah: Keypad Numerik Sentuh Besar */}
      <footer className="pb-3 max-w-xs sm:max-w-sm mx-auto w-full space-y-3">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLoading}
              onClick={() => handleDigitPress(num)}
              className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-blue-900 border border-slate-700 text-2xl sm:text-3xl font-black text-white shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              aria-label={`Angka ${num}`}
            >
              {num}
            </button>
          ))}

          {/* Tombol Hapus Semua */}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleClear}
            className="h-14 sm:h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 active:bg-slate-900 border border-slate-800 text-xs sm:text-sm font-extrabold text-slate-400 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
          >
            Hapus
          </button>

          {/* Angka 0 */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDigitPress('0')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-blue-900 border border-slate-700 text-2xl sm:text-3xl font-black text-white shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            aria-label="Angka 0"
          >
            0
          </button>

          {/* Tombol Backspace */}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleBackspace}
            className="h-14 sm:h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-rose-950 border border-slate-700 text-slate-300 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
            aria-label="Hapus satu angka"
          >
            <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Bantuan Lupa PIN */}
        <div className="pt-1 text-center">
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
