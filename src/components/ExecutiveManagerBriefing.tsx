import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HardHat, 
  ShieldAlert, 
  ShieldCheck, 
  Printer, 
  ArrowRight, 
  Sparkles, 
  User, 
  MapPin, 
  Calendar, 
  Receipt,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Project, Subcontractor, StageAlert } from '../types';
import { formatDaysDifference } from '../utils/stageAlerts';

interface ExecutiveManagerBriefingProps {
  projects: Project[];
  subcontractors?: Subcontractor[];
  currency: string;
  stageAlerts?: StageAlert[];
  onSelectProject: (project: Project) => void;
  onOpenAddPayment?: (projectId?: string) => void;
}

export const ExecutiveManagerBriefing: React.FC<ExecutiveManagerBriefingProps> = ({
  projects,
  subcontractors = [],
  currency,
  stageAlerts = [],
  onSelectProject,
  onOpenAddPayment,
}) => {
  const [selectedProjId, setSelectedProjId] = useState<string>(projects[0]?.id || '');

  const project = projects.find((p) => p.id === selectedProjId) || projects[0];

  if (!project) return null;

  const linkedSubs = subcontractors.filter(
    (s) => s.projectId === project.id || s.projectName === project.name
  );
  const totalSubContract = linkedSubs.reduce((acc, s) => acc + s.contractValue, 0);
  const totalSubPaid = linkedSubs.reduce((acc, s) => acc + s.totalPaid, 0);
  const totalSubRemaining = linkedSubs.reduce((acc, s) => acc + s.totalRemaining, 0);

  const projectAlerts = stageAlerts.filter((a) => a.projectId === project.id);
  const currentStageAlert = projectAlerts.find((a) => a.stageName === project.currentStage) || projectAlerts[0];

  // Calculate Health & Risk Score
  const liquidityGap = project.financialProgress - project.physicalProgress;
  const delayedPayments = project.payments.filter((p) => p.status === 'متأخرة' && p.remainingAmount > 0);
  const isOverdue = currentStageAlert?.type === 'overdue';

  let healthStatus: {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: any;
    summary: string;
  };

  if (isOverdue || liquidityGap < -15 || delayedPayments.length >= 2) {
    healthStatus = {
      label: 'موقف حرج (يتطلب تدخل الإدارة)',
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/40',
      borderColor: 'border-rose-500/50',
      icon: ShieldAlert,
      summary: 'يوجد تأخر ميداني أو عجز سيولة ملحوظ مقارنة بنسبة الإنجاز، يلزم تدخل الإدارة لتسريع وتيرة العمل والتحصيل.',
    };
  } else if (currentStageAlert?.type === 'approaching_deadline' || liquidityGap < 0 || delayedPayments.length > 0) {
    healthStatus = {
      label: 'تنبيه ومتابعة (تحت السيطرة)',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/50',
      icon: AlertTriangle,
      summary: 'المشروع مستقر مع وجود استحقاقات قريبة أو مواعيد تسليم وشيكة تتطلب التنسيق مع الاستشاري والعميل.',
    };
  } else {
    healthStatus = {
      label: 'ممتاز ومنضبط (أداء متوازن)',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/50',
      icon: ShieldCheck,
      summary: 'التدفق المالي يغطي الإنجاز الميداني، والجدول الزمني يسير بانضباط دون أي تعثرات.',
    };
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  const handlePrintBrief = () => {
    window.print();
  };

  return (
    <div className="bg-slate-850/95 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Top Banner & Project Selector for Manager */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                الموجز التنفيذي للإدارة العليا (Manager Briefing)
              </h3>
              <span className="px-2.5 py-0.5 text-2xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                ملخص القرار السريع للمدير
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              عرض أهم النقاط والمؤشرات الحرجة للمشروع المختار لاطلاع المدير العام واعتماد الإجراءات
            </p>
          </div>
        </div>

        {/* Project Selector Control */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <label className="block text-3xs font-bold text-amber-400 mb-1">
              اختر المشروع لعرض تقريره التنفيذي:
            </label>
            <div className="relative">
              <select
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer shadow-inner appearance-none transition"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white py-1">
                    🏢 {p.projectCode} • {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={handlePrintBrief}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              title="طباعة التقرير التنفيذي للمدير"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">طباعة الموجز</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Overview Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
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
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {project.projectType === 'سباكة' ? '💧 سباكة' : project.projectType === 'كهرباء' ? '⚡ كهرباء' : project.projectType === 'تكييف' ? '❄️ تكييف' : project.projectType}
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              العميل: <strong className="text-slate-200">{project.clientName}</strong>
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {project.location}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white pt-1">
            {project.name}
          </h2>
        </div>

        {/* Manager Health Status Badge */}
        <div className={`p-3 rounded-2xl border ${healthStatus.bgColor} ${healthStatus.borderColor} space-y-1 shrink-0 max-w-sm`}>
          <div className="flex items-center gap-2">
            <healthStatus.icon className={`w-4 h-4 ${healthStatus.color}`} />
            <span className={`font-black text-xs ${healthStatus.color}`}>
              تقييم سلامة المشروع: {healthStatus.label}
            </span>
          </div>
          <p className="text-2xs text-slate-300 leading-relaxed">
            {healthStatus.summary}
          </p>
        </div>
      </div>

      {/* The 4 Executive Pillars for Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: الموقف المالي الحرج */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              الموقف المالي
            </span>
            <span className="text-2xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              محصل {project.financialProgress.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">قيمة العقد:</span>
              <span className="font-bold text-white font-mono">{formatMoney(project.contractValue)} {currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-medium">المحصل الفعلي:</span>
              <span className="font-bold text-emerald-400 font-mono">{formatMoney(project.totalCollected)} {currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400 font-medium">المتبقي بذمة العميل:</span>
              <span className="font-bold text-amber-400 font-mono">{formatMoney(project.totalRemaining)} {currency}</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-2xs">
              <span className="text-slate-400">فارق السيولة:</span>
              <span className={`font-bold font-mono ${liquidityGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {liquidityGap >= 0 ? `فائض +${liquidityGap.toFixed(1)}%` : `عجز ${liquidityGap.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: الموقف الزمني والميداني */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              الموقف الميداني والزمني
            </span>
            <span className="text-2xs font-mono text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
              إنجاز {project.physicalProgress}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-2xs text-slate-400 block">المرحلة الحالية:</span>
              <strong className="text-white text-xs truncate block mt-0.5" title={project.currentStage}>
                {project.currentStage}
              </strong>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${project.physicalProgress}%` }}
              />
            </div>

            <div className="pt-1 flex justify-between items-center text-2xs text-slate-400">
              <span>البدء: {project.startDate}</span>
              <span>التسليم: {project.expectedEndDate}</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: مقاولو الباطن وحساباتهم */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-rose-400" />
              مقاولو الباطن ({linkedSubs.length})
            </span>
            <span className="text-2xs font-mono text-slate-400">
              {linkedSubs.length > 0 ? `${formatMoney(totalSubContract)} ${currency}` : 'لا يوجد'}
            </span>
          </div>

          {linkedSubs.length === 0 ? (
            <div className="text-center py-4 text-2xs text-slate-500">
              لا يوجد مقاولو باطن مسجلين بهذا المشروع
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">المسدد للمقاولين:</span>
                <span className="font-bold text-rose-400 font-mono">{formatMoney(totalSubPaid)} {currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-medium">المتبقي لهم:</span>
                <span className="font-bold text-amber-400 font-mono">{formatMoney(totalSubRemaining)} {currency}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-2xs text-slate-400 flex items-center justify-between">
                <span>نسبة سداد الباطن:</span>
                <span className="font-bold font-mono text-white">
                  {totalSubContract > 0 ? `${((totalSubPaid / totalSubContract) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pillar 4: قرارات وإجراءات المدير العاجلة */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              توصيات وقرارات المدير
            </span>
            <span className="text-3xs font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
              عاجل
            </span>
          </div>

          <div className="space-y-2 text-2xs">
            {currentStageAlert ? (
              <div className="p-2 bg-slate-850 rounded-lg border border-slate-800 text-slate-300">
                <strong className="text-amber-400 block mb-0.5">{currentStageAlert.title}</strong>
                <span>{currentStageAlert.actionRecommendation}</span>
              </div>
            ) : (
              <div className="p-2 bg-slate-850 rounded-lg border border-slate-800 text-slate-300">
                المرحلة التشغيلية تسير بانتظام، يرجى متابعة مواعيد الاستحقاق الدورية مع الاستشاري.
              </div>
            )}

            {delayedPayments.length > 0 && (
              <div className="p-2 bg-rose-950/30 rounded-lg border border-rose-500/30 text-rose-300">
                <strong>تنبيه مالي:</strong> توجد {delayedPayments.length} دفعات متأخرة يلزم توجيه الإدارة المالية بالتحصيل.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer for Manager */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-2xs">
          <span>المهندس المشرف: <strong className="text-slate-200">{project.engineerInCharge}</strong></span>
          <span>•</span>
          <span>المراحل: <strong className="text-slate-200">{project.stages.length} مراحل</strong></span>
          <span>•</span>
          <span>الدفعات: <strong className="text-slate-200">{project.payments.length} دفعات</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAddPayment && (
            <button
              onClick={() => onOpenAddPayment(project.id)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow transition flex items-center gap-1.5 active:scale-95"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>تسجيل سند قبض</span>
            </button>
          )}

          <button
            onClick={() => onSelectProject(project)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>عرض ملف المشروع الكامل وتفاصيل البنود</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
