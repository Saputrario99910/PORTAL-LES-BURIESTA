import React, { useState } from 'react';
import { AdminPaymentVerification } from '../../data/adminMockData.ts';
import { X, CheckCircle2, DollarSign, Wallet, ArrowRight, AlertCircle, Clock } from 'lucide-react';

interface PartialPaymentModalProps {
  payment: AdminPaymentVerification;
  onClose: () => void;
  onSubmitPayment: (
    paymentId: string,
    paidAmount: number,
    paymentMethod: string,
    note?: string
  ) => void;
}

export const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({
  payment,
  onClose,
  onSubmitPayment,
}) => {
  const currentPaid = payment.paid_amount || 0;
  const originalAmount = payment.amount;
  const currentRemaining = payment.remaining_amount !== undefined ? payment.remaining_amount : (originalAmount - currentPaid);

  // Default input bayar: jika masih sisa, tawarkan sisa pelunasan
  const [inputAmount, setInputAmount] = useState<number>(currentRemaining > 0 ? currentRemaining : 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Transfer Bank (BCA/Mandiri/BRI)');
  const [paymentNote, setPaymentNote] = useState<string>('Pembayaran cicilan siswa');

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Kalkulasi preview setelah pembayaran baru ini
  const newTotalPaid = Math.min(originalAmount, currentPaid + (Number(inputAmount) || 0));
  const newRemaining = Math.max(0, originalAmount - newTotalPaid);
  const isWillBeFullyPaid = newRemaining === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAmount <= 0) {
      alert('Nominal pembayaran harus lebih besar dari Rp 0.');
      return;
    }
    if (inputAmount > currentRemaining) {
      if (!window.confirm(`Nominal bayar (${formatRupiah(inputAmount)}) melebihi sisa kekurangan (${formatRupiah(currentRemaining)}). Tetap lanjutkan?`)) {
        return;
      }
    }
    onSubmitPayment(payment.id, inputAmount, paymentMethod, paymentNote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Pencatatan Pembayaran & Cicilan
              </h3>
              <p className="text-xs text-slate-300">
                {payment.student_name} ({payment.nickname})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Ringkasan Tagihan */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Tagihan: <strong className="text-slate-900">{payment.billing_title || 'SPP Bulanan'} ({payment.billing_month})</strong></span>
            <span className="bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-bold">
              {payment.student_class}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Tagihan</div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                {formatRupiah(originalAmount)}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Sudah Dibayar</div>
              <div className="text-sm sm:text-base font-black text-emerald-800 font-mono">
                {formatRupiah(currentPaid)}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-[11px] font-bold text-amber-800 uppercase">Sisa Kekurangan</div>
              <div className="text-sm sm:text-base font-black text-amber-900 font-mono">
                {formatRupiah(currentRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Form Pembayaran */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Nominal Pembayaran Diterima Sekarang (Rp)
              </label>
              <button
                type="button"
                onClick={() => setInputAmount(currentRemaining)}
                className="text-[11px] font-bold text-blue-900 hover:underline"
              >
                Bayar Lunas Penuh ({formatRupiah(currentRemaining)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="number"
                step={5000}
                value={inputAmount}
                onChange={(e) => setInputAmount(Number(e.target.value) || 0)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-emerald-400 text-base font-black font-mono text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                required
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Terbilang: {formatRupiah(inputAmount)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:border-slate-800 outline-hidden bg-white"
              >
                <option value="Transfer Bank (BCA)">Transfer Bank (BCA)</option>
                <option value="Transfer Bank (Mandiri)">Transfer Bank (Mandiri)</option>
                <option value="Transfer Bank (BRI/BNI)">Transfer Bank (BRI/BNI)</option>
                <option value="QRIS">QRIS Semua Pembayaran</option>
                <option value="Tunai / Cash">Tunai / Cash di Lembaga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Contoh: Cicilan ke-1 tunai di kantor"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:border-slate-800 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Simulasi Hasil Setelah Pembayaran */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-600 block">Kondisi Status Setelah Disimpan:</span>
            <div className="flex items-center justify-between font-medium">
              <span>Status Akhir:</span>
              {isWillBeFullyPaid ? (
                <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>LUNAS LENGKAP</span>
                </span>
              ) : (
                <span className="font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SEBAGIAN / CICILAN</span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Sisa Kekurangan yang Tersisa:</span>
              <strong className="text-slate-900 font-mono font-bold">
                {formatRupiah(newRemaining)}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pembayaran Ini</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
