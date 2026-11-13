import React, { useState } from 'react';
import {
  AdminPaymentVerification,
  initialAdminPayments,
  adminStudentOptions,
} from '../../data/adminMockData.ts';
import { ProofModal } from './ProofModal.tsx';
import { UploadGalleryModal } from './UploadGalleryModal.tsx';
import { AttendanceModal } from './AttendanceModal.tsx';
import { ThemeTogglePill } from '../ThemeTogglePill.tsx';
import {
  CheckCircle2,
  Clock,
  Eye,
  PlusCircle,
  ArrowLeft,
  ShieldCheck,
  Search,
  Check,
  DollarSign,
  ClipboardCheck,
  Link2,
  Wallet,
  AlertCircle,
  TrendingUp,
  ArrowDown,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToPortal: () => void;
  onNavigate?: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPortal, onNavigate }) => {
  const [payments, setPayments] = useState<AdminPaymentVerification[]>(initialAdminPayments);
  const [activeFilter, setActiveFilter] = useState<'menunggu' | 'lunas' | 'semua'>('menunggu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProofPayment, setSelectedProofPayment] = useState<AdminPaymentVerification | null>(
    null
  );
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleVerifyPayment = (id: string) => {
    setPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'lunas',
              verified_at: new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : item
      )
    );
    showToast('Pembayaran berhasil diverifikasi menjadi Lunas.');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyParentLink = (item: AdminPaymentVerification) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const token =
      item.student_id === 'std_01'
        ? 'kenzo-404'
        : item.student_id === 'std_02'
        ? 'nadira-202'
        : item.id;
    const pin = '123456';
    const text = `Link Portal Wali Murid Rumah Belajar English:\n${origin}/?token=${token}\nPIN Akses: ${pin}`;
    navigator.clipboard.writeText(text);
    showToast(`Link akses dan PIN untuk wali ${item.student_name} berhasil disalin ke clipboard`);
  };

  const handleUploadSuccess = (data: {
    studentId: string;
    studentName: string;
    caption: string;
    imageUrl: string;
  }) => {
    setShowUploadModal(false);
    showToast(`Foto berhasil diunggah untuk siswa ${data.studentName}.`);
  };

  // Filter pembayaran
  const filteredPayments = payments.filter((item) => {
    const matchFilter =
      activeFilter === 'semua' ? true : item.status === activeFilter;
    const matchSearch =
      item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.billing_month.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const waitingCount = payments.filter((p) => p.status === 'menunggu').length;
  const verifiedCount = payments.filter((p) => p.status === 'lunas').length;

  // Total pemasukan bulan ini (berdasarkan status 'Lunas')
  const totalPaidIncome = payments
    .filter((p) => p.status === 'lunas')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total nominal tagihan yang tertunda
  const totalPendingAmount = payments
    .filter((p) => p.status === 'menunggu')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBillingAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const collectionPercentage =
    totalBillingAmount > 0 ? Math.round((totalPaidIncome / totalBillingAmount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Top Bar Admin Desktop Lebar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b-2 border-emerald-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Portal Wali</span>
            </button>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base">
                A
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black leading-tight">
                  Dashboard Pemilik Lembaga
                </h1>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Rumah Belajar English · Panel Administrasi
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info & Tombol Navigasi Tutor & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeTogglePill />

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/tutor')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-700 transition-all active:scale-95 shadow-xs"
                title="Pindah ke Dashboard Tutor (/tutor)"
              >
                <span>Mode Tutor</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Miss Sarah (Admin Utama)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Konten Utama Desktop (Lebar & Terstruktur) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* KARTU RINGKASAN DI BAGIAN ATAS HALAMAN */}
        <section aria-label="Ringkasan Pemasukan dan Tagihan Tertunda" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Ringkasan Keuangan Lembaga (Bulan Ini)</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-md">
              Periode: November 2024
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kartu 1: Total Pemasukan Bulan Ini (Status 'Lunas') */}
            <div className="bg-white rounded-2xl border-2 border-emerald-400 p-5 sm:p-6 shadow-xs bg-gradient-to-br from-white via-white to-emerald-50/50 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Status: Lunas Terverifikasi</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Total Pemasukan Bulan Ini
                  </h3>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono tabular-nums tracking-tight pt-1">
                    {formatRupiah(totalPaidIncome)}
                  </div>
                </div>

                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700" />
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">
                  Telah diverifikasi: <strong className="text-emerald-950 font-black">{verifiedCount}</strong> dari {payments.length} siswa
                </span>
                <span className="font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md">
                  {collectionPercentage}% Terverifikasi
                </span>
              </div>
            </div>

            {/* Kartu 2: Jumlah Tagihan yang Tertunda */}
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 sm:p-6 shadow-xs bg-gradient-to-br from-white via-white to-amber-50/50 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Menunggu Verifikasi</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Jumlah Tagihan Tertunda
                  </h3>
                  <div className="text-3xl sm:text-4xl font-black text-amber-900 font-mono tabular-nums tracking-tight pt-1">
                    {waitingCount}{' '}
                    <span className="text-xl sm:text-2xl font-bold font-sans text-amber-950">
                      Tagihan Siswa
                    </span>
                  </div>
                </div>

                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700" />
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">
                  Total nominal tertunda:{' '}
                  <strong className="text-amber-950 font-black font-mono">
                    {formatRupiah(totalPendingAmount)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('menunggu');
                    const tableEl = document.getElementById('verification-table-section');
                    if (tableEl) {
                      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="font-extrabold text-amber-800 hover:text-amber-950 hover:underline inline-flex items-center gap-1"
                >
                  <span>Filter Menunggu ({waitingCount})</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Baris Judul Tabel & Tombol Upload Galeri + Isi Absensi di Kanan Atas */}
        <div id="verification-table-section" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs scroll-mt-20">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Menunggu Verifikasi Pembayaran
              </h2>
            </div>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Periksa dan validasi bukti transfer iuran SPP siswa sebelum diperbarui otomatis ke portal wali.
            </p>
          </div>

          {/* Tombol Aksi Kanan Atas: Upload Galeri & Isi Absensi Kelas (Menumpuk Rapi) */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
            {/* 1. Tombol Upload Galeri */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <span>Upload Foto Kegiatan</span>
            </button>

            {/* 2. Tombol Isi Absensi Kelas (Di Bawah Tombol Upload Galeri) */}
            <button
              type="button"
              onClick={() => setShowAttendanceModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95"
            >
              <ClipboardCheck className="w-5 h-5 text-emerald-200" />
              <span>Isi Absensi Kelas</span>
            </button>
          </div>
        </div>

        {/* Area Tabel & Kontrol Filter */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Baris & Pencarian */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('menunggu')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-1.5 ${
                  activeFilter === 'menunggu'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Menunggu Verifikasi</span>
                <span className="bg-amber-950 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {waitingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('lunas')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-1.5 ${
                  activeFilter === 'lunas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Sudah Lunas</span>
                <span className="bg-emerald-950 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {verifiedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('semua')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors ${
                  activeFilter === 'semua'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({payments.length})
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa atau bulan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Tabel Desktop Bersih & Rapi */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] sm:text-xs font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Bulan Tagihan</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4">Tanggal Upload</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center min-w-[260px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm font-medium text-slate-800">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                      Tidak ada data pembayaran yang sesuai dengan filter atau kata kunci.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Nama Siswa */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {item.student_name}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          Panggilan: <span className="text-blue-900">{item.nickname}</span>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {item.student_class}
                        </span>
                      </td>

                      {/* Bulan Tagihan */}
                      <td className="py-3.5 px-4 font-bold text-blue-950">
                        {item.billing_month}
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-4 text-right font-black font-mono tabular-nums text-slate-900 text-base">
                        {formatRupiah(item.amount)}
                      </td>

                      {/* Tanggal Upload */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {item.upload_date}
                        <div className="text-[11px] text-slate-400 font-normal">
                          {item.sender_bank}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Lunas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>

                      {/* Kolom Aksi: Lihat Bukti, Verifikasi (Hijau), dan Link Wali */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Tombol 1: Lihat Bukti */}
                          <button
                            type="button"
                            onClick={() => setSelectedProofPayment(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs border border-blue-300 flex items-center gap-1 shadow-2xs transition-colors"
                            title="Buka gambar bukti transfer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-800" />
                            <span>Lihat Bukti</span>
                          </button>

                          {/* Tombol 2: Verifikasi (Warna Hijau) */}
                          {item.status === 'menunggu' ? (
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
                              title="Tandai pembayaran sebagai Lunas"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verifikasi</span>
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 py-1.5 px-1.5">
                              ✓ Terverifikasi
                            </span>
                          )}

                          {/* Tombol 3: Link Wali (Di sebelah tombol Verifikasi) */}
                          <button
                            type="button"
                            onClick={() => handleCopyParentLink(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1 transition-all active:scale-95"
                            title="Salin tautan dan PIN unik wali murid"
                          >
                            <Link2 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Link Wali</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Tabel */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Menampilkan {filteredPayments.length} dari {payments.length} transaksi pembayaran
            </span>
            <span>Rumah Belajar English · Sistem Pembayaran Mandiri</span>
          </div>
        </div>
      </main>

      {/* Modal 1: Lihat Bukti Transfer */}
      {selectedProofPayment && (
        <ProofModal
          payment={selectedProofPayment}
          onClose={() => setSelectedProofPayment(null)}
          onVerify={handleVerifyPayment}
        />
      )}

      {/* Modal 2: Upload Foto Kegiatan Galeri */}
      {showUploadModal && (
        <UploadGalleryModal
          students={adminStudentOptions}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Modal 3: Isi Absensi Kelas */}
      {showAttendanceModal && (
        <AttendanceModal
          onClose={() => setShowAttendanceModal(false)}
          onSuccess={() => {
            setShowAttendanceModal(false);
            showToast('Absensi berhasil disimpan');
          }}
        />
      )}

      {/* Notifikasi Toast Mengambang */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
