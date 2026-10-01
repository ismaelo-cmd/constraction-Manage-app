import React, { useState } from 'react';
import { Subcontractor, SubcontractorPayment, Project } from '../types';
import { X, HardHat, Building2, Phone, DollarSign, Layers, Plus, Trash2, Percent } from 'lucide-react';

interface AddSubcontractorModalProps {
  projects: Project[];
  currency: string;
  onClose: () => void;
  onSaveSubcontractor: (sub: Subcontractor) => void;
}

interface DraftSubMilestone {
  title: string;
  percentage: number;
  amount: number;
  dueDate: string;
}

export const AddSubcontractorModal: React.FC<AddSubcontractorModalProps> = ({
  projects,
  currency,
  onClose,
  onSaveSubcontractor,
}) => {
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('أعمال الحدادة والنجارة المسلحة');
  const [phone, setPhone] = useState('05');
  const [crNumber, setCrNumber] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [contractValue, setContractValue] = useState<number>(200000);

  // Dynamic subcontractor payment milestones with percentage calculation
  const [milestones, setMilestones] = useState<DraftSubMilestone[]>([
    {
      title: 'دفعة 1: دفعة توريد المواد والبدء الميداني',
      percentage: 30,
      amount: 60000,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: 'دفعة 2: مستخلص إنجاز 50% من الأعمال',
      percentage: 40,
      amount: 80000,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: 'دفعة 3: التسليم النهائي والاعتماد الهندسي',
      percentage: 30,
      amount: 60000,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ]);

  const handleContractValueChange = (newVal: number) => {
    setContractValue(newVal);
    if (newVal > 0) {
      setMilestones((prev) =>
        prev.map((m) => ({
          ...m,
          amount: Math.round(newVal * (m.percentage / 100)),
        }))
      );
    }
  };

  const applyPreset = (count: number) => {
    if (contractValue <= 0) return;
    const basePct = Number((100 / count).toFixed(1));
    const newItems: DraftSubMilestone[] = [];

    let allocatedPct = 0;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const pct = isLast ? Number((100 - allocatedPct).toFixed(1)) : basePct;
      allocatedPct += pct;
      const amt = Math.round(contractValue * (pct / 100));

      newItems.push({
        title: `مستخلص أعمال رقم ${i + 1} (${trade})`,
        percentage: pct,
        amount: amt,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }

    setMilestones(newItems);
  };

  const handlePercentageChange = (index: number, newPct: number) => {
    const amt = contractValue > 0 ? Math.round(contractValue * (newPct / 100)) : 0;
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, percentage: newPct, amount: amt } : m))
    );
  };

  const handleAmountChange = (index: number, newAmt: number) => {
    const pct = contractValue > 0 ? Number(((newAmt / contractValue) * 100).toFixed(1)) : 0;
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, amount: newAmt, percentage: pct } : m))
    );
  };

  const handleAddMilestone = () => {
    const nextIdx = milestones.length + 1;
    const currentTotalPct = milestones.reduce((s, m) => s + (m.percentage || 0), 0);
    const remPct = Math.max(5, Number((100 - currentTotalPct).toFixed(1)));
    const amt = contractValue > 0 ? Math.round(contractValue * (remPct / 100)) : 30000;

    setMilestones([
      ...milestones,
      {
        title: `مستخلص إضافي رقم ${nextIdx} (${trade})`,
        percentage: remPct,
        amount: amt,
        dueDate: new Date(Date.now() + nextIdx * 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const totalMilestonesPct = Number(
    milestones.reduce((s, m) => s + Number(m.percentage || 0), 0).toFixed(1)
  );
  const totalMilestonesAmount = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || contractValue <= 0 || !selectedProjectId || milestones.length === 0) return;

    const selectedProj = projects.find((p) => p.id === selectedProjectId);
    const subId = `SUB-${Math.floor(10 + Math.random() * 90)}`;

    const payments: SubcontractorPayment[] = milestones.map((m, idx) => ({
      id: `${subId}-PAY-${idx + 1}`,
      paymentCode: `SUB-${subId.split('-').pop()}-${String(idx + 1).padStart(2, '0')}`,
      subcontractorId: subId,
      subcontractorName: name.trim(),
      projectId: selectedProjectId,
      projectName: selectedProj?.name || 'مشروع',
      milestoneTitle: m.title,
      dueAmount: m.amount,
      percentage: m.percentage,
      paidAmount: 0,
      remainingAmount: m.amount,
      dueDate: m.dueDate,
      status: 'قيد المراجعة',
    }));

    const newSubcontractor: Subcontractor = {
      id: subId,
      name: name.trim(),
      trade,
      phone: phone.trim(),
      crNumber: crNumber.trim() || undefined,
      projectId: selectedProjectId,
      projectName: selectedProj?.name || 'مشروع',
      contractValue,
      totalPaid: 0,
      totalRemaining: contractValue,
      status: 'نشط',
      payments,
    };

    onSaveSubcontractor(newSubcontractor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                إضافة مقاول باطن جديد (Subcontractor)
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل العقد وحساب مستخلصات الباطن بالنسبة المئوية % مباشرة
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                اسم المقاول / المؤسسة المنفذة <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مؤسسة الركائز الذهبية للحدادة"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                التخصص / بند الأعمال <span className="text-rose-400">*</span>
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="أعمال الحدادة والنجارة المسلحة">أعمال الحدادة والنجارة المسلحة</option>
                <option value="أعمال السباكة والصرف الصحي MEP">أعمال السباكة والصرف الصحي MEP</option>
                <option value="أعمال الكهرباء والإنارة والشبكات">أعمال الكهرباء والإنارة والشبكات</option>
                <option value="أنظمة مكافحة الحريق والإنذار">أنظمة مكافحة الحريق والإنذار</option>
                <option value="أعمال تكسيات الحجر الطبيعي والواجهات">أعمال تكسيات الحجر الطبيعي والواجهات</option>
                <option value="أعمال اللياسة الداخلية والعوازل">أعمال اللياسة الداخلية والعوازل</option>
                <option value="أعمال التكييف والدكت HVAC">أعمال التكييف والدكت HVAC</option>
                <option value="أعمال الدهانات والتشطيبات">أعمال الدهانات والتشطيبات</option>
                <option value="أخرى / بند متخصص">أخرى / بند متخصص</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                المشروع المربوط به <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectCode} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                قيمة عقد مقاول الباطن ({currency}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1000"
                value={contractValue}
                onChange={(e) => handleContractValueChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">رقم الجوال للتواصل</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">السجل التجاري / الهوية</label>
              <input
                type="text"
                value={crNumber}
                onChange={(e) => setCrNumber(e.target.value)}
                placeholder="1010XXXXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Subcontractor Milestones with Percentage % */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>جدولة مستخلصات مقاول الباطن بالنسبة المئوية (%):</span>
                </h4>
                <p className="text-2xs text-slate-400 mt-0.5">
                  أدخل نسبة كل مستخلص % وسيتم احتساب المبلغ المستحق تلقائياً من قيمة عقد الباطن ({formatMoney(contractValue)} {currency})
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-2xs font-semibold text-slate-300 shrink-0">
                <span className="px-1 text-slate-400">تقسيم:</span>
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => applyPreset(num)}
                    className="px-2 py-0.5 rounded hover:bg-slate-700 hover:text-white transition"
                  >
                    {num} دفعات
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-mono font-bold text-2xs text-rose-400 shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, title: e.target.value } : item))
                        )
                      }
                      placeholder="بيان المستخلص"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium text-xs focus:outline-none focus:border-amber-500"
                      required
                    />

                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="حذف هذا المستخلص"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-2xs text-amber-400 font-bold block mb-0.5">النسبة المئوية (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={m.percentage}
                          onChange={(e) => handlePercentageChange(idx, Number(e.target.value))}
                          className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-amber-300 font-mono font-bold text-xs"
                          required
                        />
                        <span className="absolute left-2.5 top-1 text-slate-500 font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-2xs text-slate-400 block mb-0.5">المبلغ المحسوب ({currency})</label>
                      <input
                        type="number"
                        min="1"
                        value={m.amount}
                        onChange={(e) => handleAmountChange(idx, Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-2xs text-slate-400 block mb-0.5">تاريخ الاستحقاق المتوقع</label>
                      <input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, dueDate: e.target.value } : item))
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ إضافة مستخلص آخر</span>
              </button>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span>
                  النسب:{' '}
                  <strong className={totalMilestonesPct === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                    {totalMilestonesPct}% {totalMilestonesPct === 100 && '✓'}
                  </strong>
                </span>
                <span>
                  المجموع:{' '}
                  <strong className={totalMilestonesAmount === contractValue ? 'text-emerald-400' : 'text-amber-400'}>
                    {formatMoney(totalMilestonesAmount)} / {formatMoney(contractValue)} {currency}
                  </strong>
                </span>
              </div>
            </div>
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
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg transition active:scale-95"
            >
              حفظ مقاول الباطن والمستخلصات ({milestones.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
