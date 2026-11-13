import React, { useState } from 'react';
import { BookCurriculum, LearningPlanItem } from '../types/index.ts';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
} from 'lucide-react';

interface LearningPlanTabProps {
  curriculums?: BookCurriculum[];
  legacyPlans?: LearningPlanItem[];
}

export const LearningPlanTab: React.FC<LearningPlanTabProps> = ({
  curriculums = [],
  legacyPlans = [],
}) => {
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'selesai' | 'akan_datang'>('all');

  const currentBook = curriculums[selectedBookIndex] || curriculums[0];

  const filteredMeetings = currentBook
    ? currentBook.meetings.filter((m) => {
        if (filterMode === 'all') return true;
        if (filterMode === 'selesai') return m.status === 'selesai';
        if (filterMode === 'akan_datang')
          return m.status === 'akan_datang' || m.status === 'sedang_berjalan';
        return true;
      })
    : [];

  return (
    <div className="space-y-5">
      {/* 1. Header Pengenalan Silabus Buku */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-5 sm:p-6 text-white border-2 border-amber-400 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black">
              <Layers className="w-3.5 h-3.5" />
              <span>Silabus & Peta Materi per Buku</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Rencana Belajar Multi-Pertemuan</h3>
            <p className="text-sm text-blue-100 max-w-xl">
              Lihat seluruh materi yang akan dan telah dipelajari dalam 1 buku pembelajaran (12
              pertemuan lengkap), mencakup fokus tata bahasa (grammar), kosakata, serta target capaian
              anak.
            </p>
          </div>

          {currentBook && (
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
              <span className="text-xs text-blue-200 font-semibold block">Progres Buku 1</span>
              <span className="text-2xl font-black text-amber-300">
                {currentBook.completed_meetings} / {currentBook.total_meetings}
              </span>
              <span className="text-[11px] text-blue-200 font-medium block">Pertemuan Tuntas</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Pemilih Buku Pembelajaran */}
      {curriculums.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {curriculums.map((book, idx) => {
            const isSelected = selectedBookIndex === idx;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBookIndex(idx)}
                className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2 ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {book.book_title.split(':')[0]}
                <span className="text-xs ml-1.5 opacity-80">({book.level})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Deskripsi Buku Aktif */}
      {currentBook && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {currentBook.level}
              </span>
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                {currentBook.book_title}
              </h4>
            </div>

            {/* Filter Status Pertemuan */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterMode === 'all' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua ({currentBook.meetings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('selesai')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterMode === 'selesai' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Selesai ({currentBook.completed_meetings})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('akan_datang')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterMode === 'akan_datang' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Akan Datang ({currentBook.total_meetings - currentBook.completed_meetings})
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {currentBook.description}
          </p>
        </div>
      )}

      {/* 4. Daftar Lengkap Semua Pertemuan dalam Buku */}
      <div className="space-y-3">
        {filteredMeetings.map((item) => {
          const isDone = item.status === 'selesai';
          const isCurrent = item.status === 'sedang_berjalan';

          return (
            <div
              key={item.meeting_number}
              className={`bg-white rounded-3xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-300'
                  : isDone
                  ? 'border-slate-200'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              {/* Header Kartu Pertemuan */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-xs sm:text-sm px-3 py-1 rounded-xl ${
                      isDone
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Pertemuan {item.meeting_number}
                  </span>
                  <h5 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {item.title}
                  </h5>
                </div>

                {isDone ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Materi Selesai
                  </span>
                ) : isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-blue-900 bg-amber-300 px-3 py-1 rounded-full animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sedang Dipelajari
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Akan Datang
                  </span>
                )}
              </div>

              {/* Rincian Materi: Target, Grammar, dan Kosakata */}
              <div className="pt-3 space-y-2.5">
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <Target className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-900 font-bold">Target Belajar: </strong>
                    {item.learning_goal}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <BookmarkCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-900 font-bold">Pola Kalimat / Grammar: </strong>
                    <code className="bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded-md font-mono text-xs">
                      {item.grammar_focus}
                    </code>
                  </p>
                </div>

                {/* Tag Kosakata */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-1">Kosakata:</span>
                  {item.vocabulary.map((vocab, vIdx) => (
                    <span
                      key={vIdx}
                      className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-slate-200"
                    >
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
