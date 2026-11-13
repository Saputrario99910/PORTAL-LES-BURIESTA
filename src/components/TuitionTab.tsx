import React, { useState } from 'react';
import { TuitionRecord, TuitionStatus, Student, BankAccount } from '../types/index.ts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Upload,
  MessageCircle,
  CreditCard,
  QrCode,
  FileText,
  X,
  HelpCircle,
  Banknote,
} from 'lucide-react';

interface TuitionTabProps {
  student: Student;
  records: TuitionRecord[];
  bankAccounts: BankAccount[];
  onUpdateRecord: (updated: TuitionRecord) => void;
}

export const TuitionTab: React.FC<TuitionTabProps> = ({
  student,
  records,
  bankAccounts,
  onUpdateRecord,
}) => {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedRecordForPayment, setSelectedRecordForPayment] = useState<TuitionRecord | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string>('');

  // State untuk modal konfirmasi "Sudah Membayar (Cash / Transfer Langsung)"
  const [showDirectPayModal, setShowDirectPayModal] = useState<boolean>(false);
  const [directPayRecord, setDirectPayRecord] = useState<TuitionRecord | null>(null);
  const [paymentTypeChosen, setPaymentTypeChosen] = useState<'cash' | 'transfer'>('cash');

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopyAccountNumber = (accountNumber: string, bankName: string) => {
    const cleanNumber = accountNumber.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(cleanNumber || accountNumber);
    setCopiedBank(bankName);
    setTimeout(() => {
      setCopiedBank(null);
    }, 2500);
  };

  const renderBadge = (status: TuitionStatus) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-extrabold text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            <span>LUNAS</span>
          </span>
        );
      case 'cicilan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 border-2 border-purple-500 text-purple-950 font-extrabold text-xs sm:text-sm">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
            <span>CICILAN / SEBAGIAN</span>
          </span>
        );
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 border-2 border-amber-500 text-amber-950 font-extrabold text-xs sm:text-sm">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            <span>MENUNGGU VERIFIKASI</span>
          </span>
        );
      case 'belum':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 border-2 border-rose-500 text-rose-950 font-extrabold text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-700" />
            <span>BELUM DIBAYAR</span>
          </span>
        );
    }
  };

  const openPaymentModal = (record: TuitionRecord) => {
    setSelectedRecordForPayment(record);
    setUploadedFile(record.proof_url || null);
    setSenderName('');
    setShowPaymentModal(true);
    setPaymentSuccessMessage('');
  };

  // Buka modal khusus "Sudah Membayar" (Cash / Transfer Langsung)
  const openDirectPayModal = (record: TuitionRecord) => {
    setDirectPayRecord(record);
    setShowDirectPayModal(true);
  };

  const handleConfirmDirectPayment = () => {
    if (!directPayRecord) return;

    const todayDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const updated: TuitionRecord = {
      ...directPayRecord,
      status: 'menunggu', // Wali murid menandai sudah membayar, masuk verifikasi admin/tutor
      payment_date: todayDate,
      payment_method:
        paymentTypeChosen === 'cash'
          ? 'Tunai / Cash Langsung di Lembaga'
          : 'Transfer Langsung ke Rekening SPP',
    };

    onUpdateRecord(updated);
    setShowDirectPayModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = () => {
    if (!selectedRecordForPayment) return;

    const updated: TuitionRecord = {
      ...selectedRecordForPayment,
      status: 'menunggu',
      proof_url: uploadedFile || 'uploaded_proof_placeholder.jpg',
      payment_date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      payment_method: 'Transfer Bank (Bukti Terunggah)',
    };

    onUpdateRecord(updated);
    setPaymentSuccessMessage(
      `Terima kasih! Bukti transfer untuk iuran ${selectedRecordForPayment.period} berhasil tersimpan dan akan diverifikasi pengajar.`
    );
  };

  const handleSendWhatsAppNotification = (record: TuitionRecord) => {
    const message = encodeURIComponent(
      `Halo Miss Sarah, saya wali dari ${student.name} (${student.nickname}).\n\nSaya sudah melakukan pembayaran iuran les bahasa Inggris untuk periode *${record.period}* sebesar *${formatRupiah(
        record.amount
      )}*.\n\nMohon konfirmasi dan verifikasinya ya Miss. Terima kasih!`
    );
    window.open(`https://wa.me/${student.teacher_whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Keterangan Tab */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
        <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
          Status Iuran / SPP Les (3 Bulan Terakhir)
        </h3>
        <p className="text-sm sm:text-base text-emerald-900 mt-1">
          Pantau riwayat pembayaran iuran ananda secara transparan. Anda dapat membayar via transfer bank, QRIS, atau bayar langsung secara tunai di tempat.
        </p>
      </div>

      {/* Kartu Status 3 Bulan */}
      <div className="space-y-3.5">
        {records.map((rec) => {
          const isCicilan = rec.status === 'cicilan';
          const paid = rec.paid_amount || (rec.status === 'lunas' ? rec.amount : 0);
          const remaining =
            rec.remaining_amount !== undefined
              ? rec.remaining_amount
              : rec.status === 'lunas'
              ? 0
              : rec.amount - paid;

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
                rec.status === 'belum'
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : rec.status === 'cicilan'
                  ? 'border-purple-300 ring-2 ring-purple-100'
                  : rec.status === 'menunggu'
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {rec.title || 'SPP Reguler'}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900">{rec.period}</h4>
                </div>
                <div className="self-start sm:self-auto">{renderBadge(rec.status)}</div>
              </div>

              {/* Rincian Pembayaran & Cicilan jika ada */}
              {isCicilan && (
                <div className="mt-3 p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-purple-900 font-semibold block">
                      Sudah Terbayar:{' '}
                      <strong className="text-purple-950 font-mono font-bold">
                        {formatRupiah(paid)}
                      </strong>{' '}
                      dari total {formatRupiah(rec.amount)}
                    </span>
                    {rec.notes && (
                      <span className="text-[11px] text-purple-700 italic block mt-0.5">
                        Catatan: {rec.notes}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-purple-800 font-bold block">Sisa Kekurangan:</span>
                    <span className="text-base sm:text-lg font-black text-rose-700 font-mono">
                      {formatRupiah(remaining)}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 block">
                    {isCicilan ? 'Sisa yang Harus Dibayar:' : 'Nominal Tagihan:'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                    {formatRupiah(isCicilan ? remaining : rec.amount)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Jatuh tempo: {rec.due_date || 'Batas tgl 10 setiap bulannya'}
                  </span>
                </div>

                {/* Tombol Aksi Pembayaran */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {(rec.status === 'belum' || rec.status === 'cicilan') && (
                    <>
                      {/* Tombol Cepat: Sudah Membayar (Cash / Transfer Langsung) */}
                      <button
                        type="button"
                        onClick={() => openDirectPayModal(rec)}
                        className="flex-1 sm:flex-none min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                        title="Klik jika sudah bayar cash di tempat atau transfer langsung tanpa upload bukti"
                      >
                        <Banknote className="w-5 h-5 text-amber-300" />
                        <span>{isCicilan ? 'Bayar Sisa Cicilan' : 'Sudah Membayar'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openPaymentModal(rec)}
                        className="flex-1 sm:flex-none min-h-[48px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Upload className="w-4 h-4 text-slate-950" />
                        <span>Upload Bukti</span>
                      </button>
                    </>
                  )}

                  {rec.status === 'menunggu' && (
                    <button
                      type="button"
                      onClick={() => openPaymentModal(rec)}
                      className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border-2 border-amber-400 transition-colors"
                    >
                      <Clock className="w-5 h-5 text-amber-700" />
                      <span>Lihat / Ganti Bukti Transfer</span>
                    </button>
                  )}

                  {rec.status === 'lunas' && (
                    <div className="flex items-center gap-2 text-sm text-emerald-800 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Lunas pada {rec.payment_date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bagian Rekening Pembayaran Resmi */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-6 h-6 text-blue-900 shrink-0" />
          <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Nomor Rekening Resmi Pembayaran SPP
          </h4>
        </div>
        <p className="text-sm text-slate-700 font-medium mb-4">
          Silakan transfer ke salah satu rekening di bawah ini. Cukup tekan tombol{' '}
          <strong className="text-slate-900">"Salin Nomor Rekening"</strong> lalu tempel di aplikasi m-Banking Anda.
        </p>

        <div className="space-y-3">
          {bankAccounts.map((bank) => {
            const isCopied = copiedBank === bank.bank_name;
            return (
              <div
                key={bank.bank_name}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {bank.bank_name.includes('QRIS') ? (
                      <QrCode className="w-5 h-5 text-blue-800" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-blue-800" />
                    )}
                    <span className="font-extrabold text-slate-900 text-base">
                      {bank.bank_name}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-950 font-mono tracking-wide mt-1">
                    {bank.account_number}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                    a.n. <strong className="text-slate-900">{bank.account_holder}</strong>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{bank.instructions}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAccountNumber(bank.account_number, bank.bank_name)}
                  className={`w-full sm:w-auto min-h-[46px] px-4 py-2 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                    isCopied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white shadow-xs'
                  }`}
                  aria-label={`Salin nomor rekening ${bank.bank_name}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Nomor Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-300" />
                      <span>Salin Nomor Rekening</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modal Konfirmasi Cepat "Sudah Membayar" (Cash / Transfer Langsung) */}
      {showDirectPayModal && directPayRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setShowDirectPayModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-500 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-lg">
                <Banknote className="w-6 h-6 text-emerald-600" />
                <span>Konfirmasi Sudah Membayar</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectPayModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-xs text-emerald-800 font-bold block">Periode Tagihan:</span>
              <p className="text-xl font-black text-emerald-950">{directPayRecord.period}</p>
              <p className="text-sm font-black text-blue-950 font-mono">
                {formatRupiah(directPayRecord.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 block">
                Pilih Metode Pembayaran yang Digunakan:
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="directPayType"
                  value="cash"
                  checked={paymentTypeChosen === 'cash'}
                  onChange={() => setPaymentTypeChosen('cash')}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    💵 Tunai / Cash Langsung
                  </span>
                  <span className="text-xs text-slate-500">
                    Membayar tunai langsung di meja resepsionis / pengajar
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="directPayType"
                  value="transfer"
                  checked={paymentTypeChosen === 'transfer'}
                  onChange={() => setPaymentTypeChosen('transfer')}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    🏦 Transfer Langsung ke Rekening SPP
                  </span>
                  <span className="text-xs text-slate-500">
                    Sudah transfer via m-Banking langsung ke rekening lembaga
                  </span>
                </div>
              </label>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah diklik, status iuran akan diperbarui menjadi <strong>Menunggu Verifikasi</strong> dan pengajar akan mencocokkan mutasi kas.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDirectPayModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDirectPayment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md"
              >
                Ya, Sudah Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Bukti Transfer */}
      {showPaymentModal && selectedRecordForPayment && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-900 flex flex-col my-auto">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-900" />
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Konfirmasi Pembayaran SPP
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                aria-label="Tutup form konfirmasi"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Isi Form Modal */}
            <div className="p-4 sm:p-6 space-y-4">
              {paymentSuccessMessage ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h5 className="text-xl font-extrabold text-emerald-950">
                    Konfirmasi Berhasil Dikirim!
                  </h5>
                  <p className="text-sm sm:text-base text-emerald-900 font-medium">
                    {paymentSuccessMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppNotification(selectedRecordForPayment)}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Beri Tahu Miss Sarah via WhatsApp</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Info Tagihan Singkat */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-1">
                    <span className="text-xs font-bold text-blue-800 uppercase block">
                      Tagihan Dipilih:
                    </span>
                    <div className="text-lg font-black text-blue-950">
                      Iuran Bulan {selectedRecordForPayment.period}
                    </div>
                    <div className="text-xl font-black text-blue-900 font-mono">
                      {formatRupiah(selectedRecordForPayment.amount)}
                    </div>
                  </div>

                  {/* Unggah Gambar Struk Transfer */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-slate-900 mb-1">
                      Foto Struk / Tangkapan Layar Bukti Transfer:
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-2xl p-4 sm:p-6 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {uploadedFile ? (
                        <div className="text-center">
                          <img
                            src={uploadedFile}
                            alt="Bukti transfer"
                            className="w-32 h-32 object-contain mx-auto rounded-xl border border-slate-300 shadow-xs mb-2"
                          />
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                            Foto siap diunggah. Ketuk untuk ganti foto.
                          </span>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="font-extrabold text-sm sm:text-base text-slate-800 block">
                            Ketuk untuk Pilih Foto atau Buka Kamera HP
                          </span>
                          <span className="text-xs text-slate-500 block">
                            Format JPG, PNG, atau tangkapan layar m-Banking
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Nama Pengirim Rekening (Opsional) */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-slate-900 mb-1">
                      Nama Pemilik Rekening Pengirim (Opsional):
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Contoh: Bpk. Bambang Pratama"
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200 text-base font-medium outline-hidden"
                    />
                  </div>

                  {/* Tombol Simpan Bukti */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleSubmitProof}
                      className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                    >
                      <Check className="w-5 h-5 text-amber-400" />
                      <span>Simpan Bukti Pembayaran</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppNotification(selectedRecordForPayment)}
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Konfirmasi Langsung via WhatsApp</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
