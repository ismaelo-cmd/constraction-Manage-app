import React, { useState } from 'react';
import { Subcontractor, SubcontractorPayment } from '../types';
import { 
  X, 
  HardHat, 
  Building2, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Receipt 
} from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SubcontractorDetailModalProps {
  subcontractor: Subcontractor | null;
  currency: string;
  onClose: () => void;
  onOpenDisburse: (subId: string, payId?: string) => void;
  onAddSubPayment: (subId: string, title: string, amount: number, dueDate: string) => void;
  onDeleteSubPayment: (subId: string, payId: string) => void;
  onEditSubPayment: (subId: string, updatedPayment: SubcontractorPayment) => void;
  onDeleteSubcontractor?: (subId: string) => void;
}

export const SubcontractorDetailModal: React.FC<SubcontractorDetailModalProps> = ({
  subcontractor,
  currency,
  onClose,
  onOpenDisburse,
  onAddSubPayment,
  onDeleteSubPayment,
  onEditSubPayment,
  onDeleteSubcontractor,
}) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPercentage, setNewPercentage] = useState<number>(20);
  const [newAmount, setNewAmount] = useState<number>(
    subcontractor ? Math.round(subcontractor.contractValue * 0.2) : 50000
  );
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Editing state
  const [editingPayment, setEditingPayment] = useState<SubcontractorPayment | null>(null);

  if (!subcontractor) return null;

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  const handlePercentageChange = (pct: number) => {
    setNewPercentage(pct);
    if (subcontractor && subcontractor.contractValue > 0) {
      setNewAmount(Math.round(subcontractor.contractValue * (pct / 100)));
    }
  };

  const handleAmountChange = (amt: number) => {
    setNewAmount(amt);
    if (subcontractor && subcontractor.contractValue > 0) {
      setNewPercentage(Number(((amt / subcontractor.contractValue) * 100).toFixed(1)));
    }
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newAmount <= 0) return;
    onAddSubPayment(subcontractor.id, newTitle.trim(), newAmount, newDueDate);
    setIsAddingPayment(false);
    setNewTitle('');
  };

  const handleSaveEditedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    onEditSubPayment(subcontractor.id, editingPayment);
    setEditingPayment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                {subcontractor.trade}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{subcontractor.name}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-slate-500" />
                المشروع المرتبط: <strong className="text-slate-200">{subcontractor.projectName}</strong>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-4 h-4 text-slate-500" />
                الهاتف: <strong className="text-slate-200">{subcontractor.phone}</strong>
              </span>
              {subcontractor.crNumber && (
                <span>السجل التجاري: <strong className="text-slate-200 font-mono">{subcontractor.crNumber}</strong></span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteSubcontractor && (
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="px-3 py-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                title="حذف مقاول الباطن بالكامل"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حذف المقاول</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 border-b border-slate-800 text-xs sm:text-sm">
          <div className="p-3 bg-slate-850/80 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-xs">قيمة العقد المتفق عليه</div>
            <div className="text-lg font-black text-white mt-1">
              {formatMoney(subcontractor.contractValue)} <span className="text-xs text-amber-400">{currency}</span>
            </div>
          </div>

          <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl">
            <div className="text-rose-400 text-xs">إجمالي ما تم صرفه للمقاول</div>
            <div className="text-lg font-black text-rose-400 mt-1">
              {formatMoney(subcontractor.totalPaid)} <span className="text-xs text-rose-300">{currency}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
            <div className="text-amber-400 text-xs">المتبقي له بذمتنا</div>
            <div className="text-lg font-black text-amber-400 mt-1">
              {formatMoney(subcontractor.totalRemaining)} <span className="text-xs text-amber-300">{currency}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl">
            <div className="text-blue-400 text-xs">نسبة السداد للمقاول</div>
            <div className="text-lg font-black text-blue-400 mt-1">
              {((subcontractor.totalPaid / subcontractor.contractValue) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            سجل مستخلصات مقاول الباطن وتواريخ وسندات الصرف:
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingPayment(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة مستخلص جديد</span>
            </button>
            <button
              onClick={() => onOpenDisburse(subcontractor.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition active:scale-95"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>تسجيل سند صرف لهذا المقاول</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700/80">
                <tr>
                  <th className="p-3">كود المستخلص</th>
                  <th className="p-3">بيان الأعمال المستحقة</th>
                  <th className="p-3">النسبة %</th>
                  <th className="p-3">المبلغ المستحق</th>
                  <th className="p-3">المدفوع له</th>
                  <th className="p-3">المتبقي له</th>
                  <th className="p-3">تاريخ الاستحقاق</th>
                  <th className="p-3">تاريخ الصرف</th>
                  <th className="p-3">رقم سند الصرف</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {subcontractor.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-semibold text-slate-400 text-xs">
                      {p.paymentCode}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      <div>{p.milestoneTitle}</div>
                      {p.notes && <div className="text-2xs text-slate-400 mt-0.5">{p.notes}</div>}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-300">
                      {p.percentage || Number(((p.dueAmount / (subcontractor.contractValue || 1)) * 100).toFixed(1))}%
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap font-mono">
                      {formatMoney(p.dueAmount)} {currency}
                    </td>
                    <td className="p-3 font-bold text-rose-400 whitespace-nowrap font-mono">
                      {formatMoney(p.paidAmount)} {currency}
                    </td>
                    <td className="p-3 font-bold text-amber-400 whitespace-nowrap font-mono">
                      {formatMoney(p.remainingAmount)} {currency}
                    </td>
                    <td className="p-3 text-slate-300 text-xs whitespace-nowrap font-mono">
                      {p.dueDate}
                    </td>
                    <td className="p-3 text-emerald-300 text-xs whitespace-nowrap font-mono">
                      {p.paidDate || '—'}
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-300">
                      {p.voucherNumber ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {p.voucherNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          p.status === 'مسددة'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'مسددة جزئياً'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : p.status === 'مستحقة الصرف'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.remainingAmount > 0 && (
                          <button
                            onClick={() => onOpenDisburse(subcontractor.id, p.id)}
                            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition whitespace-nowrap"
                          >
                            صرف
                          </button>
                        )}
                        <button
                          onClick={() => setEditingPayment(p)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg text-xs border border-slate-700"
                          title="تعديل بيانات المستخلص"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSubPayment(subcontractor.id, p.id)}
                          className="p-1 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg text-xs border border-slate-700"
                          title="حذف المستخلص"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add New Subcontractor Milestone */}
        {isAddingPayment && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreatePayment} className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">
                  إضافة مستخلص جديد لمقاول الباطن
                </h3>
                <button type="button" onClick={() => setIsAddingPayment(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">بيان الأعمال / المستخلص</label>
                <input
                  type="text"
                  placeholder="مثال: مستخلص إنهاء أعمال اللياسة الداخلية للدور الأول"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>النسبة (%)</span>
                    <span className="text-3xs text-amber-400">من العقد</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={newPercentage}
                      onChange={(e) => handlePercentageChange(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-amber-500/40 rounded-lg p-2 text-amber-300 font-bold font-mono"
                      required
                    />
                    <span className="absolute left-2 top-2 text-slate-500 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المبلغ المستحق ({currency})</label>
                  <input
                    type="number"
                    min="1"
                    value={newAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              {/* Quick percentage chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-3xs text-slate-400">نسب سريعة:</span>
                {[10, 15, 20, 25, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageChange(pct)}
                    className={`px-2 py-0.5 rounded text-3xs font-mono font-bold transition ${
                      newPercentage === pct
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                {(() => {
                  const currentTotal = subcontractor.payments.reduce(
                    (s, p) =>
                      s +
                      (p.percentage ||
                        (subcontractor.contractValue > 0
                          ? (p.dueAmount / subcontractor.contractValue) * 100
                          : 0)),
                    0
                  );
                  const rem = Number((100 - currentTotal).toFixed(1));
                  if (rem > 0 && rem <= 100) {
                    return (
                      <button
                        type="button"
                        onClick={() => handlePercentageChange(rem)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-3xs font-bold"
                      >
                        المتبقي بالكامل ({rem}%)
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddingPayment(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black">
                  إضافة المستخلص
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Edit Existing Subcontractor Milestone */}
        {editingPayment && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveEditedPayment} className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">
                  تعديل مستخلص مقاول الباطن ({editingPayment.paymentCode})
                </h3>
                <button type="button" onClick={() => setEditingPayment(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">بيان الأعمال</label>
                <input
                  type="text"
                  value={editingPayment.milestoneTitle}
                  onChange={(e) => setEditingPayment({ ...editingPayment, milestoneTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>نسبة المستخلص (%)</span>
                      <span className="text-3xs text-amber-400">حساب مباشر</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={
                          editingPayment.percentage ||
                          (subcontractor.contractValue > 0
                            ? Number(((editingPayment.dueAmount / subcontractor.contractValue) * 100).toFixed(1))
                            : 0)
                        }
                        onChange={(e) => {
                          const pct = Number(e.target.value);
                          const d = subcontractor.contractValue > 0 ? Math.round(subcontractor.contractValue * (pct / 100)) : editingPayment.dueAmount;
                          const rem = Math.max(0, d - editingPayment.paidAmount);
                          setEditingPayment({
                            ...editingPayment,
                            percentage: pct,
                            dueAmount: d,
                            remainingAmount: rem,
                            status: rem === 0 ? 'مسددة' : editingPayment.paidAmount > 0 ? 'مسددة جزئياً' : 'مستحقة الصرف',
                          });
                        }}
                        className="w-full bg-slate-800 border border-amber-500/40 rounded-lg p-2 text-amber-300 font-mono font-bold"
                        required
                      />
                      <span className="absolute left-2 top-2 text-slate-500 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">المبلغ المستحق ({currency})</label>
                    <input
                      type="number"
                      min="1"
                      value={editingPayment.dueAmount}
                      onChange={(e) => {
                        const d = Number(e.target.value);
                        const pct = subcontractor.contractValue > 0 ? Number(((d / subcontractor.contractValue) * 100).toFixed(1)) : (editingPayment.percentage || 0);
                        const rem = Math.max(0, d - editingPayment.paidAmount);
                        setEditingPayment({
                          ...editingPayment,
                          dueAmount: d,
                          percentage: pct,
                          remainingAmount: rem,
                          status: rem === 0 ? 'مسددة' : editingPayment.paidAmount > 0 ? 'مسددة جزئياً' : 'مستحقة الصرف',
                        });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المبلغ المصروف فعلياً ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPayment.paidAmount}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const rem = Math.max(0, editingPayment.dueAmount - p);
                      setEditingPayment({
                        ...editingPayment,
                        paidAmount: p,
                        remainingAmount: rem,
                        status: rem === 0 ? 'مسددة' : p > 0 ? 'مسددة جزئياً' : 'مستحقة الصرف',
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={editingPayment.dueDate}
                    onChange={(e) => setEditingPayment({ ...editingPayment, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم سند الصرف</label>
                  <input
                    type="text"
                    value={editingPayment.voucherNumber || ''}
                    onChange={(e) => setEditingPayment({ ...editingPayment, voucherNumber: e.target.value })}
                    placeholder="PAY-OUT-000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditingPayment(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black">
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            تلميح: يتم تحديث إجمالي ما تم صرفه لمقاول الباطن والمتبقي له تلقائياً بناءً على هذا الجدول.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Delete Subcontractor Confirmation */}
      <DeleteConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="حذف مقاول الباطن بالكامل"
        itemName={subcontractor.name}
        itemDetails={`التخصص: ${subcontractor.trade} • المشروع: ${subcontractor.projectName} • قيمة العقد: ${formatMoney(subcontractor.contractValue)} ${currency}`}
        onCancel={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          if (onDeleteSubcontractor) {
            onDeleteSubcontractor(subcontractor.id);
            setIsConfirmDeleteOpen(false);
            onClose();
          }
        }}
        confirmButtonText="تأكيد حذف مقاول الباطن"
      />
    </div>
  );
};
