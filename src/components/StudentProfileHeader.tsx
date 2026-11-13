import React, { useRef } from 'react';
import { Student } from '../types/index.ts';
import { Calendar, UserCheck, MessageCircle, Camera, Check, RefreshCw } from 'lucide-react';

interface StudentProfileHeaderProps {
  student: Student;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  onUpdateAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Foto Siswa dengan Tombol Ganti Foto (Upload Sesuai Keinginan) */}
        <div className="relative shrink-0 group">
          <img
            src={student.avatar_url}
            alt={`Foto ananda ${student.name}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-amber-400 shadow-md group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://ui-avatars.com/api/?name=Kenzo+Alfarizi&background=0F2942&color=fff&size=128';
            }}
          />

          {/* Tombol Kamera Kecil untuk Mengganti Foto */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -top-2 -right-2 bg-blue-900 hover:bg-blue-800 text-white p-2 rounded-full border-2 border-white shadow-md active:scale-90 transition-transform"
            title="Ganti Foto Profil Murid (Upload dari HP / Laptop)"
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

          {/* Tombol Hubungi Guru & Keterangan Ganti Foto */}
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <button
              onClick={handleChatTeacher}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hubungi Miss Sarah (WhatsApp)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl border border-slate-300 transition-colors"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Ubah Foto Profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
