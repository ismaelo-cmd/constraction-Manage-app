import React, { useState } from 'react';
import { Subcontractor, SubcontractorPayment, Project } from '../types';
import { 
  HardHat, 
  DollarSign, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Building2, 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  ShieldCheck,
  ArrowUpRight,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SubcontractorsViewProps {
  subcontractors: Subcontractor[];
  projects: Project[];
  currency: string;
  onOpenAddSubcontractor: () => void;
  onOpenDisbursePayment: (subcontractorId?: string, paymentId?: string) => void;
  onEditSubcontractorPayment: (subcontractorId: string, updatedPayment: SubcontractorPayment) => void;
  onDeleteSubcontractorPayment: (subcontractorId: string, paymentId: string) => void;
  onSelectSubcontractor: (sub: Subcontractor) => void;
  onDeleteSubcontractor: (subcontractorId: string) => void;
}

export const SubcontractorsView: React.FC<SubcontractorsViewProps> = ({
  subcontractors,
  projects,
  currency,
  onOpenAddSubcontractor,
  onOpenDisbursePayment,
  onEditSubcontractorPayment,
  onDeleteSubcontractorPayment,
  onSelectSubcontractor,
  onDeleteSubcontractor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('الكل');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState('الكل');
  const [subToDelete, setSubToDelete] = useState<Subcontractor | null>(null);

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  // Compute Aggregates
  const totalSubcontractsValue = subcontractors.reduce((sum, s) => sum + s.contractValue, 0);
  const totalPaid = subcontractors.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalRemaining = subcontractors.reduce((sum, s) => sum + s.totalRemaining, 0);
  const payoutRate = totalSubcontractsValue > 0 ? (totalPaid / totalSubcontractsValue) * 100 : 0;

  // Total Client Collected across linked projects for back-to-back comparison
  const totalClientCollected = projects.reduce((sum, p) => sum + p.totalCollected, 0);
  const netCashMargin = totalClientCollected - totalPaid;

  // Filter Subcontractors
  const filteredSubcontractors = subcontractors.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.projectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProject =
      selectedProjectFilter === 'الكل' || sub.projectId === selectedProjectFilter;

    const matchesTrade =
      selectedTradeFilter === 'الكل' || sub.trade.includes(selectedTradeFilter);

    return matchesSearch && matchesProject && matchesTrade;
  });

  // Extract distinct trades
  const trades = Array.from(new Set(subcontractors.map((s) => s.trade)));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                إدارة مقاولي الباطن والموردين (Subcontractor Management)
              </span>
              <span className="text-xs text-slate-400">تتبع العقود وسندات الصرف والمتبقي</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              مستخلصات مقاولي الباطن والتدفقات النقدية الصادرة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              متابعة دقيقة لمستحقات مقاولي الباطن (الحدادة، السباكة، الكهرباء، اللياسة، الواجهات)، وتتبع المبالغ المصروفة والمتبقية لكل مقاول مقارنة بتحصيلات الملاك في كل مشروع.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => onOpenDisbursePayment()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/40 transition active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>تسجيل سند صرف لمقاول</span>
            </button>
            <button
              onClick={onOpenAddSubcontractor}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-amber-950/40 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مقاول باطن جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subcontractor Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Subcontracts Value */}
        <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>إجمالي عقود مقاولي الباطن</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatMoney(totalSubcontractsValue)}{' '}
              <span className="text-xs text-amber-400 font-semibold">{currency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              موزعة على {subcontractors.length} مقاولين باطن
            </div>
          </div>
        </div>

        {/* KPI 2: Total Paid to Subcontractors */}
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
            <span>إجمالي المسدد لمقاولي الباطن</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
              {formatMoney(totalPaid)}{' '}
              <span className="text-xs text-rose-300 font-semibold">{currency}</span>
            </div>
            <div className="text-xs text-rose-300/80 mt-1 flex justify-between font-bold">
              <span>نسبة الصرف لهم:</span>
              <span className="bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-200">
                {payoutRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Remaining Owed to Subcontractors */}
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>المتبقي لمقاولي الباطن (التزامات)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
              {formatMoney(totalRemaining)}{' '}
              <span className="text-xs text-amber-300 font-semibold">{currency}</span>
            </div>
            <div className="text-xs text-amber-300/80 mt-1">
              مستحقات واجبة السداد مع إتمام المراحل
            </div>
          </div>
        </div>

        {/* KPI 4: Net Cash Flow Safety Margin */}
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>صافي الفائض النقدي (المحصل - المصروف)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
              {formatMoney(netCashMargin)}{' '}
              <span className="text-xs text-emerald-300 font-semibold">{currency}</span>
            </div>
            <div className="text-xs text-emerald-300/80 mt-1 font-semibold">
              فائض السيولة المحصلة من الملاك فوق تكاليف الباطن
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="البحث باسم مقاول الباطن، التخصص، أو المشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">المشروع:</span>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="الكل" className="bg-slate-900">جميع المشاريع</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trade Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">التخصص:</span>
            <select
              value={selectedTradeFilter}
              onChange={(e) => setSelectedTradeFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="الكل" className="bg-slate-900">جميع التخصصات</option>
              {trades.map((t) => (
                <option key={t} value={t} className="bg-slate-900">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subcontractors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubcontractors.map((sub) => {
          const paidPct = sub.contractValue > 0 ? (sub.totalPaid / sub.contractValue) * 100 : 0;
          const remainingPct = 100 - paidPct;

          return (
            <div
              key={sub.id}
              className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                      {sub.trade}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {sub.status}
                    </span>
                    <button
                      onClick={() => setSubToDelete(sub)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="حذف مقاول الباطن بالكامل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    المشروع: <strong className="text-slate-200">{sub.projectName}</strong>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {sub.phone}
                  </span>
                </div>
              </div>

              {/* Financial Box: Contract Value, Total Paid, Remaining */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-400 text-2xs">قيمة العقد</div>
                  <div className="text-sm font-bold text-white mt-0.5 font-mono">
                    {formatMoney(sub.contractValue)}
                  </div>
                </div>

                <div>
                  <div className="text-rose-400 text-2xs">المدفوع له فعلياً</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5 font-mono">
                    {formatMoney(sub.totalPaid)}
                  </div>
                </div>

                <div>
                  <div className="text-amber-400 text-2xs">المتبقي له بذمتنا</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5 font-mono">
                    {formatMoney(sub.totalRemaining)}
                  </div>
                </div>
              </div>

              {/* Progress Bar of Subcontractor Payout */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-2xs">
                  <span className="text-rose-400 font-semibold">
                    ما تم صرفه: {paidPct.toFixed(1)}%
                  </span>
                  <span className="text-amber-400 font-semibold">
                    المتبقي: {remainingPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${paidPct}%` }}
                    title={`تم صرف ${formatMoney(sub.totalPaid)} ${currency}`}
                  />
                </div>
              </div>

              {/* Subcontractor Payments list snippet */}
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-2xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 font-semibold">
                  <span>المستخلصات والدفعات ({sub.payments.length})</span>
                  <span>
                    {sub.payments.filter((p) => p.status === 'مسددة').length} مسددة بالكامل
                  </span>
                </div>
                <div className="space-y-1">
                  {sub.payments.slice(0, 2).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[200px]">{p.milestoneTitle}</span>
                      <span className="font-mono font-bold text-slate-200">
                        {formatMoney(p.dueAmount)} {currency} ({p.status})
                      </span>
                    </div>
                  ))}
                  {sub.payments.length > 2 && (
                    <div className="text-slate-500 text-3xs text-center pt-0.5">
                      + {sub.payments.length - 2} دفعات أخرى مسجلة
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectSubcontractor(sub)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>تفاصيل المستخلصات ({sub.payments.length})</span>
                </button>

                <button
                  onClick={() => onOpenDisbursePayment(sub.id)}
                  className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/40 text-xs font-bold rounded-xl flex items-center gap-1 transition active:scale-95"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>سند صرف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Subcontractor Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!subToDelete}
        title="حذف مقاول الباطن بالكامل"
        itemName={subToDelete?.name || ''}
        itemDetails={
          subToDelete
            ? `التخصص: ${subToDelete.trade} • المشروع: ${subToDelete.projectName} • قيمة العقد: ${formatMoney(subToDelete.contractValue)} ${currency}`
            : ''
        }
        onCancel={() => setSubToDelete(null)}
        onConfirm={() => {
          if (subToDelete) {
            onDeleteSubcontractor(subToDelete.id);
            setSubToDelete(null);
          }
        }}
        confirmButtonText="تأكيد حذف مقاول الباطن"
      />
    </div>
  );
};
