import React, { useState, useEffect } from 'react';
import { Project, ProjectPayment } from '../types';
import { X, DollarSign, Calendar, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface AddPaymentModalProps {
  projects: Project[];
  preSelectedProjectId?: string;
  preSelectedPaymentId?: string;
  currency: string;
  onClose: () => void;
  onSavePayment: (
    projectId: string,
    paymentId: string | 'new',
    collectedAmount: number,
    voucherNumber: string,
    collectedDate: string,
    paymentMethod: 'تحويل بنكي' | 'شيك مصرفي' | 'نقدي' | 'شبكة (مدى)',
    notes: string,
    newMilestoneTitle?: string,
    newDueAmount?: number
  ) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  projects,
  preSelectedProjectId,
  preSelectedPaymentId,
  currency,
  onClose,
  onSavePayment,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    preSelectedProjectId || (projects[0]?.id ?? '')
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'existing' | 'new'>(
    preSelectedPaymentId ? 'existing' : 'existing'
  );

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    preSelectedPaymentId || (selectedProject?.payments[0]?.id ?? '')
  );

  const selectedPayment = selectedProject?.payments.find((p) => p.id === selectedPaymentId);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [voucher, setVoucher] = useState<string>('REC-2025-' + Math.floor(100 + Math.random() * 900));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'تحويل بنكي' | 'شيك مصرفي' | 'نقدي' | 'شبكة (مدى)'>('تحويل بنكي');
  const [notes, setNotes] = useState<string>('');

  // For brand new milestone
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPercentage, setNewPercentage] = useState<number>(10);
  const [newDue, setNewDue] = useState<number>(
    selectedProject ? Math.round(selectedProject.contractValue * 0.1) : 100000
  );

  const handleNewPercentageChange = (pct: number) => {
    setNewPercentage(pct);
    if (selectedProject && selectedProject.contractValue > 0) {
      const calculated = Math.round(selectedProject.contractValue * (pct / 100));
      setNewDue(calculated);
      setAmount(calculated);
    }
  };

  const handleNewDueChange = (val: number) => {
    setNewDue(val);
    setAmount(val);
    if (selectedProject && selectedProject.contractValue > 0) {
      setNewPercentage(Number(((val / selectedProject.contractValue) * 100).toFixed(1)));
    }
  };

  useEffect(() => {
    if (selectedPayment) {
      // Suggest the remaining amount
      setAmount(selectedPayment.remainingAmount > 0 ? selectedPayment.remainingAmount : selectedPayment.dueAmount);
    }
  }, [selectedPaymentId, selectedProjectId]);

  useEffect(() => {
    if (preSelectedProjectId) {
      setSelectedProjectId(preSelectedProjectId);
    }
    if (preSelectedPaymentId) {
      setSelectedPaymentId(preSelectedPaymentId);
      setSelectedPaymentMode('existing');
    }
  }, [preSelectedProjectId, preSelectedPaymentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    if (selectedPaymentMode === 'existing') {
      if (!selectedPaymentId) return;
      onSavePayment(
        selectedProjectId,
        selectedPaymentId,
        amount,
        voucher,
        date,
        method,
        notes
      );
    } else {
      if (!newTitle || newDue <= 0) return;
      onSavePayment(
        selectedProjectId,
        'new',
        amount,
        voucher,
        date,
        method,
        notes,
        newTitle,
        newDue
      );
    }
    onClose();
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                تسجيل سند تحصيل دفعة (سند قبض مالي)
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل حركة تدفق نقدي واردة وتحديث أرصدة المشروع تلقائياً
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
          {/* Select Project */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              المشروع المراد تحصيل دفعته <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const prj = projects.find((p) => p.id === e.target.value);
                if (prj && prj.payments.length > 0) {
                  setSelectedPaymentId(prj.payments[0].id);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name} (المتبقي: {formatMoney(p.totalRemaining)} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Payment target: Existing milestone vs New Milestone */}
          <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setSelectedPaymentMode('existing')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPaymentMode === 'existing'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تحصيل دفعة تعاقدية مجدولة مسبقاً
            </button>
            <button
              type="button"
              onClick={() => setSelectedPaymentMode('new')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPaymentMode === 'new'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              إضافة مستخلص أو دفعة إضافية جديدة
            </button>
          </div>

          {selectedPaymentMode === 'existing' ? (
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                اختر الدفعة المستحقة <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                required
              >
                {selectedProject?.payments.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.milestoneTitle} | المستحق: {formatMoney(p.dueAmount)} | المتبقي:{' '}
                    {formatMoney(p.remainingAmount)} ({p.status})
                  </option>
                ))}
              </select>

              {selectedPayment && (
                <div className="mt-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>المرحلة الإنشائية:</span>
                    <span className="text-slate-200 font-semibold">{selectedPayment.stageName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>قيمة الدفعة التعاقدية:</span>
                    <span className="text-white font-bold">
                      {formatMoney(selectedPayment.dueAmount)} {currency}{' '}
                      <span className="text-amber-400 font-mono text-2xs">
                        ({((selectedPayment.dueAmount / (selectedProject?.contractValue || 1)) * 100).toFixed(1)}% من العقد)
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>المحصل سابقاً:</span>
                    <span className="text-emerald-400 font-bold">{formatMoney(selectedPayment.collectedAmount)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>الرصيد المتبقي المطلوب تحصيله:</span>
                    <span className="text-amber-400 font-bold">{formatMoney(selectedPayment.remainingAmount)} {currency}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-slate-800/40 border border-slate-700/80 rounded-xl">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  مسمى الدفعة / المستخلص <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: دفعة أمر تغيير أعمال إضافية في الدور الأرضي"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                  required={selectedPaymentMode === 'new'}
                />
              </div>

              {/* Percentage & Due Amount Dual Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>نسبة الدفعة من العقد (%)</span>
                    {selectedProject && (
                      <span className="text-3xs text-amber-400">
                        العقد: {formatMoney(selectedProject.contractValue)} {currency}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={newPercentage}
                      onChange={(e) => handleNewPercentageChange(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                      placeholder="10"
                    />
                    <span className="absolute left-3 top-2 text-slate-500 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    المبلغ الإجمالي المستحق للدفعة <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDue}
                    onChange={(e) => handleNewDueChange(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-amber-500"
                    required={selectedPaymentMode === 'new'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount to collect now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                المبلغ المحصل الآن ({currency}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 font-bold text-base focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                تاريخ التحصيل الفعلي <span className="text-rose-400">*</span>
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
                رقم سند القبض / المرجع البنكي
              </label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="REC-2025-000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                طريقة الدفع
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="شيك مصرفي">شيك مصرفي</option>
                <option value="نقدي">نقدي (كاش في الصندوق)</option>
                <option value="شبكة (مدى)">شبكة (مدى / نقطة بيع)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              ملاحظات سند القبض
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم إيداع الحوالة في بنك الراجحي - حساب المقاولات"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Live Preview info */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              عند الحفظ، سيتم تحديث إجمالي المحصل لـ ({selectedProject?.name}) وإعادة حساب نسبة الإنجاز المالي فوراً في لوحة القيادة.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>اعتماد سند القبض وحفظ الحركة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
