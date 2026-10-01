import React, { useState } from 'react';
import { ProjectPayment, PaymentStatus, ProjectStage } from '../types';
import { X, Edit3, Trash2, Calendar, DollarSign, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface EditPaymentModalProps {
  payment: ProjectPayment;
  stages: ProjectStage[];
  currency: string;
  contractValue?: number;
  onClose: () => void;
  onSavePayment: (updatedPayment: ProjectPayment) => void;
  onDeletePayment: (paymentId: string) => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  payment,
  stages,
  currency,
  contractValue = 0,
  onClose,
  onSavePayment,
  onDeletePayment,
}) => {
  const [milestoneTitle, setMilestoneTitle] = useState(payment.milestoneTitle);
  const [stageName, setStageName] = useState(payment.stageName || (stages[0]?.name ?? ''));
  const [dueAmount, setDueAmount] = useState<number>(payment.dueAmount);
  const [percentage, setPercentage] = useState<number>(
    contractValue > 0
      ? Number(((payment.dueAmount / contractValue) * 100).toFixed(1))
      : payment.percentage || 0
  );
  const [collectedAmount, setCollectedAmount] = useState<number>(payment.collectedAmount);
  const [dueDate, setDueDate] = useState(payment.dueDate || '');
  const [collectedDate, setCollectedDate] = useState(payment.collectedDate || '');
  const [voucherNumber, setVoucherNumber] = useState(payment.voucherNumber || '');
  const [paymentMethod, setPaymentMethod] = useState<'تحويل بنكي' | 'شيك مصرفي' | 'نقدي' | 'شبكة (مدى)'>(
    payment.paymentMethod || 'تحويل بنكي'
  );
  const [notes, setNotes] = useState(payment.notes || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    if (contractValue > 0) {
      setDueAmount(Math.round(contractValue * (pct / 100)));
    }
  };

  const handleDueAmountChange = (amt: number) => {
    setDueAmount(amt);
    if (contractValue > 0) {
      setPercentage(Number(((amt / contractValue) * 100).toFixed(1)));
    }
  };

  // Compute remaining and auto-status
  const remainingAmount = Math.max(0, dueAmount - collectedAmount);
  
  const getAutoStatus = (collected: number, due: number, dDate: string): PaymentStatus => {
    if (collected >= due && due > 0) return 'محصلة';
    if (collected > 0) return 'محصلة جزئياً';
    if (dDate && new Date(dDate) < new Date()) return 'متأخرة';
    return 'قيد الانتظار';
  };

  const currentStatus = getAutoStatus(collectedAmount, dueAmount, dueDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || dueAmount <= 0) return;

    const updatedPayment: ProjectPayment = {
      ...payment,
      milestoneTitle: milestoneTitle.trim(),
      stageName,
      dueAmount,
      percentage: contractValue > 0 ? Number(((dueAmount / contractValue) * 100).toFixed(1)) : percentage,
      collectedAmount,
      remainingAmount,
      dueDate,
      collectedDate: collectedAmount > 0 ? (collectedDate || new Date().toISOString().split('T')[0]) : undefined,
      voucherNumber: voucherNumber.trim() || undefined,
      paymentMethod,
      status: currentStatus,
      notes: notes.trim() || undefined,
    };

    onSavePayment(updatedPayment);
    onClose();
  };

  const handleDelete = () => {
    onDeletePayment(payment.id);
    onClose();
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                تعديل بيانات الدفعة / المستخلص ({payment.paymentCode})
              </h3>
              <p className="text-xs text-slate-400">
                تعديل المبالغ المستحقة، تواريخ التحصيل، أو حذف الدفعة
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

        {/* Delete confirmation strip */}
        {confirmDelete && (
          <div className="p-4 bg-rose-950/60 border-b border-rose-800/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>هل أنت متأكد من حذف هذه الدفعة نهائياً؟ سيتم إعادة حساب إجمالي المحصل والمتبقي للمشروع فوراً.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded font-semibold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Milestone Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              بيان ومسمى الدفعة <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="مثال: دفعة إتمام صبة الدور الأول"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Linked Stage */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              المرحلة الإنشائية المرتبطة بها
            </label>
            <select
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {stages.map((stg) => (
                <option key={stg.id} value={stg.name}>
                  {stg.name} ({stg.status})
                </option>
              ))}
              <option value="أخرى / أعمال إضافية">أخرى / أعمال إضافية</option>
            </select>
          </div>

          {/* Due, Percentage and Collected Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>نسبة الدفعة (%)</span>
                {contractValue > 0 && (
                  <span className="text-3xs text-amber-400 font-normal">من قيمة العقد</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                  placeholder="20"
                />
                <span className="absolute left-3 top-2 text-slate-500 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                المبلغ المستحق ({currency}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={dueAmount}
                onChange={(e) => handleDueAmountChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                المبلغ المحصل فعلياً ({currency})
              </label>
              <input
                type="number"
                min="0"
                max={dueAmount * 1.5}
                value={collectedAmount}
                onChange={(e) => setCollectedAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Calculated Remaining Preview */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">المبلغ المتبقي للتحصيل: </span>
              <strong className="text-amber-400 font-mono text-sm">
                {formatMoney(remainingAmount)} {currency}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">الحالة المحسوبة: </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  currentStatus === 'محصلة'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentStatus === 'محصلة جزئياً'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : currentStatus === 'متأخرة'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {currentStatus}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                تاريخ الاستحقاق
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                تاريخ التحصيل الفعلي
              </label>
              <input
                type="date"
                value={collectedDate}
                onChange={(e) => setCollectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Voucher and Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                رقم سند القبض / المرجع البنكي
              </label>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                placeholder="REC-2025-..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="شيك مصرفي">شيك مصرفي</option>
                <option value="نقدي">نقدي (كاش)</option>
                <option value="شبكة (مدى)">شبكة (مدى / نقطة بيع)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              ملاحظات وتفاصيل الدفعة
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="شروط الصرف أو معلومات الحساب البنكي"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold rounded-xl transition"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>حذف الدفعة</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg transition active:scale-95"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
