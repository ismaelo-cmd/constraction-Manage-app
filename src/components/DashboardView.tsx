import React, { useState, useMemo } from 'react';
import { Project, KPIStats, StageStatus, Subcontractor, ProjectPayment, StageAlert } from '../types';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Search, 
  Eye, 
  Plus, 
  Layers, 
  Calendar, 
  User, 
  MapPin, 
  Sparkles, 
  Table as TableIcon, 
  LayoutGrid, 
  UploadCloud, 
  HardHat, 
  Trash2, 
  ArrowRight, 
  Target, 
  Edit3, 
  Check, 
  FileSpreadsheet,
  AlertCircle,
  Receipt,
  Bell,
  FileCheck
} from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { formatDaysDifference } from '../utils/stageAlerts';
import { ExecutiveManagerBriefing } from './ExecutiveManagerBriefing';

interface DashboardViewProps {
  projects: Project[];
  subcontractors?: Subcontractor[];
  kpis: KPIStats;
  currency: string;
  stageAlerts?: StageAlert[];
  onOpenStageNotifications?: () => void;
  onOpenCreateFromContract?: () => void;
  onSelectProject: (project: Project) => void;
  onOpenAddPayment: (projectId?: string, paymentId?: string) => void;
  onOpenAddProject: () => void;
  onOpenSmartImport: () => void;
  onNavigateToSubcontractors?: () => void;
  onDeleteProject: (projectId: string) => void;
  onOpenDisbursePayment?: (subcontractorId?: string, paymentId?: string) => void;
  onDeleteSubcontractor?: (subcontractorId: string) => void;
  onUpdatePayment?: (projectId: string, payment: ProjectPayment) => void;
  onDeletePayment?: (projectId: string, paymentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  subcontractors = [],
  kpis,
  currency,
  stageAlerts = [],
  onOpenStageNotifications,
  onOpenCreateFromContract,
  onSelectProject,
  onOpenAddPayment,
  onOpenAddProject,
  onOpenSmartImport,
  onNavigateToSubcontractors,
  onDeleteProject,
  onOpenDisbursePayment,
  onDeleteSubcontractor,
}) => {
  // Single Project Focus State: 'all' or specific project id
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  // Filters for 'all' mode
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('الكل');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('الكل');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('الكل');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Deletion modal state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subcontractor | null>(null);

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  // Active single project if selected
  const focusedProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Subcontractors linked to focused project
  const focusedProjectSubcontractors = useMemo(() => {
    if (!focusedProject) return [];
    return subcontractors.filter((s) => s.projectId === focusedProject.id);
  }, [focusedProject, subcontractors]);

  // Filtered projects for 'all' mode
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage =
        selectedStageFilter === 'الكل' || p.currentStage.includes(selectedStageFilter);

      const matchesStatus =
        selectedStatusFilter === 'الكل' || p.status === selectedStatusFilter;

      const matchesType =
        selectedTypeFilter === 'الكل' || p.projectType === selectedTypeFilter;

      return matchesSearch && matchesStage && matchesStatus && matchesType;
    });
  }, [projects, searchTerm, selectedStageFilter, selectedStatusFilter, selectedTypeFilter]);

  // Distinct stages list
  const stageCategories = [
    'الحفر والإحلال والأساسات',
    'الهيكل الإنشائي (العظم)',
    'أعمال التأسيس (السباكة والكهرباء MEP)',
    'اللياسة والعزل والواجهات',
    'التشطيبات النهائية والتسليم الابتدائي',
  ];

  // Delayed payments across projects
  const allDelayedPayments = useMemo(() => {
    const list: Array<ProjectPayment & { projectName: string }> = [];
    projects.forEach((proj) => {
      proj.payments.forEach((p) => {
        if (p.status === 'متأخرة' && p.remainingAmount > 0) {
          list.push({ ...p, projectName: proj.name });
        }
      });
    });
    return list;
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP CONTROL BAR: Project Focus Selector & Quick Action Buttons */}
      {/* ========================================================================= */}
      <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Main Focus Control */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm shrink-0">
              <Target className="w-5 h-5 text-amber-400" />
              <span>عرض لوحة القيادة:</span>
            </div>

            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer shadow-inner transition"
              >
                <option value="all" className="bg-slate-900 text-amber-300 font-bold py-1">
                  🏢 جميع المشاريع ({projects.length} مشاريع - نظرة مجمعة شاملة)
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white py-1">
                    📌 {p.projectCode} | {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProjectId !== 'all' && (
              <button
                onClick={() => setSelectedProjectId('all')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
                title="الرجوع إلى عرض كامل المحفظة"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>عرض الكل</span>
              </button>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onNavigateToSubcontractors && (
              <button
                onClick={onNavigateToSubcontractors}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition active:scale-95"
              >
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>مقاولو الباطن ({subcontractors.length})</span>
              </button>
            )}

            <button
              onClick={onOpenSmartImport}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>استيراد Excel</span>
            </button>

            <button
              onClick={() => onOpenAddPayment(focusedProject ? focusedProject.id : undefined)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>سند قبض</span>
            </button>

            {onOpenCreateFromContract && (
              <button
                onClick={onOpenCreateFromContract}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-slate-950 rounded-xl text-xs font-black shadow transition active:scale-95"
                title="إنشاء مشروع آلي عبر إرفاق عقد PDF واستخراج الدفعات والمدة"
              >
                <FileCheck className="w-4 h-4" />
                <span>مشروع من عقد PDF</span>
              </button>
            )}

            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>مشروع جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE MANAGER BRIEFING (الموجز التنفيذي لاطلاع المدير العام) */}
      {/* ========================================================================= */}
      <ExecutiveManagerBriefing
        projects={projects}
        subcontractors={subcontractors}
        currency={currency}
        stageAlerts={stageAlerts}
        onSelectProject={onSelectProject}
        onOpenAddPayment={onOpenAddPayment}
      />

      {/* ========================================================================= */}
      {/* MODE 1: SINGLE PROJECT FOCUSED DASHBOARD (لوحة قيادة المشروع الفردي المختار) */}
      {/* ========================================================================= */}
      {focusedProject ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Project Details Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold">
                    {focusedProject.projectCode}
                  </span>
                  {focusedProject.projectType && (
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      focusedProject.projectType === 'سباكة'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : focusedProject.projectType === 'كهرباء'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : focusedProject.projectType === 'تكييف'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : focusedProject.projectType === 'تشطيب وديكور'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {focusedProject.projectType === 'سباكة' ? '💧 سباكة' : focusedProject.projectType === 'كهرباء' ? '⚡ كهرباء' : focusedProject.projectType === 'تكييف' ? '❄️ تكييف' : focusedProject.projectType}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      focusedProject.status === 'نشط'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : focusedProject.status === 'مكتمل'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {focusedProject.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {focusedProject.location}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {focusedProject.name}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    المالك: <strong className="text-slate-200">{focusedProject.clientName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    المهندس المشرف: <strong className="text-slate-200">{focusedProject.engineerInCharge}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    فترة العقد: <span className="font-mono text-slate-300">{focusedProject.startDate}</span> إلى <span className="font-mono text-slate-300">{focusedProject.expectedEndDate}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons for this focused project */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  onClick={() => onSelectProject(focusedProject)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>نافذة التفاصيل الكاملة</span>
                </button>

                <button
                  onClick={() => onOpenAddPayment(focusedProject.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>تسجيل سند قبض</span>
                </button>

                <button
                  onClick={() => setProjectToDelete(focusedProject)}
                  className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                  title="حذف هذا المشروع بالكامل"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المشروع</span>
                </button>
              </div>
            </div>
          </div>

          {/* Focused Project Stage Alerts Banner if any */}
          {(() => {
            const focusedAlerts = stageAlerts.filter((a) => a.projectId === focusedProject.id);
            if (focusedAlerts.length === 0) return null;

            return (
              <div className="space-y-3">
                {focusedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
                      alert.type === 'completed'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : alert.type === 'overdue'
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-900/60 shrink-0 mt-0.5">
                        {alert.type === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {alert.type === 'overdue' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                        {(alert.type === 'approaching_deadline' || alert.type === 'approaching_completion') && (
                          <Clock className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white text-sm sm:text-base">{alert.title}</span>
                          <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
                            {alert.type === 'completed' ? '100% مكتملة' : formatDaysDifference(alert.daysDifference)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                        <div className="text-2xs text-slate-400 mt-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <strong className="text-slate-200">التوجيه التشغيلي:</strong>{' '}
                          <span>{alert.actionRecommendation}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProject(focusedProject)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-amber-400 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow active:scale-95"
                    >
                      <span>تحديث بيانات المرحلة</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 5 Focused Project Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Metric 1 */}
            <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="text-slate-400 text-xs font-semibold">إجمالي قيمة العقد</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1.5">
                {formatMoney(focusedProject.contractValue)}{' '}
                <span className="text-xs text-amber-400 font-semibold">{currency}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">القيمة الإجمالية المتعاقد عليها</div>
            </div>

            {/* Metric 2 */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 shadow-lg">
              <div className="text-emerald-400 text-xs font-semibold flex items-center justify-between">
                <span>المحصل الفعلي</span>
                <span className="font-bold text-2xs bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                  {focusedProject.financialProgress.toFixed(1)}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1.5">
                {formatMoney(focusedProject.totalCollected)}{' '}
                <span className="text-xs text-emerald-300 font-semibold">{currency}</span>
              </div>
              <div className="text-xs text-emerald-300/80 mt-1">من واقع سندات القبض المعتمدة</div>
            </div>

            {/* Metric 3 */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 shadow-lg">
              <div className="text-amber-400 text-xs font-semibold flex items-center justify-between">
                <span>المتبقي للتحصيل</span>
                <span className="font-bold text-2xs bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                  {(100 - focusedProject.financialProgress).toFixed(1)}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1.5">
                {formatMoney(focusedProject.totalRemaining)}{' '}
                <span className="text-xs text-amber-300 font-semibold">{currency}</span>
              </div>
              <div className="text-xs text-amber-300/80 mt-1">مستحقات معلقة بذمة العميل</div>
            </div>

            {/* Metric 4 */}
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-2xl p-4 shadow-lg">
              <div className="text-blue-400 text-xs font-semibold flex items-center justify-between">
                <span>الإنجاز الميداني</span>
                <span className="font-bold text-2xs bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">
                  {focusedProject.physicalProgress}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1.5">
                {focusedProject.physicalProgress}%
              </div>
              <div className="text-xs text-blue-300/80 mt-1 flex items-center justify-between">
                <span>فارق السيولة:</span>
                <span className={`font-bold ${focusedProject.financialProgress >= focusedProject.physicalProgress ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {focusedProject.financialProgress >= focusedProject.physicalProgress
                    ? `فائض +${(focusedProject.financialProgress - focusedProject.physicalProgress).toFixed(1)}%`
                    : `عجز ${(focusedProject.financialProgress - focusedProject.physicalProgress).toFixed(1)}%`}
                </span>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                <span>المرحلة الحالية</span>
                <span className="text-2xs font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  {focusedProject.currentStageStatus}
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-2 truncate" title={focusedProject.currentStage}>
                {focusedProject.currentStage}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${focusedProject.physicalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dual Progress Comparison Bar */}
          <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>مقارنة التدفق المالي بالتقدم الميداني لهذا المشروع</span>
              </h3>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  المحصل المالي: {focusedProject.financialProgress.toFixed(1)}%
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  الإنجاز الميداني: {focusedProject.physicalProgress}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, focusedProject.financialProgress)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-2xs text-slate-400 pt-1">
                <span>المحصل: {formatMoney(focusedProject.totalCollected)} {currency}</span>
                <span>المتبقي: {formatMoney(focusedProject.totalRemaining)} {currency}</span>
                <span>قيمة العقد: {formatMoney(focusedProject.contractValue)} {currency}</span>
              </div>
            </div>
          </div>

          {/* Project Payments Breakdown Section */}
          <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <span>جدول الدفعات والمستخلصات ({focusedProject.payments.length} دفعات)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تفاصيل المبالغ المحصلة والمتبقية وسندات القبض الخاصة بمشروع "{focusedProject.name}"
                </p>
              </div>

              <button
                onClick={() => onOpenAddPayment(focusedProject.id, 'new')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دفعة جديدة</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700/80">
                  <tr>
                    <th className="p-3">كود الدفعة</th>
                    <th className="p-3">بيان الاستحقاق</th>
                    <th className="p-3">المستحق</th>
                    <th className="p-3">المحصل الفعلي</th>
                    <th className="p-3">المتبقي</th>
                    <th className="p-3">تاريخ الاستحقاق</th>
                    <th className="p-3">سند القبض</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {focusedProject.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-amber-400">{p.paymentCode}</td>
                      <td className="p-3 font-bold text-white">{p.milestoneTitle}</td>
                      <td className="p-3 font-bold text-slate-200">{formatMoney(p.dueAmount)} {currency}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatMoney(p.collectedAmount)} {currency}</td>
                      <td className="p-3 font-bold text-amber-400">{formatMoney(p.remainingAmount)} {currency}</td>
                      <td className="p-3 font-mono text-slate-300">{p.dueDate}</td>
                      <td className="p-3 font-mono text-slate-400">
                        {p.voucherNumber ? (
                          <span className="text-emerald-400 font-bold">{p.voucherNumber}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                            p.status === 'محصلة'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'محصلة جزئياً'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : p.status === 'متأخرة'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.remainingAmount > 0 && (
                            <button
                              onClick={() => onOpenAddPayment(focusedProject.id, p.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition"
                            >
                              قبض
                            </button>
                          )}
                          <button
                            onClick={() => onSelectProject(focusedProject)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                            title="تعديل الدفعة من شاشة المشروع"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Focused Project's Subcontractors Section */}
          <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-amber-400" />
                  <span>مقاولو الباطن في هذا المشروع ({focusedProjectSubcontractors.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  بيانات الورش والمقاولين المنفذين لبنود المشروع ومستحقاتهم المالية وسندات الصرف
                </p>
              </div>

              {onNavigateToSubcontractors && (
                <button
                  onClick={onNavigateToSubcontractors}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition"
                >
                  إدارة جميع مقاولي الباطن
                </button>
              )}
            </div>

            {focusedProjectSubcontractors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {focusedProjectSubcontractors.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-3xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {sub.trade}
                        </span>
                        <h4 className="font-black text-white text-sm mt-1">{sub.name}</h4>
                        <div className="text-2xs text-slate-400 mt-0.5">{sub.phone}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSubToDelete(sub)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="حذف مقاول الباطن"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/60 rounded-lg text-xs">
                      <div>
                        <div className="text-slate-400 text-3xs">قيمة العقد</div>
                        <div className="font-bold text-white mt-0.5">{formatMoney(sub.contractValue)}</div>
                      </div>
                      <div>
                        <div className="text-rose-400 text-3xs">المسدد له</div>
                        <div className="font-bold text-rose-400 mt-0.5">{formatMoney(sub.totalPaid)}</div>
                      </div>
                      <div>
                        <div className="text-amber-400 text-3xs">المتبقي له</div>
                        <div className="font-bold text-amber-400 mt-0.5">{formatMoney(sub.totalRemaining)}</div>
                      </div>
                    </div>

                    {onOpenDisbursePayment && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => onOpenDisbursePayment(sub.id)}
                          className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>سند صرف</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-2">
                <HardHat className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-300">
                  لا يوجد مقاولو باطن مسجلون لهذا المشروع حتى الآن
                </div>
                <p className="text-xs text-slate-500">
                  يمكنك إضافة مقاولي باطن وربطهم بهذا المشروع من قسم مقاولي الباطن
                </p>
                {onNavigateToSubcontractors && (
                  <button
                    onClick={onNavigateToSubcontractors}
                    className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مقاول باطن</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: ALL PROJECTS EXECUTIVE OVERVIEW (عرض جميع المشاريع - منظم ومصفى) */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Stage Alerts Summary Banner */}
          {stageAlerts && stageAlerts.length > 0 && (
            <div className="bg-slate-850/95 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                      <span>تنبيهات المراحل التشغيلية</span>
                      <span className="px-2 py-0.5 text-2xs font-bold rounded-full bg-amber-500 text-slate-950">
                        {stageAlerts.length} تنبيهات حية
                      </span>
                    </h3>
                    <p className="text-2xs sm:text-xs text-slate-400">
                      متابعة حية للمراحل عند قرب انتهائها ومواعيد تسليمها والمراحل المكتملة حديثاً والمتأخرة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenStageNotifications && (
                    <button
                      onClick={onOpenStageNotifications}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>مركز التنبيهات الشامل</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Top 3 Stage Alerts Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {stageAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      const prj = projects.find((p) => p.id === alert.projectId);
                      if (prj) onSelectProject(prj);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition space-y-1.5 ${
                      alert.type === 'completed'
                        ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400'
                        : alert.type === 'overdue'
                        ? 'bg-rose-950/30 border-rose-500/30 hover:border-rose-400'
                        : 'bg-amber-950/30 border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-2xs">
                      <span className="font-mono text-slate-400 font-bold">{alert.projectCode}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 text-3xs ${
                        alert.type === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : alert.type === 'overdue'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {alert.type === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {alert.type === 'overdue' && <AlertTriangle className="w-2.5 h-2.5" />}
                        {(alert.type === 'approaching_deadline' || alert.type === 'approaching_completion') && (
                          <Clock className="w-2.5 h-2.5" />
                        )}
                        {alert.type === 'completed' ? 'تم الإنجاز' : formatDaysDifference(alert.daysDifference)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white truncate" title={alert.stageName}>
                      {alert.stageName}
                    </div>

                    <div className="text-3xs text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[140px]">{alert.projectName}</span>
                      <span className="font-mono text-amber-400 font-bold">{alert.completionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5 Core Metric Scorecards (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Metric 1 */}
            <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-4 shadow-lg group hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>إجمالي قيمة العقود</span>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formatMoney(kpis.totalContractValue)}{' '}
                  <span className="text-xs text-amber-400 font-semibold">{currency}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <span>{projects.length} مشاريع مسجلة</span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 shadow-lg group hover:border-emerald-700/60 transition">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                <span>إجمالي المبالغ المحصلة</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                  {formatMoney(kpis.totalCollected)}{' '}
                  <span className="text-xs text-emerald-300 font-semibold">{currency}</span>
                </div>
                <div className="text-xs text-emerald-300/80 mt-1 flex items-center justify-between">
                  <span>نسبة التحصيل:</span>
                  <span className="font-bold font-mono">{kpis.overallCollectionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 shadow-lg group hover:border-amber-700/60 transition">
              <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
                <span>إجمالي الدفعات المتبقية</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                  {formatMoney(kpis.totalRemaining)}{' '}
                  <span className="text-xs text-amber-300 font-semibold">{currency}</span>
                </div>
                <div className="text-xs text-amber-300/80 mt-1 flex items-center justify-between">
                  <span>المتبقي في الذمم:</span>
                  <span className="font-bold font-mono">
                    {(100 - kpis.overallCollectionRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-2xl p-4 shadow-lg group hover:border-blue-700/60 transition">
              <div className="flex items-center justify-between text-blue-400 text-xs font-semibold">
                <span>متوسط الإنجاز الميداني</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-blue-400 tracking-tight">
                  {kpis.averagePhysicalProgress.toFixed(1)}%
                </div>
                <div className="text-xs text-blue-300/80 mt-1 flex items-center justify-between">
                  <span>الفارق المالي الميداني:</span>
                  <span
                    className={`font-bold ${
                      kpis.overallCollectionRate >= kpis.averagePhysicalProgress
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {kpis.overallCollectionRate >= kpis.averagePhysicalProgress
                      ? `فائض +${(kpis.overallCollectionRate - kpis.averagePhysicalProgress).toFixed(1)}%`
                      : `عجز ${(kpis.overallCollectionRate - kpis.averagePhysicalProgress).toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 5 */}
            <div
              className={`rounded-2xl p-4 shadow-lg transition ${
                allDelayedPayments.length > 0
                  ? 'bg-rose-950/25 border border-rose-800/50'
                  : 'bg-slate-850/90 border border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
                <span>المستحقات المتأخرة</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
                  {allDelayedPayments.length}{' '}
                  <span className="text-xs text-rose-300 font-normal">دفعات متعثرة</span>
                </div>
                <div className="text-xs text-rose-300/80 mt-1 font-mono">
                  قيمة: {formatMoney(allDelayedPayments.reduce((acc, curr) => acc + curr.remainingAmount, 0))} {currency}
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filters, and View Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-850/80 border border-slate-800 rounded-2xl shadow-md">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم المشروع، الكود، العميل، أو الموقع..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center flex-wrap gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">المرحلة:</span>
                <select
                  value={selectedStageFilter}
                  onChange={(e) => setSelectedStageFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="الكل" className="bg-slate-900">جميع المراحل</option>
                  {stageCategories.map((stg) => (
                    <option key={stg} value={stg} className="bg-slate-900">
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 font-medium">التخصص:</span>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="الكل" className="bg-slate-900">جميع التخصصات</option>
                  <option value="سباكة" className="bg-slate-900">💧 سباكة</option>
                  <option value="كهرباء" className="bg-slate-900">⚡ كهرباء</option>
                  <option value="تكييف" className="bg-slate-900">❄️ تكييف</option>
                  <option value="مقاولات عامة وإنشائي" className="bg-slate-900">🏗️ مقاولات عامة</option>
                  <option value="تشطيب وديكور" className="bg-slate-900">🎨 تشطيب وديكور</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-medium">الحالة:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="الكل" className="bg-slate-900">الكل</option>
                  <option value="نشط" className="bg-slate-900">نشط</option>
                  <option value="مكتمل" className="bg-slate-900">مكتمل</option>
                  <option value="متعثر" className="bg-slate-900">متعثر</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'cards'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="عرض البطاقات"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'table'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="عرض الجدول المالي"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const linkedSubs = subcontractors.filter((s) => s.projectId === project.id);
                const subPaid = linkedSubs.reduce((acc, s) => acc + s.totalPaid, 0);
                const subRem = linkedSubs.reduce((acc, s) => acc + s.totalRemaining, 0);

                return (
                  <div
                    key={project.id}
                    className="bg-slate-850/85 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-amber-500/50 transition flex flex-col justify-between space-y-4 group"
                  >
                    {/* Header */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                              {project.projectCode}
                            </span>
                            {project.projectType && (
                              <span className={`px-2 py-0.5 text-3xs font-bold rounded-full border ${
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
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-amber-400 transition">
                            {project.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 text-2xs font-bold rounded-full ${
                              project.status === 'نشط'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : project.status === 'مكتمل'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {project.status}
                          </span>

                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="حذف هذا المشروع بالكامل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {project.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {project.location}
                        </span>
                      </div>
                    </div>

                    {/* Current Stage with Alert Badge */}
                    {(() => {
                      const projectAlert = stageAlerts.find((a) => a.projectId === project.id);

                      return (
                        <div className="p-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold text-2xs">المرحلة الحالية:</span>
                            <span className="font-bold text-amber-400 truncate max-w-[180px]">{project.currentStage}</span>
                          </div>

                          {projectAlert && (
                            <div className={`px-2 py-0.5 rounded-lg text-3xs font-bold flex items-center justify-between ${
                              projectAlert.type === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : projectAlert.type === 'overdue'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              <span className="flex items-center gap-1 truncate">
                                {projectAlert.type === 'completed' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                                {projectAlert.type === 'overdue' && <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />}
                                {(projectAlert.type === 'approaching_deadline' || projectAlert.type === 'approaching_completion') && (
                                  <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                )}
                                <span className="truncate">{projectAlert.title}</span>
                              </span>
                              <span className="shrink-0 font-mono text-3xs">
                                {projectAlert.type === 'completed' ? '100%' : formatDaysDifference(projectAlert.daysDifference)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-2xs text-slate-400">
                            <span>إنجاز المرحلة:</span>
                            <span className="font-mono text-white font-bold">{project.physicalProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-amber-500 h-1 rounded-full"
                              style={{ width: `${project.physicalProgress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-900/50 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <div className="text-slate-400 text-3xs">قيمة العقد</div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {formatMoney(project.contractValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-emerald-400 text-3xs">المحصل</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">
                          {formatMoney(project.totalCollected)}
                        </div>
                      </div>
                      <div>
                        <div className="text-amber-400 text-3xs">المتبقي</div>
                        <div className="text-xs font-bold text-amber-400 mt-0.5">
                          {formatMoney(project.totalRemaining)}
                        </div>
                      </div>
                    </div>

                    {/* Dual Progress Bar */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-3xs">
                        <span className="text-emerald-400 font-semibold">
                          التحصيل: {project.financialProgress.toFixed(1)}%
                        </span>
                        <span className="text-blue-400 font-semibold">
                          الميداني: {project.physicalProgress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${project.financialProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Linked Subcontractors if any */}
                    {linkedSubs.length > 0 && (
                      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-3xs">
                        <div className="flex items-center gap-1 text-amber-300 font-bold">
                          <HardHat className="w-3 h-3 text-amber-400" />
                          <span>باطن ({linkedSubs.length}):</span>
                        </div>
                        <div className="text-slate-300">
                          مسدد: <strong className="text-white">{formatMoney(subPaid)}</strong> | متبقي: <strong className="text-amber-400">{formatMoney(subRem)}</strong>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedProjectId(project.id)}
                        className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-amber-500/30 transition"
                        title="عرض هذا المشروع بمفرده في لوحة القيادة"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>عرض باللوحة</span>
                      </button>

                      <button
                        onClick={() => onSelectProject(project)}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                        title="فتح نافذة التفاصيل"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => onOpenAddPayment(project.id)}
                        className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95"
                        title="تسجيل سند قبض"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-850/80 shadow-xl">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700/80">
                  <tr>
                    <th className="p-3.5">الكود</th>
                    <th className="p-3.5">المشروع والعميل</th>
                    <th className="p-3.5">التخصص</th>
                    <th className="p-3.5">المرحلة الحالية</th>
                    <th className="p-3.5">قيمة العقد</th>
                    <th className="p-3.5">المحصل الفعلي</th>
                    <th className="p-3.5">المتبقي</th>
                    <th className="p-3.5">نسبة التحصيل</th>
                    <th className="p-3.5">الإنجاز الميداني</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-amber-400">{p.projectCode}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-2xs text-slate-400">{p.clientName} • {p.location}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {p.projectType ? (
                          <span className={`px-2 py-0.5 rounded-full text-2xs font-bold border ${
                            p.projectType === 'سباكة'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : p.projectType === 'كهرباء'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : p.projectType === 'تكييف'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                              : p.projectType === 'تشطيب وديكور'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {p.projectType === 'سباكة' ? '💧 سباكة' : p.projectType === 'كهرباء' ? '⚡ كهرباء' : p.projectType === 'تكييف' ? '❄️ تكييف' : p.projectType}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200">
                          {p.currentStage}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {formatMoney(p.contractValue)} {currency}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">
                        {formatMoney(p.totalCollected)} {currency}
                      </td>
                      <td className="p-3.5 font-bold text-amber-400 whitespace-nowrap">
                        {formatMoney(p.totalRemaining)} {currency}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">
                        {p.financialProgress.toFixed(1)}%
                      </td>
                      <td className="p-3.5 font-bold text-blue-400">{p.physicalProgress}%</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                            p.status === 'نشط'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedProjectId(p.id)}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 rounded-lg text-xs font-bold transition"
                            title="عرض هذا المشروع في اللوحة"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => onSelectProject(p)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                          >
                            تفاصيل
                          </button>
                          <button
                            onClick={() => setProjectToDelete(p)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            title="حذف المشروع"
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
          )}
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!projectToDelete}
        title="حذف مشروع المقاولات بالكامل"
        itemName={projectToDelete?.name || ''}
        itemDetails={
          projectToDelete
            ? `كود المشروع: ${projectToDelete.projectCode} • قيمة العقد: ${formatMoney(projectToDelete.contractValue)} ${currency}`
            : ''
        }
        onCancel={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (projectToDelete) {
            onDeleteProject(projectToDelete.id);
            if (selectedProjectId === projectToDelete.id) {
              setSelectedProjectId('all');
            }
            setProjectToDelete(null);
          }
        }}
        confirmButtonText="تأكيد حذف المشروع"
      />

      {/* Delete Subcontractor Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!subToDelete}
        title="حذف مقاول الباطن"
        itemName={subToDelete?.name || ''}
        itemDetails={
          subToDelete
            ? `البند: ${subToDelete.trade} • قيمة العقد: ${formatMoney(subToDelete.contractValue)} ${currency}`
            : ''
        }
        onCancel={() => setSubToDelete(null)}
        onConfirm={() => {
          if (subToDelete && onDeleteSubcontractor) {
            onDeleteSubcontractor(subToDelete.id);
            setSubToDelete(null);
          }
        }}
        confirmButtonText="تأكيد حذف مقاول الباطن"
      />
    </div>
  );
};
