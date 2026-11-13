import React from 'react';
import { BookCurriculum } from '../types/index.ts';
import {
  BookOpen,
  Target,
  Sparkles,
  BookmarkCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface LearningPlanTabProps {
  curriculums?: BookCurriculum[];
}

export const LearningPlanTab: React.FC<LearningPlanTabProps> = ({ curriculums = [] }) => {
  const currentBook = curriculums[0];
  // Ambil materi pertemuan/unit yang sedang aktif berjalan atau terbaru (Unit 6: Food & Noodles)
  const currentUnitMeetings = currentBook
    ? currentBook.meetings.filter(
        (m) => m.title.includes('Unit 6') || m.status === 'sedang_berjalan'
      )
    : [];

  const mainMeeting = currentUnitMeetings[0] || (currentBook ? currentBook.meetings[10] : null);

  return (
    <div className="space-y-4">
      {/* 1. Header Khusus Materi Unit Saat Ini */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-5 text-white border-2 border-amber-400 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Materi Unit Sedang Berjalan</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Unit 6: Delicious Food & Ordering
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Fokus pembelajaran ananda pada unit ini agar Ayah/Bunda dapat mendampingi dan melatih
            percakapan praktis di rumah.
          </p>
        </div>
      </div>

      {/* 2. Kartu Rincian Materi 1 Unit Ini */}
      {mainMeeting && (
        <div className="bg-white rounded-3xl border-2 border-blue-900/30 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                Target Pertemuan Ini
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-1.5">
                {mainMeeting.title}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-black text-blue-900 bg-amber-300 px-3 py-1 rounded-full shrink-0 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              Aktif
            </span>
          </div>

          {/* Rincian Target */}
          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
                <Target className="w-4 h-4 text-blue-900" />
                <span>Target Capaian Belajar:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {mainMeeting.learning_goal}
              </p>
            </div>

            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-1">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                <BookmarkCheck className="w-4 h-4 text-indigo-700" />
                <span>Pola Kalimat yang Dilatih:</span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-indigo-900 font-bold bg-white/80 p-2 rounded-xl border border-indigo-100 inline-block">
                {mainMeeting.grammar_focus}
              </p>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-xs font-black text-amber-950 block">
                Kosakata Kunci yang Dipelajari:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {mainMeeting.vocabulary.map((vocab, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-slate-900 text-xs font-black px-3 py-1 rounded-xl border border-amber-300 shadow-2xs"
                  >
                    {vocab}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tips untuk Orang Tua di Rumah */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <h5 className="text-xs font-black text-emerald-950 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tips Pendampingan di Rumah:
            </h5>
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              Ayah/Bunda dapat mengajak ananda bermain pura-pura memesan makanan (roleplay) saat makan
              siang menggunakan kalimat sederhana: <em>"Would you like noodles?"</em>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
