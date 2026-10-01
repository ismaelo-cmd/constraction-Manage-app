import React, { useState, useEffect } from 'react';
import { Subcontractor, SubcontractorPayment } from '../types';
import { X, DollarSign, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DisburseSubPaymentModalProps {
  subcontractors: Subcontractor[];
  preSelectedSubcontractorId?: string;
  preSelectedPaymentId?: string;
  currency: string;
  onClose: () => void;
  onSaveDisbursement: (
    subcontractorId: string,
    paymentId: string,
    paidAmount: number,
    voucherNumber: string,
    paidDate: string,
    paymentMethod: 'تحويل بنكي' | 'شيك مصرفي' | 'نقدي',
    notes: string
  ) => void;
}

export const DisburseSubPaymentModal: React.FC<DisburseSubPaymentModalProps> = ({
  subcontractors,
  preSelectedSubcontractorId,
  preSelectedPaymentId,
  currency,
  onClose,
  onSaveDisbursement,
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string>(
    preSelectedSubcontractorId || (subcontractors[0]?.id ?? '')
  );

  const selectedSub = subcontractors.find((s) => s.id === selectedSubId);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    preSelectedPaymentId || (selectedSub?.payments[0]?.id ?? '')
  );

  const selectedPayment = selectedSub?.payments.find((p) => p.id === selectedPaymentId);

  const [amount, setAmount] = useState<number>(0);
  const [voucher, setVoucher] = useState<string>('PAY-OUT-' + Math.floor(100 + Math.random() * 900));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'تحويل بنكي' | 'شيك مصرفي' | 'نقدي'>('تحويل بنكي');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (selectedPayment) {
      setAmount(selectedPayment.remainingAmount > 0 ? selectedPayment.remainingAmount : selectedPayment.dueAmount);
    }
  }, [selectedPaymentId, selectedSubId]);

  useEffect(() => {
    if (preSelectedSubcontractorId) setSelectedSubId(preSelectedSubcontractorId);
    if (preSelectedPaymentId) setSelectedPaymentId(preSelectedPaymentId);
  }, [preSelectedSubcontractorId, preSelectedPaymentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId || !selectedPaymentId || amount <= 0) return;

    onSaveDisbursement(
      selectedSubId,
      selectedPaymentId,
      amount,
      voucher,
      date,
      method,
      notes
    );
    onClose();
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                تسجيل سند صرف لمقاول باطن (سند دفع مالي)
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل حركة نقدية صادرة وسداد مستخلص لمقاول الباطن
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Subcontractor selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              مقاول الباطن المستفيد <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedSubId}
              onChange={(e) => {
                setSelectedSubId(e.target.value);
                const sub = subcontractors.find((s) => s.id === e.target.value);
                if (sub && sub.payments.length > 0) {
                  setSelectedPaymentId(sub.payments[0].id);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
              required
            >
              {subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.trade}) - مشروع: {s.projectName} (المتبقي له: {formatMoney(s.totalRemaining)} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Milestone / Payment selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              المستخلص المراد صرفه <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedPaymentId}
              onChange={(e) => setSelectedPaymentId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
              required
            >
              {selectedSub?.payments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.milestoneTitle} | المستحق: {formatMoney(p.dueAmount)} | المتبقي: {formatMoney(p.remainingAmount)} ({p.status})
                </option>
              ))}
            </select>

            {selectedPayment && (
              <div className="mt-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>إجمالي قيمة المستخلص:</span>
                  <span className="text-white font-bold">{formatMoney(selectedPayment.dueAmount)} {currency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>المدفوع سابقاً:</span>
                  <span className="text-rose-400 font-bold">{formatMoney(selectedPayment.paidAmount)} {currency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>الرصيد المتبقي له في هذا المستخلص:</span>
                  <span className="text-amber-400 font-bold">{formatMoney(selectedPayment.remainingAmount)} {currency}</span>
                </div>
              </div>
            )}
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                المبلغ المراد صرفه الآن ({currency}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-rose-400 font-bold text-base font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                تاريخ الصرف الفعلي <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Voucher and Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                رقم سند الصرف / الشيك / الحوالة
              </label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="PAY-OUT-..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                طريقة الصرف
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="شيك مصرفي">شيك مصرفي</option>
                <option value="نقدي">نقدي (كاش عهدة)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              ملاحظات سند الصرف
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم خصم 5% دفعة ضمان حسن التنفيذ والصرف بالتحويل"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>اعتماد سند الصرف وتحديث الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
