import React, { useState } from 'react';
import { Student } from '../types/index.ts';
import {
  Users,
  ChevronDown,
  Check,
  Plus,
  X,
  Lock,
  Loader2,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { verifyStudentPin } from '../services/apiService.ts';

interface ChildSwitcherProps {
  currentStudent: Student;
  allStudents: Student[];
  unlockedStudentIds: string[];
  onSelectStudent: (student: Student) => void;
  onAddNewChildSuccess: (student: Student) => void;
}

export const ChildSwitcher: React.FC<ChildSwitcherProps> = ({
  currentStudent,
  allStudents,
  unlockedStudentIds,
  onSelectStudent,
  onAddNewChildSuccess,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [candidateStudentId, setCandidateStudentId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Daftar siswa yang sudah di-unlock / terhubung dalam sesi ini
  const connectedStudents = allStudents.filter(
    (s) => unlockedStudentIds.includes(s.id) || s.id === currentStudent.id
  );

  // Siswa lain yang belum terhubung di sesi ini
  const availableToConnect = allStudents.filter(
    (s) => !unlockedStudentIds.includes(s.id) && s.id !== currentStudent.id
  );

  const handleSelect = (student: Student) => {
    if (student.id !== currentStudent.id) {
      onSelectStudent(student);
    }
    setIsOpen(false);
  };

  const handleOpenAddNew = () => {
    setIsAddingNew(true);
    setCandidateStudentId(availableToConnect[0]?.id || '');
    setPinInput('');
    setPinError('');
  };

  const handleVerifyNewChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!candidateStudentId) {
      setPinError('Pilih anak yang ingin dihubungkan.');
      return;
    }

    if (pinInput.length !== 6) {
      setPinError('PIN harus tepat 6 digit.');
      return;
    }

    const candidate = allStudents.find((s) => s.id === candidateStudentId);
    if (!candidate) return;

    setIsLoading(true);
    try {
      const res = await verifyStudentPin(candidate.token, pinInput);
      if (res.success) {
        onAddNewChildSuccess(candidate);
        setIsAddingNew(false);
        setPinInput('');
        setIsOpen(false);
      } else {
        setPinError(res.message || '6 Digit PIN salah. Silakan coba lagi.');
      }
    } catch {
      setPinError('Terjadi kendala saat memverifikasi PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Tombol Pemicu di Header / Banner */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/90 hover:bg-blue-800/90 border border-amber-400/60 text-white shadow-xs transition-all active:scale-95 group"
        title="Klik untuk beralih profil anak"
        aria-label="Pilih Profil Anak"
      >
        <div className="relative">
          <img
            src={currentStudent.avatar_url}
            alt={currentStudent.name}
            className="w-6 h-6 rounded-full object-cover border border-amber-300"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
        </div>

        <div className="text-left flex items-center gap-1.5">
          <span className="text-xs font-black tracking-tight text-amber-200">
            {currentStudent.nickname}
          </span>
          {connectedStudents.length > 1 && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-700/80 text-white">
              {connectedStudents.length} Anak
            </span>
          )}
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-amber-300 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Modal / Bottom-Sheet Switcher */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setIsOpen(false);
            setIsAddingNew(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-slate-200 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Pilih Profil Anak
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Beralih tanpa perlu login ulang
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAddingNew(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Tambah Anak Lain (Jika Mode Tambah Aktif) */}
            {isAddingNew ? (
              <form onSubmit={handleVerifyNewChild} className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wide">
                    Hubungkan Profil Anak Lain
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    Batal
                  </button>
                </div>

                {pinError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                    {pinError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Nama Anak:
                  </label>
                  <select
                    value={candidateStudentId}
                    onChange={(e) => setCandidateStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white outline-hidden"
                    required
                  >
                    {availableToConnect.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Masukkan 6-Digit PIN Anak Ini:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 123456"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-sm font-bold tracking-widest text-center focus:border-blue-900 outline-hidden bg-white"
                    required
                  />
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    Hanya perlu diverifikasi 1x, setelah itu tersimpan di sesi HP ini.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || pinInput.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Check className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isLoading ? 'Memverifikasi...' : 'Hubungkan & Buka Profil'}</span>
                </button>
              </form>
            ) : (
              /* Daftar Anak yang Terhubung */
              <div className="space-y-2.5">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {connectedStudents.map((child) => {
                    const isActive = child.id === currentStudent.id;

                    return (
                      <div
                        key={child.id}
                        onClick={() => handleSelect(child)}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                            : 'border-slate-200 hover:border-blue-900 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={child.avatar_url}
                            alt={child.name}
                            className={`w-11 h-11 rounded-xl object-cover border-2 ${
                              isActive ? 'border-emerald-500' : 'border-slate-300'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-slate-900">
                                {child.name}
                              </h4>
                              {isActive && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-semibold block">
                              {child.class_level}
                            </span>
                          </div>
                        </div>

                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-blue-900 hover:underline">
                            Pilih
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tombol Tambah Anak Lain jika masih ada yang belum terhubung */}
                {availableToConnect.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenAddNew}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-900 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-blue-900" />
                    <span>+ Hubungkan Profil Anak Lain (Input PIN 1x)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
