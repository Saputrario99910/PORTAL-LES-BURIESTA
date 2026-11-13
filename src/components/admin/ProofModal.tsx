import React from 'react';
import { AdminPaymentVerification } from '../../data/adminMockData.ts';
import { X, CheckCircle, CreditCard, Calendar, User, FileText } from 'lucide-react';

interface ProofModalProps {
  payment: AdminPaymentVerification;
  onClose: () => void;
  onVerify: (id: string) => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({ payment, onClose, onVerify }) => {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-slate-200 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Bukti Transfer Siswa
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {payment.student_name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Tutup pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Ringkasan Data Pembayaran */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm">
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Kelas:</span>
              <span className="font-extrabold text-slate-900">{payment.student_class}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Bulan Tagihan:</span>
              <span className="font-extrabold text-blue-900">{payment.billing_month}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Nominal Tagihan:</span>
              <span className="font-black text-emerald-800 text-base font-mono">
                {formatRupiah(payment.amount)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Bank Pengirim:</span>
              <span className="font-bold text-slate-800">
                {payment.sender_bank} ({payment.sender_account_name})
              </span>
            </div>
          </div>

          {/* Pratinjau Gambar Struk */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-600 self-start mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-900" />
              Tampilan Gambar Struk Transfer:
            </span>
            <div className="w-full max-w-sm aspect-2/3 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner flex items-center justify-center relative">
              <img
                src={payment.proof_image_url}
                alt={`Struk pembayaran ${payment.student_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback jika placeholder offline
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] p-2 rounded-xl text-center font-medium">
                Diunggah pada: {payment.upload_date}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm"
          >
            Tutup
          </button>

          {payment.status === 'menunggu' ? (
            <button
              type="button"
              onClick={() => {
                onVerify(payment.id);
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verifikasi Pembayaran Ini</span>
            </button>
          ) : (
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Telah Diverifikasi Lunas
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
