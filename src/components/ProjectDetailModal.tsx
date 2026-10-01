import React, { useState } from 'react';
import { Project, ProjectPayment, ProjectStage, StageStatus, Subcontractor } from '../types';
import { 
  X, 
  Building2, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  DollarSign, 
  FileText, 
  TrendingUp, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Receipt,
  Edit3,
  Trash2,
  HardHat,
  Bell,
  Sparkles
} from 'lucide-react';
import { EditPaymentModal } from './EditPaymentModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { getStageAlert, formatDaysDifference, getDaysDifference } from '../utils/stageAlerts';

interface ProjectDetailModalProps {
  project: Project | null;
  subcontractors?: Subcontractor[];
  currency: string;
  onClose: () => void;
  onAddPaymentClick: (projectId: string, paymentId?: string) => void;
  onUpdateStage: (projectId: string, stageId: string, newStatus: StageStatus, newProgress: number, actualEndDate?: string) => void;
  onAddStage?: (
    projectId: string,
    stageData: {
      name: string;
      nameEn?: string;
      weight: number;
      status: StageStatus;
      plannedStartDate: string;
      plannedEndDate: string;
      notes?: string;
    }
  ) => void;
  onDeleteStage?: (projectId: string, stageId: string) => void;
  onAddProjectPayment?: (
    projectId: string,
    paymentData: {
      milestoneTitle: string;
      stageName: string;
      dueAmount: number;
      percentage?: number;
      dueDate: string;
      notes?: string;
    }
  ) => void;
  onUpdatePayment: (projectId: string, updatedPayment: ProjectPayment) => void;
  onDeletePayment: (projectId: string, paymentId: string) => void;
  onOpenDisbursePayment?: (subcontractorId?: string, paymentId?: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  subcontractors = [],
  currency,
  onClose,
  onAddPaymentClick,
  onUpdateStage,
  onAddStage,
  onDeleteStage,
  onAddProjectPayment,
  onUpdatePayment,
  onDeletePayment,
  onOpenDisbursePayment,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'stages' | 'subcontractors'>('payments');
  const [selectedStageToEdit, setSelectedStageToEdit] = useState<ProjectStage | null>(null);
  const [editStatus, setEditStatus] = useState<StageStatus>('قيد التنفيذ');
  const [editProgress, setEditProgress] = useState<number>(50);
  const [editActualEndDate, setEditActualEndDate] = useState<string>('');
  const [isConfirmDeleteProjectOpen, setIsConfirmDeleteProjectOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<ProjectStage | null>(null);

  // Add Stage Modal State
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageNameEn, setNewStageNameEn] = useState('');
  const [newStageWeight, setNewStageWeight] = useState<number>(15);
  const [newStageStatus, setNewStageStatus] = useState<StageStatus>('لم تبدأ');
  const [newStageStartDate, setNewStageStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStageEndDate, setNewStageEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newStageNotes, setNewStageNotes] = useState('');

  // Add Payment Modal State with live percentage calculation
  const [isAddingProjectPayment, setIsAddingProjectPayment] = useState(false);
  const [newPayTitle, setNewPayTitle] = useState('');
  const [newPayStageName, setNewPayStageName] = useState('');
  const [newPayPercentage, setNewPayPercentage] = useState<number>(20);
  const [newPayDueAmount, setNewPayDueAmount] = useState<number>(0);
  const [newPayDueDate, setNewPayDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newPayNotes, setNewPayNotes] = useState('');

  // Edit payment modal state
  const [paymentToEdit, setPaymentToEdit] = useState<ProjectPayment | null>(null);

  if (!project) return null;

  const projectSubcontractors = subcontractors.filter(
    (s) => s.projectId === project.id || s.projectName === project.name
  );

  const handleOpenEditStage = (stage: ProjectStage) => {
    setSelectedStageToEdit(stage);
    setEditStatus(stage.status);
    setEditProgress(stage.completionRate);
    setEditActualEndDate(stage.actualEndDate || new Date().toISOString().split('T')[0]);
  };

  const handleSaveStage = () => {
    if (selectedStageToEdit) {
      const finalActualEndDate = (editStatus === 'مكتملة' || editProgress === 100)
        ? (editActualEndDate || new Date().toISOString().split('T')[0])
        : selectedStageToEdit.actualEndDate;
      onUpdateStage(project.id, selectedStageToEdit.id, editStatus, editProgress, finalActualEndDate);
      setSelectedStageToEdit(null);
    }
  };

  const handleSaveEditedPayment = (updated: ProjectPayment) => {
    onUpdatePayment(project.id, updated);
    setPaymentToEdit(null);
  };

  const handleDeleteEditedPayment = (paymentId: string) => {
    onDeletePayment(project.id, paymentId);
    setPaymentToEdit(null);
  };

  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim() || !onAddStage) return;
    onAddStage(project.id, {
      name: newStageName.trim(),
      nameEn: newStageNameEn.trim() || undefined,
      weight: Number(newStageWeight) || 10,
      status: newStageStatus,
      plannedStartDate: newStageStartDate,
      plannedEndDate: newStageEndDate,
      notes: newStageNotes.trim() || undefined,
    });
    setNewStageName('');
    setNewStageNameEn('');
    setNewStageNotes('');
    setIsAddingStage(false);
  };

  const handleCreateProjectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayTitle.trim() || newPayDueAmount <= 0 || !onAddProjectPayment) return;
    onAddProjectPayment(project.id, {
      milestoneTitle: newPayTitle.trim(),
      stageName: newPayStageName || project.stages[0]?.name || 'مرحلة التنفيذ',
      dueAmount: newPayDueAmount,
      percentage: newPayPercentage,
      dueDate: newPayDueDate,
      notes: newPayNotes.trim() || undefined,
    });
    setNewPayTitle('');
    setNewPayNotes('');
    setIsAddingProjectPayment(false);
  };

  const handleNewPayPercentageChange = (pct: number) => {
    setNewPayPercentage(pct);
    if (project.contractValue > 0) {
      setNewPayDueAmount(Math.round(project.contractValue * (pct / 100)));
    }
  };

  const handleNewPayAmountChange = (amt: number) => {
    setNewPayDueAmount(amt);
    if (project.contractValue > 0) {
      setNewPayPercentage(Number(((amt / project.contractValue) * 100).toFixed(1)));
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ar-SA').format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                {project.projectCode}
              </span>
              {project.projectType && (
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  project.projectType === 'سباكة'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : project.projectType === 'كهرباء'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : project.projectType === 'تكييف'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : project.projectType === 'تشطيب وديكور'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {project.projectType === 'سباكة' ? '💧 سباكة' : project.projectType === 'كهرباء' ? '⚡ كهرباء' : project.projectType === 'تكييف' ? '❄️ تكييف' : project.projectType}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-white">{project.name}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-slate-500" />
                العميل: <strong className="text-slate-200">{project.clientName}</strong>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-500" />
                الموقع: <strong className="text-slate-200">{project.location}</strong>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-slate-500" />
                المشرف: <strong className="text-slate-200">{project.engineerInCharge}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteProject && (
              <button
                onClick={() => setIsConfirmDeleteProjectOpen(true)}
                className="px-3 py-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                title="حذف هذا المشروع بالكامل"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حذف المشروع</span>
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

        {/* Project Financial & Operational Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 border-b border-slate-800 text-xs sm:text-sm">
          <div className="p-3 bg-slate-850/80 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-xs">قيمة العقد الإجمالية</div>
            <div className="text-lg font-black text-white mt-1">
              {formatMoney(project.contractValue)} <span className="text-xs text-amber-400 font-normal">{currency}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
            <div className="text-emerald-400 text-xs flex items-center justify-between">
              <span>إجمالي المحصل الفعلي</span>
              <span className="text-xs font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                {project.financialProgress.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatMoney(project.totalCollected)} <span className="text-xs text-emerald-300 font-normal">{currency}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
            <div className="text-amber-400 text-xs">إجمالي المتبقي للتحصيل</div>
            <div className="text-lg font-black text-amber-400 mt-1">
              {formatMoney(project.totalRemaining)} <span className="text-xs text-amber-300 font-normal">{currency}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl">
            <div className="text-blue-400 text-xs flex items-center justify-between">
              <span>المرحلة الحالية</span>
              <span className="text-xs font-bold bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">
                إنجاز {project.physicalProgress}%
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-1 truncate" title={project.currentStage}>
              {project.currentStage}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'payments'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>جدول الدفعات والمستخلصات ({project.payments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stages')}
              className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'stages'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>مراحل التنفيذ الميداني ({project.stages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subcontractors')}
              className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'subcontractors'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>مقاولو الباطن في هذا المشروع ({projectSubcontractors.length})</span>
            </button>
          </div>

          {activeTab === 'payments' && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {onAddProjectPayment && (
                <button
                  onClick={() => {
                    const totalPct = project.payments.reduce(
                      (acc, p) =>
                        acc +
                        (p.percentage ||
                          (project.contractValue > 0
                            ? (p.dueAmount / project.contractValue) * 100
                            : 0)),
                      0
                    );
                    const remPct = Math.max(5, Number((100 - totalPct).toFixed(1)));
                    setNewPayPercentage(remPct);
                    setNewPayDueAmount(Math.round(project.contractValue * (remPct / 100)));
                    setIsAddingProjectPayment(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة دفعة للمشروع (%)</span>
                </button>
              )}
              <button
                onClick={() => onAddPaymentClick(project.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition active:scale-95"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>سند قبض مالي</span>
              </button>
            </div>
          )}

          {activeTab === 'stages' && onAddStage && (
            <button
              onClick={() => {
                const totalWeight = project.stages.reduce((acc, s) => acc + (s.weight || 0), 0);
                const remWeight = Math.max(5, Number((100 - totalWeight).toFixed(1)));
                setNewStageWeight(remWeight);
                setIsAddingStage(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 mb-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مرحلة جديدة للمشروع</span>
            </button>
          )}

          {activeTab === 'subcontractors' && onOpenDisbursePayment && (
            <button
              onClick={() => onOpenDisbursePayment(projectSubcontractors[0]?.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 mb-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition active:scale-95"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>تسجيل سند صرف لمقاول باطن</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  تفاصيل استحقاقات الدفعات، المبالغ المحصلة، ونسب الدفعات % من قيمة العقد:
                </span>
                <span className="font-mono text-slate-300">
                  {project.payments.filter((p) => p.status === 'محصلة').length} من {project.payments.length} دفعات محصلة بالكامل
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700/80">
                    <tr>
                      <th className="p-3">كود الدفعة</th>
                      <th className="p-3">بيان الاستحقاق</th>
                      <th className="p-3">المرحلة المرتبطة</th>
                      <th className="p-3">النسبة %</th>
                      <th className="p-3">المستحق</th>
                      <th className="p-3">المحصل الفعلي</th>
                      <th className="p-3">المتبقي</th>
                      <th className="p-3">تاريخ الاستحقاق</th>
                      <th className="p-3">تاريخ التحصيل</th>
                      <th className="p-3">رقم السند</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {project.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-semibold text-slate-400 text-xs">
                          {p.paymentCode}
                        </td>
                        <td className="p-3 font-semibold text-white">
                          <div>{p.milestoneTitle}</div>
                          {p.notes && (
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.notes}</div>
                          )}
                        </td>
                        <td className="p-3 text-slate-300 text-xs">
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md">
                            {p.stageName}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs">
                            {p.percentage || (project.contractValue > 0 ? Number(((p.dueAmount / project.contractValue) * 100).toFixed(1)) : 0)}%
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          {formatMoney(p.dueAmount)} {currency}
                        </td>
                        <td className="p-3 font-bold text-emerald-400 whitespace-nowrap">
                          {formatMoney(p.collectedAmount)} {currency}
                        </td>
                        <td className="p-3 font-bold text-amber-400 whitespace-nowrap">
                          {formatMoney(p.remainingAmount)} {currency}
                        </td>
                        <td className="p-3 text-slate-300 text-xs whitespace-nowrap">
                          {p.dueDate}
                        </td>
                        <td className="p-3 text-emerald-300 text-xs whitespace-nowrap">
                          {p.collectedDate || '—'}
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
                              p.status === 'محصلة'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : p.status === 'محصلة جزئياً'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : p.status === 'متأخرة'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                            }`}
                          >
                            {p.status === 'محصلة' && <CheckCircle2 className="w-3 h-3" />}
                            {p.status === 'محصلة جزئياً' && <Clock className="w-3 h-3" />}
                            {p.status === 'متأخرة' && <AlertCircle className="w-3 h-3" />}
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.remainingAmount > 0 && (
                              <button
                                onClick={() => onAddPaymentClick(project.id, p.id)}
                                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold rounded-lg text-xs transition whitespace-nowrap"
                                title="تسجيل سند قبض لهذه الدفعة"
                              >
                                تحصيل
                              </button>
                            )}
                            <button
                              onClick={() => setPaymentToEdit(p)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 font-semibold rounded-lg text-xs border border-slate-700 transition flex items-center gap-1"
                              title="تعديل بيانات أو قيمة أو تاريخ الدفعة"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  مراحل التنفيذ الإنشائية للمشروع، ومعدلات الإنجاز الميداني المعتمدة من الاستشاري:
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  مجموع الأوزان النسبية: {project.stages.reduce((s, st) => s + (st.weight || 0), 0)}%
                </span>
              </div>

              <div className="space-y-3">
                {project.stages.map((stage, idx) => {
                  const nextStage = project.stages[idx + 1];
                  const alert = getStageAlert(stage, project, nextStage);

                  return (
                    <div
                      key={stage.id}
                      className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-slate-600 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              stage.status === 'مكتملة'
                                ? 'bg-emerald-500 text-slate-950'
                                : stage.status === 'قيد التنفيذ'
                                ? 'bg-amber-500 text-slate-950 animate-pulse'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {stage.order}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-white text-sm sm:text-base">{stage.name}</h4>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                                  stage.status === 'مكتملة'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : stage.status === 'قيد التنفيذ'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-700/50 text-slate-400'
                                }`}
                              >
                                {stage.status}
                              </span>

                              {/* Alert Chip if approaching deadline or completed */}
                              {alert && (
                                <span className={`px-2 py-0.5 text-2xs font-bold rounded-full inline-flex items-center gap-1 ${
                                  alert.type === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : alert.type === 'overdue'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}>
                                  {alert.type === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                  {alert.type === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                                  {(alert.type === 'approaching_deadline' || alert.type === 'approaching_completion') && (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  <span>
                                    {alert.type === 'completed'
                                      ? 'مكتملة بالكامل'
                                      : formatDaysDifference(alert.daysDifference)}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {stage.nameEn} • الوزن النسبي: {stage.weight}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <div className="text-xs text-slate-400">نسبة الإنجاز</div>
                            <div className="text-base font-black text-white">{stage.completionRate}%</div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditStage(stage)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition"
                            >
                              تحديث النسبة
                            </button>
                            {onDeleteStage && project.stages.length > 1 && (
                              <button
                                onClick={() => setStageToDelete(stage)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                title="حذف هذه المرحلة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            stage.completionRate === 100
                              ? 'bg-emerald-500'
                              : stage.completionRate > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${stage.completionRate}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                        <span>البدء المخطط: {stage.plannedStartDate}</span>
                        <span>الانتهاء المخطط: {stage.plannedEndDate}</span>
                        {stage.actualEndDate && (
                          <span className="text-emerald-400 font-medium">
                            الانتهاء الفعلي: {stage.actualEndDate}
                          </span>
                        )}
                      </div>

                      {/* Prominent Stage Alert Notification Card */}
                      {alert && (
                        <div className={`mt-3 p-3 rounded-xl border flex items-start gap-3 ${
                          alert.type === 'completed'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : alert.type === 'overdue'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}>
                          <div className="shrink-0 mt-0.5">
                            {alert.type === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            {alert.type === 'overdue' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                            {(alert.type === 'approaching_deadline' || alert.type === 'approaching_completion') && (
                              <Clock className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-white text-xs">{alert.title}</span>
                              <span className="text-2xs font-mono">
                                {alert.type === 'completed'
                                  ? (stage.actualEndDate ? `تاريخ الإنجاز: ${stage.actualEndDate}` : 'إنجاز معتمد')
                                  : formatDaysDifference(alert.daysDifference)}
                              </span>
                            </div>
                            <p className="text-slate-300 text-2xs leading-relaxed">{alert.message}</p>
                            <div className="text-2xs text-slate-400 pt-0.5 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-semibold text-slate-200">الإجراء المطلوب:</span>{' '}
                              <span>{alert.actionRecommendation}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'subcontractors' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  مقاولو الباطن المتعاقد معهم لتنفيذ بنود هذا المشروع وحسابات مستخلصاتهم:
                </span>
                <span className="font-mono text-slate-300">
                  {projectSubcontractors.length} مقاولي باطن مسجلين
                </span>
              </div>

              {projectSubcontractors.length === 0 ? (
                <div className="p-8 bg-slate-850/50 border border-slate-800 rounded-2xl text-center space-y-2">
                  <HardHat className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="font-bold text-white text-sm">لا يوجد مقاولو باطن مسجلون في هذا المشروع حالياً</h4>
                  <p className="text-xs text-slate-400">يمكنك إضافة مقاولي باطن وتحديد عقودهم من تبويب "مقاولو الباطن" في الشريط العلوي.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectSubcontractors.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{sub.name}</h4>
                            <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {sub.trade}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            هاتف: {sub.phone} {sub.crNumber ? `• سجل تجاري: ${sub.crNumber}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {onOpenDisbursePayment && (
                            <button
                              onClick={() => onOpenDisbursePayment(sub.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition"
                            >
                              صرف دفعة
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Small Financial summary strip for this sub */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-900/60 rounded-lg text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-2xs block">قيمة العقد:</span>
                          <strong className="text-white">{formatMoney(sub.contractValue)} {currency}</strong>
                        </div>
                        <div>
                          <span className="text-rose-400 text-2xs block">المسدد له:</span>
                          <strong className="text-rose-400">{formatMoney(sub.totalPaid)} {currency}</strong>
                        </div>
                        <div>
                          <span className="text-amber-400 text-2xs block">المتبقي له:</span>
                          <strong className="text-amber-400">{formatMoney(sub.totalRemaining)} {currency}</strong>
                        </div>
                      </div>

                      {/* Milestone Invoices list */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-2xs font-semibold text-slate-400">
                          مستخلصات المقاول ({sub.payments.length}):
                        </div>
                        {sub.payments.map((p) => (
                          <div
                            key={p.id}
                            className="p-2 bg-slate-900/40 rounded-lg flex items-center justify-between text-xs border border-slate-800"
                          >
                            <div>
                              <span className="font-semibold text-slate-200">{p.milestoneTitle}</span>
                              <span className="text-2xs text-slate-500 mr-2 font-mono">
                                استحقاق: {p.dueDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-slate-300">
                                {formatMoney(p.dueAmount)} {currency}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                                  p.status === 'مسددة'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal to update stage */}
        {selectedStageToEdit && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base">
                    تحديث مرحلة: {selectedStageToEdit.name}
                  </h3>
                  <div className="text-2xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>الموعد المخطط: {selectedStageToEdit.plannedEndDate}</span>
                    <span className="text-amber-400 font-bold">
                      ({formatDaysDifference(getDaysDifference(selectedStageToEdit.plannedEndDate))})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStageToEdit(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">حالة المرحلة</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['لم تبدأ', 'قيد التنفيذ', 'مكتملة', 'معلقة'] as StageStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setEditStatus(st);
                        if (st === 'مكتملة') {
                          setEditProgress(100);
                          if (!editActualEndDate) {
                            setEditActualEndDate(new Date().toISOString().split('T')[0]);
                          }
                        }
                        if (st === 'لم تبدأ') setEditProgress(0);
                      }}
                      className={`p-2 rounded-lg text-xs font-bold border transition ${
                        editStatus === st
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>نسبة الإنجاز الميداني</span>
                  <span className="font-mono text-amber-400 font-bold">{editProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditProgress(val);
                    if (val === 100) {
                      setEditStatus('مكتملة');
                      if (!editActualEndDate) {
                        setEditActualEndDate(new Date().toISOString().split('T')[0]);
                      }
                    } else if (val > 0 && editStatus === 'لم تبدأ') {
                      setEditStatus('قيد التنفيذ');
                    }
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Dynamic Alert Condition Feedback */}
              {(editStatus === 'مكتملة' || editProgress === 100) ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تنبيه إنجاز واكتمال المرحلة (100%)</span>
                  </div>
                  <p className="text-2xs text-slate-300 leading-relaxed">
                    سيتم إشعار إدارة المشروع باكتمال المرحلة وتوثيق تاريخ الإنجاز الفعلي لإصدار مستخلص الدفعة والانتقال للمرحلة التالية.
                  </p>
                  <div className="pt-1">
                    <label className="block text-2xs font-semibold text-slate-300 mb-1">
                      تاريخ الانتهاء الفعلي المعتمد:
                    </label>
                    <input
                      type="date"
                      value={editActualEndDate}
                      onChange={(e) => setEditActualEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              ) : editProgress >= 80 ? (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-2xs space-y-0.5">
                    <div className="font-bold text-amber-200">
                      تنبيه قرب انتهاء المرحلة ({editProgress}%)
                    </div>
                    <div className="text-slate-300">
                      شارفت المرحلة على الاكتمال الميداني، يرجى التنسيق المسبق مع الاستشاري لتجهيز محضر الاستلام.
                    </div>
                  </div>
                </div>
              ) : getDaysDifference(selectedStageToEdit.plannedEndDate) <= 7 && getDaysDifference(selectedStageToEdit.plannedEndDate) >= 0 ? (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-2xs space-y-0.5">
                    <div className="font-bold text-amber-200">
                      تنبيه اقتراب موعد التسليم ({formatDaysDifference(getDaysDifference(selectedStageToEdit.plannedEndDate))})
                    </div>
                    <div className="text-slate-300">
                      تاريخ الانتهاء المخطط هو {selectedStageToEdit.plannedEndDate}. يرجى التحقق من وتيرة التنفيذ.
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedStageToEdit(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveStage}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shadow"
                >
                  حفظ التعديل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal to edit payment */}
        {paymentToEdit && (
          <EditPaymentModal
            payment={paymentToEdit}
            stages={project.stages}
            currency={currency}
            contractValue={project.contractValue}
            onClose={() => setPaymentToEdit(null)}
            onSavePayment={handleSaveEditedPayment}
            onDeletePayment={handleDeleteEditedPayment}
          />
        )}

        {/* Modal: Add New Stage to Project */}
        {isAddingStage && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <form onSubmit={handleCreateStage} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      إضافة مرحلة تنفيذية جديدة للمشروع
                    </h3>
                    <p className="text-3xs text-slate-400">
                      إدراج مرحلة إنشائية أو كهروميكانيكية جديدة وتحديد وزنها النسبي
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingStage(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  اسم المرحلة الميدانية <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: أعمال الحفر والإحلال / تمديد الدكت / تركيب الطبالين"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                  required
                />
                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'تأسيس شبكة الصرف والتغذية',
                    'تمديد مواسير التكييف والنحاس',
                    'سحب كابلات الإنارة والقوى',
                    'تركيب وحدات التكييف والتشغيل',
                    'أعمال اللياسة والعزل المائي',
                    'تركيب البلاط والبورسلان',
                    'الدهانات والديكورات والتسليم',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewStageName(sug)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500 text-3xs transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>الوزن النسبي في المشروع (%)</span>
                    <span className="text-3xs text-amber-400 font-mono">
                      الأوزان الحالية: {project.stages.reduce((s, st) => s + (st.weight || 0), 0)}%
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newStageWeight}
                      onChange={(e) => setNewStageWeight(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-amber-500/40 rounded-lg p-2 text-amber-300 font-bold font-mono"
                      required
                    />
                    <span className="absolute left-3 top-2 text-slate-500 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">حالة المرحلة الأولية</label>
                  <select
                    value={newStageStatus}
                    onChange={(e) => setNewStageStatus(e.target.value as StageStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-medium"
                  >
                    <option value="لم تبدأ">لم تبدأ</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتملة">مكتملة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ البدء المخطط</label>
                  <input
                    type="date"
                    value={newStageStartDate}
                    onChange={(e) => setNewStageStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ الانتهاء المخطط</label>
                  <input
                    type="date"
                    value={newStageEndDate}
                    onChange={(e) => setNewStageEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ملاحظات / نطاق الأعمال (اختياري)</label>
                <textarea
                  value={newStageNotes}
                  onChange={(e) => setNewStageNotes(e.target.value)}
                  placeholder="أي اشتراطات هندسية أو اعتمادات مطلوبة من الاستشاري..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingStage(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow transition active:scale-95"
                >
                  حفظ وإضافة المرحلة
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Scheduled Payment with Live Percentage Calculation */}
        {isAddingProjectPayment && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <form onSubmit={handleCreateProjectPayment} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      إضافة دفعة / مستخلص جديد للمشروع
                    </h3>
                    <p className="text-3xs text-slate-400">
                      حساب تلقائي للنسبة المئوية % من قيمة العقد الإجمالية ({formatMoney(project.contractValue)} {currency})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingProjectPayment(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  بيان استحقاق الدفعة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: الدفعة الرابعة: استكمال أعمال التأسيسات واعتماد الاستشاري"
                  value={newPayTitle}
                  onChange={(e) => setNewPayTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  المرحلة الإنشائية المرتبطة بها
                </label>
                <select
                  value={newPayStageName || project.stages[0]?.name}
                  onChange={(e) => setNewPayStageName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-medium"
                >
                  {project.stages.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.status})
                    </option>
                  ))}
                  <option value="عام / عند توقيع العقد">عام / عند توقيع العقد</option>
                </select>
              </div>

              {/* Two-Way Percentage and Due Amount Calculation */}
              <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>نسبة الدفعة (%)</span>
                      <span className="text-3xs text-amber-400">حساب مباشر تلقائي</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={newPayPercentage}
                        onChange={(e) => handleNewPayPercentageChange(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold font-mono text-sm"
                        required
                      />
                      <span className="absolute left-3 top-2 text-slate-500 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>المبلغ المستحق ({currency})</span>
                      <span className="text-3xs text-emerald-400 font-mono">
                        من {formatMoney(project.contractValue)}
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newPayDueAmount}
                      onChange={(e) => handleNewPayAmountChange(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Quick Presets for Percentage */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-3xs text-slate-400">نسب سريعة:</span>
                  {[5, 10, 15, 20, 25, 30].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleNewPayPercentageChange(pct)}
                      className={`px-2 py-0.5 rounded text-3xs font-mono font-bold transition ${
                        newPayPercentage === pct
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  {/* Remaining towards 100% */}
                  {(() => {
                    const currentTotal = project.payments.reduce(
                      (acc, p) =>
                        acc +
                        (p.percentage ||
                          (project.contractValue > 0
                            ? (p.dueAmount / project.contractValue) * 100
                            : 0)),
                      0
                    );
                    const remainingTo100 = Number((100 - currentTotal).toFixed(1));
                    if (remainingTo100 > 0 && remainingTo100 <= 100) {
                      return (
                        <button
                          type="button"
                          onClick={() => handleNewPayPercentageChange(remainingTo100)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-3xs font-bold"
                        >
                          المتبقي بالكامل ({remainingTo100}%)
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">تاريخ استحقاق الدفعة</label>
                <input
                  type="date"
                  value={newPayDueDate}
                  onChange={(e) => setNewPayDueDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ملاحظات على الدفعة (اختياري)</label>
                <input
                  type="text"
                  placeholder="ملاحظات سند القبض أو شروط الاعتماد..."
                  value={newPayNotes}
                  onChange={(e) => setNewPayNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingProjectPayment(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg shadow transition active:scale-95"
                >
                  إضافة الدفعة وجدولتها
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Stage Confirmation */}
        <DeleteConfirmModal
          isOpen={!!stageToDelete}
          title="حذف مرحلة من المشروع"
          itemName={stageToDelete?.name || ''}
          itemDetails={
            stageToDelete
              ? `الترتيب: المرحلة رقم ${stageToDelete.order} • الوزن النسبي: ${stageToDelete.weight}% • الحالة: ${stageToDelete.status}`
              : ''
          }
          onCancel={() => setStageToDelete(null)}
          onConfirm={() => {
            if (stageToDelete && onDeleteStage) {
              onDeleteStage(project.id, stageToDelete.id);
              setStageToDelete(null);
            }
          }}
          confirmButtonText="تأكيد حذف المرحلة"
        />

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            تلميح: يتم احتساب إجمالي المحصل والمتبقي تلقائياً بناءً على جدول الدفعات.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Delete Project Confirmation */}
      <DeleteConfirmModal
        isOpen={isConfirmDeleteProjectOpen}
        title="حذف مشروع المقاولات بالكامل"
        itemName={project.name}
        itemDetails={`كود المشروع: ${project.projectCode} • العميل: ${project.clientName} • قيمة العقد: ${formatMoney(project.contractValue)} ${currency}`}
        onCancel={() => setIsConfirmDeleteProjectOpen(false)}
        onConfirm={() => {
          if (onDeleteProject) {
            onDeleteProject(project.id);
            setIsConfirmDeleteProjectOpen(false);
            onClose();
          }
        }}
        confirmButtonText="تأكيد حذف المشروع"
      />
    </div>
  );
};
