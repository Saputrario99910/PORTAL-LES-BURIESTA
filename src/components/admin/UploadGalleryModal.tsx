import React, { useState } from 'react';
import { AdminStudentOption } from '../../data/adminMockData.ts';
import { X, Upload, Image, Check, User, FileText } from 'lucide-react';

interface UploadGalleryModalProps {
  students: AdminStudentOption[];
  onClose: () => void;
  onSuccess: (data: { studentId: string; studentName: string; caption: string; imageUrl: string }) => void;
}

export const UploadGalleryModal: React.FC<UploadGalleryModalProps> = ({
  students,
  onClose,
  onSuccess,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [caption, setCaption] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Silakan pilih nama siswa terlebih dahulu.');
      return;
    }
    if (!caption.trim()) {
      setError('Silakan isi teks caption atau catatan kegiatan.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);

    onSuccess({
      studentId: selectedStudentId,
      studentName: student ? student.name : 'Siswa',
      caption: caption.trim(),
      imageUrl:
        imagePreview ||
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-slate-200 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <Image className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Upload Foto Kegiatan
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Dokumentasikan aktivitas kelas & karya siswa
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Modal */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs sm:text-sm font-bold">
              {error}
            </div>
          )}

          {/* 1. Dropdown Pilih Nama Siswa */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-800" />
              Pilih Nama Siswa:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.class_level})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Input File Gambar */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-blue-800" />
              Pilih File Foto Gambar:
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-2xl p-4 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="text-center">
                  <img
                    src={imagePreview}
                    alt="Preview unggahan"
                    className="w-40 h-28 object-cover mx-auto rounded-xl border border-slate-300 shadow-xs mb-2"
                  />
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                    Ganti Foto (Ketuk di sini)
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-1.5 py-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-slate-800 block">
                    Pilih File Foto dari Komputer
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Format JPG, PNG, atau WEBP
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* 3. Input Teks Caption */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-800" />
              Teks Keterangan / Caption:
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Contoh: Ananda sangat berani maju presentasi tugas 'My Family' dengan pelafalan bahasa Inggris yang sangat jelas."
              className="w-full p-3 rounded-xl border-2 border-slate-300 text-slate-900 font-medium text-sm focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Tombol Simpan */}
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
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>Simpan Foto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
