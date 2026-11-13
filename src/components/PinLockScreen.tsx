import React, { useState } from 'react';
import { Student } from '../types/index.ts';
import { Lock, Delete, PhoneCall, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

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
  availableStudents,
  onSelectStudent,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage('');
    setIsError(false);

    if (newPin.length === 6) {
      validatePin(newPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
    setIsError(false);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
    setIsError(false);
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === student.pin) {
      setIsError(false);
      setErrorMessage('');
      onSuccess();
    } else {
      setIsError(true);
      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);
      setErrorMessage('PIN tidak sesuai. Silakan periksa kembali 6 angka PIN.');
      // Auto clear after brief delay
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  const handleAutoFillDemo = () => {
    setPin(student.pin);
    setTimeout(() => {
      onSuccess();
    }, 350);
  };

  const handleHelpWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Miss Sarah, saya wali dari ${student.name}. Saya membutuhkan bantuan terkait PIN untuk membuka halaman wali murid Rumah Belajar English.`
    );
    window.open(`https://wa.me/${student.teacher_whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Bagian Atas: Header Ramah & Sambutan */}
      <div className="pt-4 text-center">
        {/* Badge Nama Lembaga */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-900 font-bold text-sm mb-3">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Rumah Belajar English</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Portal Aman Wali Murid
        </h1>
        <p className="mt-2 text-slate-700 text-base sm:text-lg">
          Selamat datang, Wali dari <span className="font-bold text-slate-900">{student.name}</span> ({student.nickname})
        </p>
      </div>

      {/* Bagian Tengah: Tampilan Indikator 6 Digit & Status */}
      <div className="my-auto py-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2 text-slate-600 font-medium text-base">
          <Lock className="w-5 h-5 text-amber-600" />
          <span>Masukkan 6 Angka PIN Rahasia</span>
        </div>

        {/* 6 Lingkaran PIN Besar */}
        <div
          className={`flex justify-center items-center gap-3 my-3 p-3 bg-white rounded-2xl border-2 transition-all ${
            isError ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-300 shadow-sm'
          }`}
          role="status"
          aria-label={`PIN terisi ${pin.length} dari 6 angka`}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-150 ${
                  isFilled
                    ? 'bg-blue-900 text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-300 border-2 border-slate-300'
                }`}
              >
                {isFilled ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Notifikasi Error jika PIN salah */}
        {errorMessage ? (
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm sm:text-base mt-2 bg-red-100 px-4 py-2 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tekan angka di bawah ini seperti pada tombol telepon
          </p>
        )}

        {/* Tombol Demo Cepat untuk Uji Coba */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm border-2 border-amber-300 transition-colors shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-700" />
            <span>Klik di Sini untuk Isi PIN Otomatis ({student.pin})</span>
          </button>
        </div>
      </div>

      {/* Bagian Bawah: Keypad Virtual Angka Besar (Format Telepon) */}
      <div className="w-full max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-16 sm:h-18 rounded-2xl bg-white border-2 border-slate-300 hover:border-blue-900 hover:bg-blue-50 text-slate-900 active:bg-blue-900 active:text-white font-extrabold text-2xl sm:text-3xl shadow-sm transition-all flex items-center justify-center select-none active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
              aria-label={`Tombol angka ${digit}`}
            >
              {digit}
            </button>
          ))}

          {/* Tombol Hapus Semua */}
          <button
            type="button"
            onClick={handleClear}
            className="h-16 sm:h-18 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-base shadow-sm transition-all flex items-center justify-center select-none active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-300"
            aria-label="Hapus semua angka"
          >
            Bersihkan
          </button>

          {/* Tombol Angka 0 */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-16 sm:h-18 rounded-2xl bg-white border-2 border-slate-300 hover:border-blue-900 hover:bg-blue-50 text-slate-900 active:bg-blue-900 active:text-white font-extrabold text-2xl sm:text-3xl shadow-sm transition-all flex items-center justify-center select-none active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
            aria-label="Tombol angka 0"
          >
            0
          </button>

          {/* Tombol Hapus 1 Digit (Backspace) */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-16 sm:h-18 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-base shadow-sm transition-all flex items-center justify-center gap-1 select-none active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-300"
            aria-label="Hapus satu angka"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Tombol Bantuan WA untuk Orang Tua */}
        <div className="mt-5 text-center flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleHelpWhatsApp}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-green-700 font-semibold text-sm sm:text-base py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <PhoneCall className="w-5 h-5 text-green-600" />
            <span>Lupa PIN? Tanya Miss Sarah via WhatsApp</span>
          </button>

          {/* Switch Siswa Contoh (Jika ada) */}
          {availableStudents && availableStudents.length > 1 && onSelectStudent && (
            <div className="pt-2 border-t border-slate-200 w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600">
              <span>Ganti Profil Siswa Uji Coba:</span>
              <div className="flex gap-2">
                {availableStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onSelectStudent(st);
                      setPin('');
                      setErrorMessage('');
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                      st.id === student.id
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {st.nickname}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
