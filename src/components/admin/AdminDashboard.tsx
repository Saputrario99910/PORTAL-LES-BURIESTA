import React, { useState } from 'react';
import {
  AdminPaymentVerification,
  initialAdminPayments,
  adminStudentOptions,
  initialRecurringBillingRules,
  RecurringBillingRule,
} from '../../data/adminMockData.ts';
import { ProofModal } from './ProofModal.tsx';
import { UploadGalleryModal } from './UploadGalleryModal.tsx';
import { AttendanceModal } from './AttendanceModal.tsx';
import { BillingSettingsModal } from './BillingSettingsModal.tsx';
import { PartialPaymentModal } from './PartialPaymentModal.tsx';
import { ThemeTogglePill } from '../ThemeTogglePill.tsx';
import { syncToGoogleSheets } from '../../lib/supabase.ts';
import {
  CheckCircle2,
  Clock,
  Eye,
  PlusCircle,
  ArrowLeft,
  ShieldCheck,
  Search,
  Check,
  ClipboardCheck,
  Link2,
  Wallet,
  AlertCircle,
  TrendingUp,
  ArrowDown,
  Settings,
  Banknote,
  Percent,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToPortal: () => void;
  onNavigate?: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPortal, onNavigate }) => {
  const [payments, setPayments] = useState<AdminPaymentVerification[]>(initialAdminPayments);
  const [activeFilter, setActiveFilter] = useState<'menunggu' | 'lunas' | 'cicilan' | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedProofPayment, setSelectedProofPayment] = useState<AdminPaymentVerification | null>(null);
  const [selectedPartialPayment, setSelectedPartialPayment] = useState<AdminPaymentVerification | null>(null);
  const [showBillingModal, setShowBillingModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Billing Rules
  const [billingRules, setBillingRules] = useState<RecurringBillingRule[]>(initialRecurringBillingRules);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Verifikasi Lunas Penuh Langsung
  const handleVerifyPayment = (id: string) => {
    const targetItem = payments.find((p) => p.id === id);
    if (!targetItem) return;

    const updatedItem: AdminPaymentVerification = {
      ...targetItem,
      status: 'lunas',
      paid_amount: targetItem.amount,
      remaining_amount: 0,
      verified_at: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setPayments((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

    // Otomatis sinkronisasi ke Google Sheets
    syncToGoogleSheets('pembayaran_lunas', {
      student_name: targetItem.student_name,
      class_level: targetItem.student_class,
      period: targetItem.billing_month,
      title: targetItem.billing_title || 'SPP Bulanan',
      total_amount: targetItem.amount,
      amount: targetItem.amount,
      paid_amount: targetItem.amount,
      remaining_amount: 0,
      payment_method: targetItem.sender_bank || 'Transfer Bank',
      status: 'LUNAS',
      payment_date: new Date().toLocaleDateString('id-ID'),
    });

    showToast(`Pembayaran ${targetItem.student_name} berhasil diverifikasi Lunas.`);
  };

  // 2. Simpan Pembayaran Cicilan / Sebagian
  const handleSubmitPartialPayment = (
    paymentId: string,
    paidAmount: number,
    paymentMethod: string,
    note?: string
  ) => {
    const targetItem = payments.find((p) => p.id === paymentId);
    if (!targetItem) return;

    const currentPaid = targetItem.paid_amount || 0;
    const newTotalPaid = Math.min(targetItem.amount, currentPaid + paidAmount);
    const newRemaining = Math.max(0, targetItem.amount - newTotalPaid);
    const newStatus: 'lunas' | 'cicilan' = newRemaining === 0 ? 'lunas' : 'cicilan';

    const timestampStr = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedItem: AdminPaymentVerification = {
      ...targetItem,
      paid_amount: newTotalPaid,
      remaining_amount: newRemaining,
      status: newStatus,
      verified_at: newStatus === 'lunas' ? timestampStr : targetItem.verified_at,
      payment_history: [
        ...(targetItem.payment_history || []),
        {
          date: timestampStr,
          amount: paidAmount,
          method: paymentMethod,
          note: note || 'Pembayaran cicilan',
        },
      ],
    };

    setPayments((prev) => prev.map((item) => (item.id === paymentId ? updatedItem : item)));
    setSelectedPartialPayment(null);

    // Kirim update ke Google Sheets
    syncToGoogleSheets('pembayaran_lunas', {
      student_name: targetItem.student_name,
      class_level: targetItem.student_class,
      period: targetItem.billing_month,
      title: targetItem.billing_title || 'SPP Bulanan',
      total_amount: targetItem.amount,
      amount: paidAmount,
      paid_amount: newTotalPaid,
      remaining_amount: newRemaining,
      payment_method: paymentMethod,
      status: newStatus === 'lunas' ? 'LUNAS' : 'CICILAN',
      payment_date: timestampStr,
    });

    showToast(
      newStatus === 'lunas'
        ? `Tagihan ${targetItem.student_name} telah Lunas Penuh!`
        : `Cicilan ${formatRupiah(paidAmount)} berhasil dicatat. Sisa kekurangan: ${formatRupiah(newRemaining)}.`
    );
  };

  // 3. Simpan Pengaturan Tagihan Rutin
  const handleSaveBillingRule = (updatedRule: RecurringBillingRule) => {
    setBillingRules((prev) =>
      prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    );
    showToast(`Pengaturan tarif "${updatedRule.title}" berhasil diperbarui.`);
  };

  // 4. Generate Tagihan Bulanan ke Semua Siswa
  const handleGenerateMonthlyBills = (rule: RecurringBillingRule, targetMonth: string) => {
    const newBills: AdminPaymentVerification[] = adminStudentOptions.map((student, idx) => ({
      id: `gen_pay_${Date.now()}_${student.id}`,
      student_id: student.id,
      student_name: student.name,
      nickname: student.name.split(' ')[0],
      student_class: student.class_level,
      billing_title: rule.title,
      billing_month: targetMonth,
      billing_type: rule.billing_type,
      amount: rule.default_amount,
      paid_amount: 0,
      remaining_amount: rule.default_amount,
      upload_date: `Jatuh tempo: ${rule.due_day_of_month} ${targetMonth}`,
      proof_image_url: '',
      sender_bank: 'Menunggu Pembayaran',
      sender_account_name: '-',
      status: 'menunggu',
    }));

    setPayments((prev) => [...newBills, ...prev]);
    setShowBillingModal(false);
    showToast(`Berhasil menerbitkan ${newBills.length} tagihan ${rule.title} untuk periode ${targetMonth}!`);
  };

  // 5. Buat Tagihan Khusus / Tambahan
  const handleCreateCustomBill = (billData: {
    title: string;
    billingType: 'bulanan' | 'per_pertemuan' | 'lainnya';
    amount: number;
    billingMonth: string;
    targetStudentId: 'all' | string;
    dueDate: string;
  }) => {
    const targetStudents =
      billData.targetStudentId === 'all'
        ? adminStudentOptions
        : adminStudentOptions.filter((s) => s.id === billData.targetStudentId);

    const newBills: AdminPaymentVerification[] = targetStudents.map((student) => ({
      id: `cust_pay_${Date.now()}_${student.id}`,
      student_id: student.id,
      student_name: student.name,
      nickname: student.name.split(' ')[0],
      student_class: student.class_level,
      billing_title: billData.title,
      billing_month: billData.billingMonth,
      billing_type: billData.billingType,
      amount: billData.amount,
      paid_amount: 0,
      remaining_amount: billData.amount,
      upload_date: `Jatuh tempo: ${billData.dueDate}`,
      proof_image_url: '',
      sender_bank: 'Menunggu Pembayaran',
      sender_account_name: '-',
      status: 'menunggu',
    }));

    setPayments((prev) => [...newBills, ...prev]);
    setShowBillingModal(false);
    showToast(`Tagihan "${billData.title}" berhasil diterbitkan untuk ${newBills.length} siswa.`);
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
      item.billing_month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.billing_title && item.billing_title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const waitingCount = payments.filter((p) => p.status === 'menunggu').length;
  const verifiedCount = payments.filter((p) => p.status === 'lunas').length;
  const partialCount = payments.filter((p) => p.status === 'cicilan').length;

  // Total uang masuk riil (lunas penuh + cicilan yang sudah diterima)
  const totalReceivedIncome = payments.reduce((acc, curr) => {
    if (curr.status === 'lunas') return acc + curr.amount;
    return acc + (curr.paid_amount || 0);
  }, 0);

  // Total sisa piutang / kekurangan tagihan yang belum terbayar
  const totalUnpaidAmount = payments.reduce((acc, curr) => {
    if (curr.status === 'lunas') return acc;
    if (curr.remaining_amount !== undefined) return acc + curr.remaining_amount;
    return acc + curr.amount;
  }, 0);

  const totalBillingAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const collectionPercentage =
    totalBillingAmount > 0 ? Math.round((totalReceivedIncome / totalBillingAmount) * 100) : 0;

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
                  Rumah Belajar English · Panel Administrasi & Keuangan
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
              <span>Ringkasan Keuangan Lembaga & Arus Kas</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-md">
              Data Terkini
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kartu 1: Total Pemasukan Riil Diterima */}
            <div className="bg-white rounded-2xl border-2 border-emerald-400 p-5 shadow-xs bg-gradient-to-br from-white via-white to-emerald-50/50 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Dana Masuk Riil</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Total Pemasukan Masuk
                  </h3>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono tabular-nums tracking-tight pt-1">
                    {formatRupiah(totalReceivedIncome)}
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Wallet className="w-6 h-6 text-emerald-700" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {verifiedCount} lunas · {partialCount} cicilan
                </span>
                <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {collectionPercentage}% Terkumpul
                </span>
              </div>
            </div>

            {/* Kartu 2: Sisa Piutang / Kekurangan Belum Lunas */}
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 shadow-xs bg-gradient-to-br from-white via-white to-amber-50/50 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Belum / Sedang Dicicil</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Sisa Kekurangan / Piutang
                  </h3>
                  <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono tabular-nums tracking-tight pt-1">
                    {formatRupiah(totalUnpaidAmount)}
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-6 h-6 text-amber-700" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {waitingCount} belum bayar · {partialCount} ada sisa
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFilter('cicilan')}
                  className="font-extrabold text-amber-800 hover:text-amber-950 underline"
                >
                  Lihat Cicilan ({partialCount})
                </button>
              </div>
            </div>

            {/* Kartu 3: Pengaturan Tarif Tagihan Berulang */}
            <div className="bg-white rounded-2xl border-2 border-blue-400 p-5 shadow-xs bg-gradient-to-br from-white via-white to-blue-50/50 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs">
                    <Settings className="w-3.5 h-3.5 text-blue-700" />
                    <span>Otomatisasi Tagihan</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Tarif Tagihan Rutin
                  </h3>
                  <div className="text-lg font-black text-blue-950 tracking-tight pt-1">
                    {billingRules[0]?.title || 'SPP Reguler'}
                  </div>
                  <div className="text-xl font-black text-blue-800 font-mono">
                    {formatRupiah(billingRules[0]?.default_amount || 250000)}
                    <span className="text-xs font-semibold text-slate-600 font-sans"> / siswa</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Banknote className="w-6 h-6 text-blue-700" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Jatuh tempo: Tgl {billingRules[0]?.due_day_of_month || 10}
                </span>
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  className="font-extrabold text-blue-800 hover:text-blue-950 underline flex items-center gap-1"
                >
                  <span>Atur & Terbitkan</span>
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Baris Judul Tabel & Tombol-tombol Aksi */}
        <div id="verification-table-section" className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs scroll-mt-20">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Manajemen Tagihan & Pembayaran Siswa
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Catat pembayaran lunas, cicilan / sisa kekurangan, terbitkan tagihan baru, serta verifikasi bukti transfer.
            </p>
          </div>

          {/* Tombol Aksi Kanan Atas */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto shrink-0">
            {/* Tombol Pengaturan & Terbitkan Tagihan */}
            <button
              type="button"
              onClick={() => setShowBillingModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Atur / Terbitkan Tagihan</span>
            </button>

            {/* Tombol Upload Galeri */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Foto Kegiatan</span>
            </button>

            {/* Tombol Isi Absensi Kelas */}
            <button
              type="button"
              onClick={() => setShowAttendanceModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-200" />
              <span>Absensi Kelas</span>
            </button>
          </div>
        </div>

        {/* Area Tabel & Kontrol Filter */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Baris & Pencarian */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('semua')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                  activeFilter === 'semua'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({payments.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('menunggu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                  activeFilter === 'menunggu'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Menunggu Verifikasi</span>
                <span className="bg-amber-950 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {waitingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('cicilan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                  activeFilter === 'cicilan'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Cicilan / Sisa</span>
                <span className="bg-purple-950 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {partialCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('lunas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                  activeFilter === 'lunas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Sudah Lunas</span>
                <span className="bg-emerald-950 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {verifiedCount}
                </span>
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa, bulan, atau jenis tagihan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Tabel Desktop */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] sm:text-xs font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Jenis Tagihan & Periode</th>
                  <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                  <th className="py-3.5 px-4 text-right">Sudah Dibayar</th>
                  <th className="py-3.5 px-4 text-right">Sisa Kekurangan</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center min-w-[280px]">Aksi & Pencatatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm font-medium text-slate-800">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                      Tidak ada data tagihan yang sesuai dengan filter atau kata kunci.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((item) => {
                    const paid = item.paid_amount || (item.status === 'lunas' ? item.amount : 0);
                    const remaining =
                      item.remaining_amount !== undefined
                        ? item.remaining_amount
                        : item.status === 'lunas'
                        ? 0
                        : item.amount;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Nama Siswa */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm">
                            {item.student_name}
                          </div>
                          <div className="text-xs text-slate-500 font-semibold">
                            {item.student_class}
                          </div>
                        </td>

                        {/* Jenis Tagihan & Periode */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-950 block">
                            {item.billing_title || 'SPP Reguler'}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            Periode: {item.billing_month}
                          </span>
                        </td>

                        {/* Total Tagihan */}
                        <td className="py-3.5 px-4 text-right font-black font-mono tabular-nums text-slate-900 text-sm">
                          {formatRupiah(item.amount)}
                        </td>

                        {/* Sudah Dibayar */}
                        <td className="py-3.5 px-4 text-right font-bold font-mono tabular-nums text-emerald-700 text-sm">
                          {formatRupiah(paid)}
                        </td>

                        {/* Sisa Kekurangan */}
                        <td className="py-3.5 px-4 text-right font-black font-mono tabular-nums text-sm">
                          {remaining > 0 ? (
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {formatRupiah(remaining)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">Rp 0 (Lunas)</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {item.status === 'lunas' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Lunas</span>
                            </span>
                          ) : item.status === 'cicilan' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-xs">
                              <Percent className="w-3.5 h-3.5" />
                              <span>Cicilan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Menunggu</span>
                            </span>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Tombol Lihat Bukti (jika ada) */}
                            {item.proof_image_url && (
                              <button
                                type="button"
                                onClick={() => setSelectedProofPayment(item)}
                                className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs border border-blue-300 flex items-center gap-1 shadow-2xs transition-colors"
                                title="Buka bukti transfer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-800" />
                                <span>Bukti</span>
                              </button>
                            )}

                            {/* Tombol Bayar Cicilan / Input Nominal */}
                            {item.status !== 'lunas' && (
                              <button
                                type="button"
                                onClick={() => setSelectedPartialPayment(item)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                                title="Catat pembayaran cicilan atau sebagian"
                              >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Bayar Cicilan</span>
                              </button>
                            )}

                            {/* Tombol Verifikasi / Tandai Lunas Penuh */}
                            {item.status !== 'lunas' ? (
                              <button
                                type="button"
                                onClick={() => handleVerifyPayment(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                                title="Tandai langsung Lunas Penuh"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Lunas Penuh</span>
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-emerald-700 py-1 px-1.5">
                                ✓ Lunas
                              </span>
                            )}

                            {/* Tombol Link Wali */}
                            <button
                              type="button"
                              onClick={() => handleCopyParentLink(item)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1 transition-all active:scale-95"
                              title="Salin link portal wali murid"
                            >
                              <Link2 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Link</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Tabel */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
            <span>
              Menampilkan {filteredPayments.length} dari {payments.length} tagihan & transaksi
            </span>
            <span>Rumah Belajar English · Sistem Keuangan & Tagihan Terpadu</span>
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

      {/* Modal 2: Catat Pembayaran Cicilan / Sebagian */}
      {selectedPartialPayment && (
        <PartialPaymentModal
          payment={selectedPartialPayment}
          onClose={() => setSelectedPartialPayment(null)}
          onSubmitPayment={handleSubmitPartialPayment}
        />
      )}

      {/* Modal 3: Pengaturan Tarif Rutin & Terbitkan Tagihan Baru */}
      {showBillingModal && (
        <BillingSettingsModal
          rules={billingRules}
          students={adminStudentOptions}
          onClose={() => setShowBillingModal(false)}
          onSaveRule={handleSaveBillingRule}
          onGenerateMonthlyBills={handleGenerateMonthlyBills}
          onCreateCustomBill={handleCreateCustomBill}
        />
      )}

      {/* Modal 4: Upload Foto Kegiatan Galeri */}
      {showUploadModal && (
        <UploadGalleryModal
          students={adminStudentOptions}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Modal 5: Isi Absensi Kelas */}
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
