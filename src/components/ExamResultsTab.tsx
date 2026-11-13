import React, { useState } from 'react';
import { UnitExamResult } from '../types/index.ts';
import {
  Award,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface ExamResultsTabProps {
  results: UnitExamResult[];
  studentName: string;
}

export const ExamResultsTab: React.FC<ExamResultsTabProps> = ({ results, studentName }) => {
  const [selectedExam, setSelectedExam] = useState<UnitExamResult>(
    results[results.length - 1] || results[0]
  );
  const [selectedBook, setSelectedBook] = useState<string>('all');

  // Filter buku jika ada opsi multi buku
  const bookList = Array.from(new Set(results.map((r) => r.book_name)));
  const filteredResults =
    selectedBook === 'all' ? results : results.filter((r) => r.book_name === selectedBook);

  // Hitung rata-rata dan nilai tertinggi
  const scores = filteredResults.map((r) => r.score);
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const latestScore = filteredResults[filteredResults.length - 1]?.score || 0;

  // Koordinat SVG untuk grafik kurva garis naik-turun nilai
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 35;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Skala sumbu Y dari 50 s.d 100
  const minY = 50;
  const maxY = 100;

  const points = filteredResults.map((item, index) => {
    const x =
      filteredResults.length > 1
        ? paddingX + (index / (filteredResults.length - 1)) * chartWidth
        : paddingX + chartWidth / 2;
    const y = paddingY + chartHeight - ((item.score - minY) / (maxY - minY)) * chartHeight;
    return { x, y, item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-5">
      {/* 1. Header Ringkasan & Edukasi Wali Murid */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-amber-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black">
              <Award className="w-3.5 h-3.5" />
              <span>Laporan Hasil Ujian per Unit Selesai</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Perkembangan Nilai {studentName}</h3>
            <p className="text-sm text-blue-100 max-w-lg">
              Setiap buku terdiri dari beberapa unit. Ujian diadakan setiap unit selesai agar Ayah/Bunda
              dapat memantau grafik kenaikan pemahaman ananda secara transparan.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
            <div className="text-center">
              <span className="text-xs text-blue-200 block font-semibold">Rata-rata</span>
              <span className="text-2xl font-black text-amber-300">{averageScore}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-xs text-blue-200 block font-semibold">Tertinggi</span>
              <span className="text-2xl font-black text-emerald-300">{maxScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Kartu Grafik Naik Turun Nilai (Interactive SVG Visual Chart) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-900" />
            <div>
              <h4 className="text-lg font-black text-slate-900">Grafik Tren Nilai Ujian</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Sentuh titik pada grafik untuk melihat rincian evaluasi guru
              </p>
            </div>
          </div>

          {/* Filter Buku */}
          {bookList.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Pilih Buku:</span>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="all">Semua Buku</option>
                {bookList.map((bk) => (
                  <option key={bk} value={bk}>
                    {bk}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Visual Canvas SVG */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Garis Horizontal Baseline Panduan Nilai */}
              {[100, 90, 80, 70, 60].map((level) => {
                const y = paddingY + chartHeight - ((level - minY) / (maxY - minY)) * chartHeight;
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1.2"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="end"
                      fontWeight="bold"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Area di Bawah Garis */}
              {points.length > 1 && (
                <polygon
                  points={`${points[0].x},${paddingY + chartHeight} ${polylinePoints} ${
                    points[points.length - 1].x
                  },${paddingY + chartHeight}`}
                  fill="url(#curveGradient)"
                />
              )}

              {/* Garis Kurva Tren Nilai */}
              <polyline
                fill="none"
                stroke="url(#lineStroke)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Titik-titik Data Nilai */}
              {points.map(({ x, y, item }) => {
                const isSelected = selectedExam?.id === item.id;
                return (
                  <g
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedExam(item)}
                  >
                    {/* Lingkaran Luar / Pulsing Glow jika dipilih */}
                    {isSelected && (
                      <circle
                        cx={x}
                        y={y}
                        r="14"
                        fill="#fde047"
                        fillOpacity="0.5"
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      cx={x}
                      y={y}
                      r={isSelected ? '8' : '6'}
                      fill={isSelected ? '#1e3a8a' : '#2563eb'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Label Angka Nilai Asli di Atas Titik */}
                    <rect
                      x={x - 16}
                      y={y - 28}
                      width="32"
                      height="18"
                      rx="6"
                      fill={isSelected ? '#1e3a8a' : '#0f172a'}
                      className="shadow-sm"
                    />
                    <text
                      x={x}
                      y={y - 15}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      {item.score}
                    </text>

                    {/* Label Sumbu X (Unit 1, Unit 2, dst) */}
                    <text
                      x={x}
                      y={svgHeight - 10}
                      fill={isSelected ? '#1e3a8a' : '#64748b'}
                      fontSize="11"
                      fontWeight={isSelected ? '900' : 'bold'}
                      textAnchor="middle"
                    >
                      U{item.unit_number}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend Penjelasan */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="font-semibold">Titik Nilai Unit Test (Skor 0 - 100)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Tren Positif: Mengalami peningkatan bertahap dari Unit 1 ke Unit 6</span>
          </div>
        </div>
      </div>

      {/* 3. Kartu Detail Nilai Terpilih (Komentar & Evaluasi Guru) */}
      {selectedExam && (
        <div className="bg-white rounded-3xl border-2 border-blue-900 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                {selectedExam.book_name}
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1.5">
                {selectedExam.unit_title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Tanggal Pelaksanaan: {selectedExam.date}
              </p>
            </div>

            {/* Nilai Asli Badge Besar */}
            <div className="flex items-center gap-3 bg-blue-950 text-white px-5 py-3 rounded-2xl shrink-0">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-blue-200 block">NILAI ASLI</span>
                <span className="text-3xl font-black text-amber-400 leading-none">
                  {selectedExam.score}
                </span>
                <span className="text-xs text-blue-200 font-bold ml-1">/ 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Penguasaan Materi & Kelebihan:</span>
              </div>
              <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                {selectedExam.strengths}
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Catatan & Rekomendasi Guru:</span>
              </div>
              <p className="text-sm text-amber-950 font-medium leading-relaxed">
                {selectedExam.teacher_feedback}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tabel Rincian Nilai Lengkap Semua Unit */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-900" />
          <span>Tabel Nilai Lengkap per Unit (Buku 1 Selesai)</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-700 bg-slate-50 font-black">
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Topik Bahasan</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3 text-center">Nilai Asli</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredResults.map((exam) => {
                const isSelected = selectedExam?.id === exam.id;
                return (
                  <tr
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 font-extrabold text-blue-950">Unit {exam.unit_number}</td>
                    <td className="py-3 px-3">{exam.unit_title.replace(/^Unit \d+:\s*/, '')}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs sm:text-sm">{exam.date}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-full font-black text-blue-900 bg-amber-300 text-sm">
                        {exam.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-extrabold bg-emerald-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Tuntas
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
