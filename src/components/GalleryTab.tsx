import React, { useState } from 'react';
import { GalleryItem } from '../types/index.ts';
import {
  ZoomIn,
  X,
  Calendar,
  Sparkles,
  Images,
  Wand2,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
} from 'lucide-react';

interface GalleryTabProps {
  items: GalleryItem[];
}

export const GalleryTab: React.FC<GalleryTabProps> = ({ items }) => {
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<GalleryItem | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // State untuk Generator Deskripsi AI
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiTopicInput, setAiTopicInput] = useState<string>(
    'Cooking class memasak noodles. Murid belajar vocabulary in the kitchen.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  // Simulasi generate caption edukatif via AI
  const handleGenerateAiCaption = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Hasil generate natural bahasa Indonesia dengan nuansa edukatif & ramah orang tua
      const promptLower = aiTopicInput.toLowerCase();
      let result = '';

      if (promptLower.includes('cooking') || promptLower.includes('noodles') || promptLower.includes('kitchen')) {
        result = `🍳 Sesi Cooking Class Seru: Memasak Noodles & Praktik Kosakata Dapur! 🥢✨\n\nHari ini adik-adik antusias belajar bahasa Inggris secara hands-on di dapur mini kelas kami. Sambil mempraktikkan cara membuat mie, anak-anak aktif menyebutkan berbagai peralatan memasak seperti 'pan', 'bowl', 'spoon', dan 'chopsticks', serta mengekspresikan rasa dalam bahasa Inggris ('yummy!', 'delicious!'). Pengalaman belajar langsung seperti ini membuat kosakata menempel lebih kuat di memori anak dengan cara yang sangat menyenangkan! 🌟`;
      } else if (promptLower.includes('reading') || promptLower.includes('buku')) {
        result = `📚 Pojok Literasi & Reading Corner: Petualangan Membaca Bersama Kawan! 📖✨\n\nMelalui sesi membaca cerita bergambar, anak-anak dilatih intonasi pengucapan kata dan keberanian mengekspresikan dialog tokoh. Semua murid saling menyimak dengan penuh rasa empati dan semangat belajar yang tinggi.`;
      } else {
        result = `🌟 Momen Belajar Seru & Penuh Antusiasme! ✨\n\nMelalui aktivitas "${aiTopicInput}", adik-adik tidak hanya mengasah kecakapan berkomunikasi dalam bahasa Inggris secara spontan, tetapi juga melatih rasa percaya diri dan kerja sama tim bersama teman sekelas. Terus semangat berprestasi, ananda hebat! 👏🎉`;
      }

      setGeneratedCaption(result);
      setIsGenerating(false);
    }, 900);
  };

  const handleOpenPhoto = (item: GalleryItem, index = 0) => {
    setSelectedPhotoItem(item);
    setActivePhotoIndex(index);
  };

  const currentPhotos = selectedPhotoItem?.photos && selectedPhotoItem.photos.length > 0
    ? selectedPhotoItem.photos
    : selectedPhotoItem
    ? [selectedPhotoItem.image_url]
    : [];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Keterangan & Tombol AI Generator Deskripsi */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black">
              <Images className="w-3.5 h-3.5" />
              <span>Dokumentasi Kegiatan & Karya Kelas</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-950">
              Galeri Karya & Foto Kegiatan
            </h3>
            <p className="text-sm text-amber-900 max-w-xl">
              Lihat foto-foto seru ananda saat kegiatan kelas (seperti Cooking Class dengan 10 foto)
              serta lembar kerja tulisan tangan.
            </p>
          </div>

          {/* Tombol AI Generator Deskripsi Kegiatan */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-md transition-all active:scale-95 shrink-0 border border-amber-300"
          >
            <Wand2 className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>✨ AI Buat Deskripsi Kegiatan</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Album / Foto Kegiatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const photoCount = item.photos?.length || 1;

          return (
            <div
              key={item.id}
              onClick={() => handleOpenPhoto(item, 0)}
              className="group bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xs hover:border-blue-900 transition-all cursor-pointer flex flex-col"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenPhoto(item, 0);
                }
              }}
            >
              {/* Wadah Gambar */}
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Badge Kategori */}
                <div className="absolute top-3 left-3 bg-blue-950/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                  {item.category}
                </div>

                {/* Badge Jumlah Foto (misal 10 Foto di Cooking Class) */}
                {photoCount > 1 && (
                  <div className="absolute top-3 right-3 bg-amber-400 text-blue-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Images className="w-3.5 h-3.5" />
                    <span>{photoCount} Foto</span>
                  </div>
                )}

                {/* Overlay Hover Icon Zoom */}
                <div className="absolute inset-0 bg-blue-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/95 text-blue-950 p-3 rounded-full shadow-lg">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Rincian Caption & Judul */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-900" />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 line-clamp-3 leading-relaxed">
                    {item.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 group-hover:underline">
                    Lihat Galeri Lengkap →
                  </span>
                  {photoCount > 1 && (
                    <span className="text-xs text-slate-400 font-semibold">
                      Album {photoCount} foto kegiatan
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Modal Tampilan Gambar Penuh & Carousel Multi-Foto */}
      {selectedPhotoItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
          onClick={() => setSelectedPhotoItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-0.5 rounded-full">
                  {selectedPhotoItem.category}
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  {selectedPhotoItem.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPhotoItem(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                aria-label="Tutup Tampilan Foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area Foto Utama dengan Panah Carousel jika > 1 Foto */}
            <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[480px]">
              <img
                src={currentPhotos[activePhotoIndex]}
                alt={`${selectedPhotoItem.title} - Foto ke-${activePhotoIndex + 1}`}
                className="max-h-[480px] w-auto max-w-full object-contain"
              />

              {/* Tombol Navigasi Carousel Kiri/Kanan */}
              {currentPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-transform active:scale-95"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-transform active:scale-95"
                    aria-label="Foto Berikutnya"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Indikator Angka Foto */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full">
                    {activePhotoIndex + 1} / {currentPhotos.length} Foto
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip jika Multi-Foto */}
            {currentPhotos.length > 1 && (
              <div className="p-3 bg-slate-100 flex items-center gap-2 overflow-x-auto">
                {currentPhotos.map((thumbUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activePhotoIndex === idx
                        ? 'border-blue-900 ring-2 ring-blue-400 scale-105'
                        : 'border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumbUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Deskripsi Kegiatan */}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <Calendar className="w-4 h-4 text-blue-900" />
                <span>Tanggal Dokumentasi: {selectedPhotoItem.date}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                {selectedPhotoItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal AI Deskripsi Generator (Sesuai Permintaan Poin 4) */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setShowAiModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-amber-400 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-950 font-black text-lg">
                <Wand2 className="w-5 h-5 text-amber-500" />
                <span>AI Generator Deskripsi Kegiatan</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Masukkan judul atau ide kegiatan (misal: <em>Cooking class memasak noodles. Murid belajar vocabulary in the kitchen</em>). AI akan menyusun deskripsi edukatif yang hangat untuk wali murid.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800">Ide / Judul Kegiatan:</label>
              <textarea
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                rows={3}
                className="w-full text-sm p-3 rounded-2xl border-2 border-slate-300 focus:border-blue-900 focus:outline-none"
                placeholder="Contoh: Cooking class memasak noodles..."
              />
            </div>

            <button
              type="button"
              disabled={isGenerating || !aiTopicInput.trim()}
              onClick={handleGenerateAiCaption}
              className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyusun Deskripsi AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Generate Deskripsi Edukatif</span>
                </>
              )}
            </button>

            {/* Hasil Teks AI */}
            {generatedCaption && (
              <div className="bg-slate-50 rounded-2xl p-4 border-2 border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Hasil Deskripsi AI:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCaption);
                      setCopiedCaption(true);
                      setTimeout(() => setCopiedCaption(false), 2000);
                    }}
                    className="text-xs font-black text-blue-900 hover:underline flex items-center gap-1"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <span>Salin Teks</span>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {generatedCaption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
