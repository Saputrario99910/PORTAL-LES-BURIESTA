import React, { useState } from 'react';
import {
  AdminPaymentVerification,
  initialAdminPayments,
  adminStudentOptions,
  initialRecurringBillingRules,
  RecurringBillingRule,
} from '../../data/adminMockData.ts';
import { teachingClassesData, TeachingClass } from '../../data/teachingClassesData.ts';
import { InvoiceLineItem } from '../../types/index.ts';
import { ProofModal } from './ProofModal.tsx';
import { UploadGalleryModal } from './UploadGalleryModal.tsx';
import { AttendanceModal } from './AttendanceModal.tsx';
import { ClassSessionModal } from './ClassSessionModal.tsx';
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
  Settings,
  Banknote,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToPortal: () => void;
  onNavigate?: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPortal }) => {
  const [payments, setPayments] = useState<AdminPaymentVerification[]>(initialAdminPayments);
  const [activeFilter, setActiveFilter] = useState<'menunggu' | 'lunas' | 'cicilan' | 'semua'>('semua');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedProofPayment, setSelectedProofPayment] = useState<AdminPaymentVerification | null>(null);
  const [selectedPartialPayment, setSelectedPartialPayment] = useState<AdminPaymentVerification | null>(null);
  const [showBillingModal, setShowBillingModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  
  // Modal Khusus Sesi Mengajar & Penilaian Per Kelas
  const [selectedTeachingClass, setSelectedTeachingClass] = useState<TeachingClass | null>(null);
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
    }, 4000);
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
      payment_date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });

    showToast(`Pembayaran ${targetItem.student_name} (${targetItem.billing_month}) berhasil diverifikasi Lunas!`);
  };

  // 2. Simpan Pembayaran Cicilan / Angsuran Baru
  const handleSavePartialPayment = (
    paymentId: string,
    paidAmount: number,
    paymentMethod: string,
    note?: string
  ) => {
    const targetItem = payments.find((p) => p.id === paymentId);
    if (!targetItem) return;

    const currentPaid = targetItem.paid_amount || 0;
    const newTotalPaid = currentPaid + paidAmount;
    const newRemaining = Math.max(0, targetItem.amount - newTotalPaid);
    const newStatus = newRemaining === 0 ? 'lunas' : 'cicilan';
    const todayDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const updatedItem: AdminPaymentVerification = {
      ...targetItem,
      status: newStatus,
      paid_amount: newTotalPaid,
      remaining_amount: newRemaining,
      verified_at: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      payment_history: [
        ...(targetItem.payment_history || []),
        {
          date: todayDate,
          amount: paidAmount,
          method: paymentMethod,
          note: note || 'Cicilan SPP',
        },
      ],
    };

    setPayments((prev) => prev.map((item) => (item.id === paymentId ? updatedItem : item)));
    setSelectedPartialPayment(null);

    // Kirim pencatatan cicilan ke Google Sheets
    syncToGoogleSheets('catat_pembayaran', {
      student_name: targetItem.student_name,
      class_level: targetItem.student_class,
      period: targetItem.billing_month,
      title: targetItem.billing_title || 'SPP Bulanan',
      total_amount: targetItem.amount,
      amount: paidAmount,
      paid_amount: newTotalPaid,
      remaining_amount: newRemaining,
      status: newStatus,
      payment_method: paymentMethod + (note ? ` (${note})` : ''),
      payment_date: todayDate,
    });

    showToast(
      `Pembayaran Rp ${paidAmount.toLocaleString('id-ID')} untuk ${targetItem.student_name} tersimpan. Sisa piutang: ${formatRupiah(newRemaining)}.`
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
    const newBills: AdminPaymentVerification[] = adminStudentOptions.map((student) => ({
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

  // 5. Buat Tagihan Khusus / Tambahan Dinamis (Line Items)
  const handleCreateCustomBill = (billData: {
    title: string;
    billingType: 'bulanan' | 'per_pertemuan' | 'lainnya';
    amount: number;
    billingMonth: string;
    targetStudentId: 'all' | string;
    dueDate: string;
    lineItems?: InvoiceLineItem[];
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
      total_amount: billData.amount,
      paid_amount: 0,
      remaining_amount: billData.amount,
      line_items: billData.lineItems || [],
      upload_date: `Jatuh tempo: ${billData.dueDate}`,
      proof_image_url: '',
      sender_bank: 'Menunggu Pembayaran',
      sender_account_name: '-',
      status: 'menunggu',
    }));

    setPayments((prev) => [...newBills, ...prev]);
    setShowBillingModal(false);
    showToast(
      `Tagihan "${billData.title}" (${billData.lineItems?.length || 1} item) berhasil diterbitkan untuk ${newBills.length} siswa.`
    );
  };

  const handleCopyParentLink = (item: AdminPaymentVerification) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const token =
      item.student_id === 'std_01'
        ? 'kenzo-404'
        : item.student_id === 'std_02'
        ? 'nadira-202'
        : `${item.student_id}-token`;

    const fullUrl = `${origin}/?token=${token}`;
    const defaultPin = item.student_id === 'std_01' ? '123456' : '654321';

    const textToCopy = `Link Portal Wali Murid Rumah Belajar English:\nNama: ${item.student_name}\nLink: ${fullUrl}\nPIN Masuk: ${defaultPin}`;

    navigator.clipboard.writeText(textToCopy);
    showToast(`Link akses & PIN untuk wali ${item.student_name} berhasil disalin!`);
  };

  // Filter Data Pembayaran (Mendukung Filter per Rombel Kelas & Filter Status)
  const filteredPayments = payments.filter((item) => {
    const matchesFilter =
      activeFilter === 'semua' ? true : item.status === activeFilter;
    const matchesClass =
      selectedClassFilter === 'all'
        ? true
        : item.class_name === selectedClassFilter || item.student_class.includes(selectedClassFilter);
    const matchesSearch =
      item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.class_name && item.class_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.billing_month.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesClass && matchesSearch;
  });

  // Kalkulasi Keuangan
  const verifiedCount = payments.filter((p) => p.status === 'lunas').length;
  const partialCount = payments.filter((p) => p.status === 'cicilan').length;
  const waitingCount = payments.filter((p) => p.status === 'menunggu').length;

  const totalReceivedIncome = payments.reduce((acc, curr) => {
    if (curr.status === 'lunas') return acc + curr.amount;
    if (curr.status === 'cicilan') return acc + (curr.paid_amount || 0);
    return acc;
  }, 0);

  const totalUnpaidAmount = payments.reduce((acc, curr) => {
    if (curr.status === 'menunggu') return acc + curr.amount;
    if (curr.status === 'cicilan') return acc + (curr.remaining_amount || 0);
    return acc;
  }, 0);

  const totalBilled = totalReceivedIncome + totalUnpaidAmount;
  const collectionPercentage = totalBilled > 0 ? Math.round((totalReceivedIncome / totalBilled) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Header Top Bar */}
      <header className="sticky top-0 z-30 bg-blue-950 text-white border-b-2 border-amber-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPortal}
              className="w-10 h-10 rounded-xl bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center transition-colors border border-blue-700 shadow-xs"
              title="Lihat Tampilan Portal Wali Murid"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Dashboard Pemilik Lembaga (Admin & Tutor)
                </h1>
                <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  All-in-One
                </span>
              </div>
              <span className="text-xs text-blue-200 block font-medium">
                Rumah Belajar English · Kelola Kelas, Absensi, Nilai & Keuangan SPP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ThemeTogglePill />
            <div className="bg-blue-900/90 text-slate-200 border border-blue-700/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Miss Sarah (Pemilik & Tutor)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-7">
        
        {/* BAGIAN 1: KOTAK-KOTAK KELAS MENGAJAR (ALL-IN-ONE TUTOR & ABSENSI/NILAI) */}
        <section aria-label="Kelola Kelas Mengajar">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-900" />
                <span>Kelas Pembelajaran Anda (Pilih Kelas untuk Absensi & Nilai)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Pilih kelas yang akan diajar. Anda bisa langsung mencatat absensi dan mengisi nilai tugas/test (opsional) yang otomatis tersimpan rapi per nomor pertemuan di Google Sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Upload Foto Kegiatan</span>
            </button>
          </div>

          {/* Grid 4 Kotak Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachingClassesData.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-900 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                      {cls.room}
                    </span>
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.students_count} Siswa</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5 line-clamp-1">
                      {cls.level}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs font-medium text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-900" />
                      <span>{cls.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kurikulum: {cls.total_meetings} Pertemuan</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Masuk Kelas */}
                <div className="pt-4 mt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTeachingClass(cls)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <ClipboardCheck className="w-4 h-4 text-amber-300" />
                    <span>Buka & Isi Absensi/Nilai</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BAGIAN 2: RINGKASAN KEUANGAN LEMBAGA */}
        <section aria-label="Ringkasan Pemasukan dan Tagihan Tertunda" className="space-y-2.5 pt-2">
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
                  className="font-extrabold text-amber-900 hover:text-amber-950 underline"
                >
                  Filter Cicilan →
                </button>
              </div>
            </div>

            {/* Kartu 3: Pengaturan Tarif Tagihan Lembaga */}
            <div className="bg-white rounded-2xl border-2 border-blue-300 p-5 shadow-xs bg-gradient-to-br from-white via-white to-blue-50/50 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs">
                    <Settings className="w-3.5 h-3.5 text-blue-700" />
                    <span>Tarif SPP Standar</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
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

        {/* BAGIAN 3: MANAJEMEN PEMBAYARAN SISWA */}
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

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowBillingModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Atur / Terbitkan Tagihan</span>
            </button>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Rombel Kelas */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-black text-slate-500 uppercase px-2">Kelas:</span>
              <button
                type="button"
                onClick={() => setSelectedClassFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-black text-xs transition-all ${
                  selectedClassFilter === 'all'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              {teachingClassesData.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls.name)}
                  className={`px-2.5 py-1 rounded-lg font-black text-xs transition-all ${
                    selectedClassFilter === cls.name
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>

            {/* Filter Status Tagihan */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('semua')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeFilter === 'semua'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Status ({payments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('menunggu')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                  activeFilter === 'menunggu'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Menunggu ({waitingCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('cicilan')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                  activeFilter === 'cicilan'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cicilan ({partialCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('lunas')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                  activeFilter === 'lunas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lunas ({verifiedCount})</span>
              </button>
            </div>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa atau bulan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        {/* Tabel Data Pembayaran */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 font-black">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Tagihan & Periode</th>
                  <th className="py-3 px-4">Total & Terbayar</th>
                  <th className="py-3 px-4">Sisa Tagihan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredPayments.map((item) => {
                  const remaining = item.remaining_amount !== undefined ? item.remaining_amount : item.amount;
                  const paid = item.paid_amount || 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {item.student_name}
                      </td>
                      <td className="py-3 px-4">
                        {item.class_name && (
                          <span className="inline-block text-[11px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md mb-0.5">
                            {item.class_name}
                          </span>
                        )}
                        <div className="text-xs text-slate-600 font-semibold">{item.student_class}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-blue-950 block">
                          {item.billing_title || 'SPP Reguler'}
                        </span>
                        <span className="text-xs text-slate-500">{item.billing_month}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900">{formatRupiah(item.amount)}</div>
                        {paid > 0 && (
                          <span className="text-xs text-emerald-700 font-bold">
                            Masuk: {formatRupiah(paid)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {remaining > 0 ? (
                          <span className="font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            {formatRupiah(remaining)}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-extrabold">Rp 0 (Lunas)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === 'lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Lunas
                          </span>
                        ) : item.status === 'cicilan' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-950 font-extrabold text-xs">
                            <Banknote className="w-3.5 h-3.5 text-blue-700" />
                            Cicilan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 font-extrabold text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.proof_image_url && (
                            <button
                              type="button"
                              onClick={() => setSelectedProofPayment(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                              title="Lihat Bukti Transfer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {item.status !== 'lunas' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedPartialPayment(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-extrabold text-xs"
                                title="Catat Cicilan / Angsuran"
                              >
                                Cicil
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVerifyPayment(item.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-2xs"
                                title="Verifikasi Lunas Penuh"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Lunas</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyParentLink(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-900 font-bold"
                            title="Salin Link & PIN Wali Murid"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Sesi Mengajar & Penilaian Per Kelas */}
      {selectedTeachingClass && (
        <ClassSessionModal
          teachingClass={selectedTeachingClass}
          onClose={() => setSelectedTeachingClass(null)}
          onSuccess={(msg) => {
            setSelectedTeachingClass(null);
            showToast(msg);
          }}
        />
      )}

      {/* Modal Bukti Transfer */}
      {selectedProofPayment && (
        <ProofModal
          payment={selectedProofPayment}
          onClose={() => setSelectedProofPayment(null)}
          onVerify={(id) => {
            handleVerifyPayment(id);
            setSelectedProofPayment(null);
          }}
        />
      )}

      {/* Modal Catat Cicilan */}
      {selectedPartialPayment && (
        <PartialPaymentModal
          payment={selectedPartialPayment}
          onClose={() => setSelectedPartialPayment(null)}
          onSubmitPayment={handleSavePartialPayment}
        />
      )}

      {/* Modal Pengaturan & Terbitkan Tagihan */}
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

      {/* Modal Upload Galeri Kegiatan */}
      {showUploadModal && (
        <UploadGalleryModal
          students={adminStudentOptions}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            showToast('Foto dokumentasi kegiatan kelas berhasil diunggah!');
          }}
        />
      )}

      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
