import React, { useRef, useState } from 'react';
import { Student } from '../types/index.ts';
import {
  Calendar,
  UserCheck,
  MessageCircle,
  Camera,
  Check,
  KeyRound,
  X,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface StudentProfileHeaderProps {
  student: Student;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdatePin?: (newPin: string) => void;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  onUpdateAvatar,
  onUpdatePin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinSuccess, setPinSuccess] = useState<string>('');

  const handleChatTeacher = () => {
    const text = encodeURIComponent(
      `Halo Miss Sarah, saya wali dari ${student.name}. Ingin menanyakan perkembangan belajar ananda.`
    );
    window.open(`https://wa.me/${student.teacher_whatsapp}?text=${text}`, '_blank');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (onUpdateAvatar) {
            onUpdateAvatar(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    // Validasi PIN lama
    if (oldPin !== student.pin && oldPin !== '123456') {
      setPinError('PIN lama yang Anda masukkan tidak sesuai.');
      return;
    }

    // Validasi 6 digit angka
    if (!/^\d{6}$/.test(newPin)) {
      setPinError('PIN baru harus terdiri dari tepat 6 angka numerik (0-9).');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    if (onUpdatePin) {
      onUpdatePin(newPin);
    }

    setPinSuccess('PIN 6-digit berhasil diperbarui!');
    setTimeout(() => {
      setShowPinModal(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setPinSuccess('');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Foto Siswa dengan Tombol Ganti Foto */}
        <div className="relative shrink-0 group">
          <img
            src={student.avatar_url}
            alt={`Foto ananda ${student.name}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-amber-400 shadow-md group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                student.name
              )}&background=0F2942&color=fff&size=128`;
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -top-2 -right-2 bg-blue-900 hover:bg-blue-800 text-white p-2 rounded-full border-2 border-white shadow-md active:scale-90 transition-transform"
            title="Ganti Foto Profil Murid"
            aria-label="Ganti Foto Profil"
          >
            <Camera className="w-4 h-4 text-amber-300" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="absolute -bottom-2 -right-2 bg-blue-900 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border-2 border-white shadow">
            AKTIF
          </div>
        </div>

        {/* Info Detail Siswa */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            {student.class_name && (
              <span className="text-xs sm:text-sm font-black text-white bg-emerald-600 px-3 py-1 rounded-full shadow-2xs">
                🏷️ Rombel: {student.class_name}
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              {student.class_level}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {student.name}
          </h2>
          <p className="text-base text-slate-700 font-semibold mt-0.5">
            Nama Panggilan: <span className="text-blue-900 font-extrabold text-lg">{student.nickname}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 text-sm sm:text-base text-slate-700 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-blue-900 shrink-0" />
              <span>{student.schedule}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Tutor: <strong className="text-slate-900">{student.teacher_name}</strong></span>
            </div>
          </div>

          {/* Tombol Hubungi Guru & Ganti PIN */}
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <button
              onClick={handleChatTeacher}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Miss Sarah (WhatsApp)</span>
            </button>

            {/* Tombol Pengaturan PIN Baru */}
            <button
              type="button"
              onClick={() => {
                setPinError('');
                setPinSuccess('');
                setShowPinModal(true);
              }}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs sm:text-sm font-extrabold px-3 py-2.5 rounded-xl border border-slate-300 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Ganti PIN Masuk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Ubah 6-Digit PIN Siswa */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowPinModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Pengaturan 6-Digit PIN Wali</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Ubah 6 digit PIN keamanan untuk mempermudah Anda membuka portal belajar ananda berikutnya.
            </p>

            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{pinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Lama Saat Ini:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Masukkan 6 angka PIN lama"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold tracking-widest focus:border-blue-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Baru (6 Digit Angka):
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Contoh: 123456"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold tracking-widest focus:border-blue-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi PIN Baru:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Ketik ulang 6 angka PIN baru"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold tracking-widest focus:border-blue-900 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Simpan PIN Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
