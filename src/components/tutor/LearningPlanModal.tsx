import React, { useState } from 'react';
import { X, Check, BookOpen, Target, Users } from 'lucide-react';

interface LearningPlanModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LearningPlanModal: React.FC<LearningPlanModalProps> = ({ onClose, onSuccess }) => {
  const [selectedClass, setSelectedClass] = useState<string>('Kids A (Primary Explorer)');
  const [topic, setTopic] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Silakan isi topik pembelajaran.');
      return;
    }
    if (!objective.trim()) {
      setError('Silakan isi tujuan pembelajaran.');
      return;
    }
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-slate-200 my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Isi Rencana Belajar
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Buat silabus materi pertemuan untuk kelas
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Tutup formulir rencana belajar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Formulir */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs sm:text-sm font-bold">
              {error}
            </div>
          )}

          {/* 1. Pilih Kelas */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-800" />
              Pilih Kelas:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            >
              <option value="Kids A (Primary Explorer)">Kids A (Primary Explorer - 15:30)</option>
              <option value="Teens 1 (Intermediate Young)">Teens 1 (Intermediate Young - 17:00)</option>
              <option value="Kids B (Beginner Phonics)">Kids B (Beginner Phonics - 14:00)</option>
            </select>
          </div>

          {/* 2. Input Topik */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-800" />
              Topik Pembelajaran:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError('');
              }}
              placeholder="Contoh: Food & Drinks: Ordering at a Restaurant"
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 font-bold text-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            />
          </div>

          {/* 3. Input Tujuan (1 Kalimat) */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-800" />
              Tujuan Pembelajaran:
            </label>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => {
                setObjective(e.target.value);
                setError('');
              }}
              placeholder="Contoh: Ananda mampu menyebutkan 10 nama makanan dan minuman serta berlatih memesan dengan sopan."
              className="w-full p-3 rounded-xl border-2 border-slate-300 text-slate-900 font-medium text-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Footer Tombol Simpan */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-extrabold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>Simpan Rencana</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
