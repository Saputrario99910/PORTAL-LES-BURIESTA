import React, { useState } from 'react';
import { RecurringBillingRule, AdminStudentOption } from '../../data/adminMockData.ts';
import { InvoiceLineItem, InvoiceItemKind } from '../../types/index.ts';
import { X, Calendar, Settings, DollarSign, Users, AlertCircle, Check, Plus, Trash2, Receipt } from 'lucide-react';

interface BillingSettingsModalProps {
  rules: RecurringBillingRule[];
  students: AdminStudentOption[];
  onClose: () => void;
  onSaveRule: (updatedRule: RecurringBillingRule) => void;
  onGenerateMonthlyBills: (rule: RecurringBillingRule, targetMonth: string) => void;
  onCreateCustomBill: (billData: {
    title: string;
    billingType: 'bulanan' | 'per_pertemuan' | 'lainnya';
    amount: number;
    billingMonth: string;
    targetStudentId: 'all' | string;
    dueDate: string;
    lineItems?: InvoiceLineItem[];
  }) => void;
}

export const BillingSettingsModal: React.FC<BillingSettingsModalProps> = ({
  rules,
  students,
  onClose,
  onSaveRule,
  onGenerateMonthlyBills,
  onCreateCustomBill,
}) => {
  const [activeTab, setActiveTab] = useState<'recurring' | 'custom'>('recurring');

  // State untuk form Tagihan Rutin Bulanan
  const [currentRule, setCurrentRule] = useState<RecurringBillingRule>(
    rules[0] || {
      id: 'rule_spp_bulanan',
      title: 'SPP Reguler Bulanan',
      billing_type: 'bulanan',
      default_amount: 250000,
      due_day_of_month: 10,
      active: true,
    }
  );

  const [generateMonth, setGenerateMonth] = useState<string>('Desember 2024');

  // State untuk form Tagihan Khusus / Invoice Dinamis (Line Items)
  const [customTitle, setCustomTitle] = useState<string>('SPP Reguler & Uang Buku');
  const [customType, setCustomType] = useState<'bulanan' | 'per_pertemuan' | 'lainnya'>('bulanan');
  const [customMonth, setCustomMonth] = useState<string>('Desember 2024');
  const [customDueDate, setCustomDueDate] = useState<string>('10 Desember 2024');
  const [targetStudentId, setTargetStudentId] = useState<'all' | string>('all');

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: 'item_1',
      kind: 'spp',
      description: 'SPP Reguler Periode Desember 2024',
      quantity: 1,
      unit_price: 250000,
      line_total: 250000,
    },
    {
      id: 'item_2',
      kind: 'buku',
      description: 'Uang Buku Paket Modul Level 3 & Flashcard',
      quantity: 1,
      unit_price: 100000,
      line_total: 100000,
    },
  ]);

  const totalInvoiceAmount = lineItems.reduce((acc, it) => acc + (it.line_total || 0), 0);

  const addPresetSpp = () => {
    const newItem: InvoiceLineItem = {
      id: `item_${Date.now()}_spp`,
      kind: 'spp',
      description: `SPP Reguler ${customMonth}`,
      quantity: 1,
      unit_price: currentRule.default_amount || 250000,
      line_total: currentRule.default_amount || 250000,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const addPresetBuku = () => {
    const newItem: InvoiceLineItem = {
      id: `item_${Date.now()}_buku`,
      kind: 'buku',
      description: 'Uang Buku Paket Modul & Flashcard',
      quantity: 1,
      unit_price: 100000,
      line_total: 100000,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const addCustomItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item_${Date.now()}_custom`,
      kind: 'lainnya',
      description: 'Item Tambahan / Biaya Kegiatan',
      quantity: 1,
      unit_price: 50000,
      line_total: 50000,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const q = Number(field === 'quantity' ? value : item.quantity) || 0;
          const u = Number(field === 'unit_price' ? value : item.unit_price) || 0;
          updated.line_total = q * u;
        }
        return updated;
      })
    );
  };

  const deleteLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      alert('Minimal harus ada 1 item pada tagihan.');
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveRecurringRule = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRule(currentRule);
  };

  const handleTriggerGenerate = () => {
    if (window.confirm(`Terbitkan tagihan "${currentRule.title}" sebesar ${formatRupiah(currentRule.default_amount)} untuk SEMUA siswa di periode "${generateMonth}"?`)) {
      onGenerateMonthlyBills(currentRule, generateMonth);
    }
  };

  const handleCreateCustomBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || totalInvoiceAmount <= 0) {
      alert('Mohon isi judul tagihan dan pastikan total nominal lebih dari 0.');
      return;
    }
    onCreateCustomBill({
      title: customTitle,
      billingType: customType,
      amount: totalInvoiceAmount,
      billingMonth: customMonth,
      targetStudentId,
      dueDate: customDueDate,
      lineItems,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Pengaturan & Terbitkan Tagihan</h3>
              <p className="text-xs text-slate-300">
                Atur tarif otomatis atau buat tagihan baru (SPP, Modul, Pertemuan)
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

        {/* Tab Navigasi Modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`pb-3 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'recurring'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tarif Tagihan Rutin (1x Setting)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Buat Tagihan Khusus / Tambahan</span>
          </button>
        </div>

        {/* Konten Tab */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'recurring' ? (
            <div className="space-y-6">
              {/* Box Pengaturan Tarif */}
              <form onSubmit={handleSaveRecurringRule} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    ⚙️ Pengaturan Standar Tagihan Berulang
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Tersimpan Otomatis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Tagihan Default
                    </label>
                    <input
                      type="text"
                      value={currentRule.title}
                      onChange={(e) => setCurrentRule({ ...currentRule, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                      placeholder="Contoh: SPP Reguler Bulanan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipe Penagihan
                    </label>
                    <select
                      value={currentRule.billing_type}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          billing_type: e.target.value as 'bulanan' | 'per_pertemuan',
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                    >
                      <option value="bulanan">Bulanan (SPP per Bulan)</option>
                      <option value="per_pertemuan">Per Pertemuan (Paket Sesi / Les Privat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nominal Standar per Siswa (Rp)
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={currentRule.default_amount}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          default_amount: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                      required
                    />
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Terbilang: {formatRupiah(currentRule.default_amount)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Jatuh Tempo Bulanan
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Setiap tanggal</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={currentRule.due_day_of_month}
                        onChange={(e) =>
                          setCurrentRule({
                            ...currentRule,
                            due_day_of_month: Number(e.target.value) || 10,
                          })
                        }
                        className="w-20 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center focus:border-emerald-600 outline-hidden bg-white"
                        required
                      />
                      <span className="text-xs font-bold text-slate-600">tiap bulannya</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Simpan Pengaturan Tarif</span>
                  </button>
                </div>
              </form>

              {/* Box Terbitkan ke Semua Siswa */}
              <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <Users className="w-5 h-5 text-emerald-700" />
                  <span>Terbitkan Tagihan Rutin ke Semua Siswa</span>
                </div>
                <p className="text-xs text-emerald-900 font-medium">
                  Cukup pilih periode bulan, lalu klik terbitkan. Sistem akan otomatis membuat tagihan berstatus "Menunggu Pembayaran" untuk seluruh {students.length} siswa terdaftar.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <div className="w-full sm:w-60">
                    <input
                      type="text"
                      value={generateMonth}
                      onChange={(e) => setGenerateMonth(e.target.value)}
                      placeholder="Misal: Desember 2024"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm font-bold text-slate-900 focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerGenerate}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terbitkan ke Semua ({students.length} Siswa)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Tagihan Khusus & Dynamic Invoice (Line Items) */
            <form onSubmit={handleCreateCustomBill} className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  Gunakan form ini untuk membuat tagihan gabungan atau khusus (misal: <strong>SPP Reguler + Uang Buku</strong>). Wali murid akan melihat total tagihan terpadu disertai rincian item.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama / Judul Tagihan
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-blue-900 outline-hidden"
                    placeholder="Contoh: SPP Reguler & Uang Buku Modul"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bulan / Periode
                  </label>
                  <input
                    type="text"
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                    placeholder="Contoh: Desember 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-blue-900 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jatuh Tempo Pembayaran
                  </label>
                  <input
                    type="text"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                    placeholder="Contoh: 10 Desember 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-blue-900 outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Siswa
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-blue-900 outline-hidden bg-white"
                  >
                    <option value="all">📢 Tagihkan ke SEMUA Siswa ({students.length} Siswa)</option>
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        👤 {std.name} ({std.class_level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rincian Komponen Tagihan (Line Items) */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-900" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Komponen Item Tagihan ({lineItems.length} Item)
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={addPresetSpp}
                      className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-bold transition-colors"
                    >
                      + Preset SPP Reguler
                    </button>
                    <button
                      type="button"
                      onClick={addPresetBuku}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-colors"
                    >
                      + Preset Uang Buku
                    </button>
                    <button
                      type="button"
                      onClick={addCustomItem}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Item Lain</span>
                    </button>
                  </div>
                </div>

                {/* Daftar Baris Item */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                    >
                      <div className="w-full sm:w-28 shrink-0">
                        <select
                          value={item.kind}
                          onChange={(e) =>
                            updateLineItem(item.id, 'kind', e.target.value as InvoiceItemKind)
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white outline-hidden"
                        >
                          <option value="spp">SPP</option>
                          <option value="buku">Buku/Modul</option>
                          <option value="kegiatan">Kegiatan</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Deskripsi item..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white outline-hidden"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-16">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(item.id, 'quantity', Number(e.target.value) || 1)
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center bg-white outline-hidden"
                            title="Jumlah / Qty"
                            required
                          />
                        </div>

                        <span className="text-xs text-slate-400">×</span>

                        <div className="w-28">
                          <input
                            type="number"
                            step={1000}
                            min={0}
                            value={item.unit_price}
                            onChange={(e) =>
                              updateLineItem(item.id, 'unit_price', Number(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white outline-hidden"
                            title="Harga Satuan"
                            required
                          />
                        </div>

                        <div className="w-24 text-right font-mono font-bold text-xs text-slate-900 hidden sm:block">
                          {formatRupiah(item.line_total)}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteLineItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Hapus baris item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Kalkulasi Otomatis */}
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Total Nominal Tagihan:
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Otomatis dihitung dari {lineItems.length} komponen di atas
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                    {formatRupiah(totalInvoiceAmount)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Terbitkan Tagihan Ini ({formatRupiah(totalInvoiceAmount)})</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
