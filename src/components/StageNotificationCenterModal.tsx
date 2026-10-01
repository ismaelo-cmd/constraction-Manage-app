import React, { useState, useMemo } from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Search,
  Filter,
  DollarSign,
  Building2,
  CheckCheck
} from 'lucide-react';
import { StageAlert, StageAlertType, ProjectType } from '../types';
import { getAlertBadgeStyle, formatDaysDifference } from '../utils/stageAlerts';

interface StageNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: StageAlert[];
  onSelectProject: (projectId: string) => void;
  onOpenRecordPayment?: (projectId: string) => void;
  currency?: string;
}

export const StageNotificationCenterModal: React.FC<StageNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectProject,
  onOpenRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'approaching' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Filter out dismissed alerts
  const visibleAlerts = useMemo(() => {
    return alerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [alerts, dismissedAlertIds]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      all: visibleAlerts.length,
      approaching: visibleAlerts.filter(
        (a) => a.type === 'approaching_deadline' || a.type === 'approaching_completion'
      ).length,
      completed: visibleAlerts.filter((a) => a.type === 'completed').length,
      overdue: visibleAlerts.filter((a) => a.type === 'overdue').length,
    };
  }, [visibleAlerts]);

  // Filtered by active tab, search, and type
  const filteredAlerts = useMemo(() => {
    return visibleAlerts.filter((alert) => {
      // Tab filter
      if (activeTab === 'approaching') {
        if (alert.type !== 'approaching_deadline' && alert.type !== 'approaching_completion') {
          return false;
        }
      } else if (activeTab === 'completed') {
        if (alert.type !== 'completed') return false;
      } else if (activeTab === 'overdue') {
        if (alert.type !== 'overdue') return false;
      }

      // Project type filter
      if (selectedType !== 'all') {
        if (alert.projectType !== selectedType) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesStage = alert.stageName.toLowerCase().includes(q);
        const matchesProject = alert.projectName.toLowerCase().includes(q);
        const matchesCode = alert.projectCode.toLowerCase().includes(q);
        if (!matchesStage && !matchesProject && !matchesCode) return false;
      }

      return true;
    });
  }, [visibleAlerts, activeTab, selectedType, searchQuery]);

  if (!isOpen) return null;

  const handleDismissAll = () => {
    setDismissedAlertIds(alerts.map((a) => a.id));
  };

  const handleDismissSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  مركز تنبيهات ومتابعة المراحل التشغيلية
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                  {visibleAlerts.length} تنبيهات حية
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إشعارات تلقائية عند قرب انتهاء المراحل الميدانية، وعند اكتمالها، ومتابعة التأخيرات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {visibleAlerts.length > 0 && (
              <button
                onClick={handleDismissAll}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                title="تحديد كل التنبيهات كمقروءة"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>مسح الكل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>جميع التنبيهات</span>
              <span className={`px-1.5 py-0.2 rounded text-2xs ${activeTab === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approaching')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'approaching'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>قرب انتهاء المرحلة</span>
              <span className={`px-1.5 py-0.2 rounded text-2xs ${activeTab === 'approaching' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {counts.approaching}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تم إنجازها حديثاً</span>
              <span className={`px-1.5 py-0.2 rounded text-2xs ${activeTab === 'completed' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {counts.completed}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'overdue'
                  ? 'bg-rose-500 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>متأخرة عن المخطط</span>
              <span className={`px-1.5 py-0.2 rounded text-2xs ${activeTab === 'overdue' ? 'bg-slate-950/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {counts.overdue}
              </span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المرحلة أو المشروع أو الكود..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              التخصص:
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
            >
              <option value="all">جميع التخصصات</option>
              <option value="سباكة">💧 سباكة</option>
              <option value="كهرباء">⚡ كهرباء</option>
              <option value="تكييف">❄️ تكييف</option>
              <option value="مقاولات عامة وإنشائي">🏗️ مقاولات عامة</option>
              <option value="تشطيب وديكور">🎨 تشطيب وديكور</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-base">لا توجد تنبيهات تطابق البحث أو الفلتر المحدد</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                جميع المراحل التشغيلية تسير وفق الجدول الزمني المحدد دون وجود مواعيد تسليم وشيكة أو تأخيرات معلقة.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = getAlertBadgeStyle(alert.type, alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${style.bg} ${style.border} transition hover:shadow-lg space-y-3`}
                >
                  {/* Top line: Project info and badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-slate-900/80 text-amber-400 border border-slate-700">
                        {alert.projectCode}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {alert.projectName}
                      </span>
                      {alert.projectType && (
                        <span className="px-2 py-0.5 text-2xs rounded-full bg-slate-900/60 text-slate-300 border border-slate-700">
                          {alert.projectType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full inline-flex items-center gap-1 ${style.badgeBg}`}>
                        {alert.type === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {alert.type === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {alert.type === 'approaching_deadline' && <Clock className="w-3.5 h-3.5" />}
                        {alert.type === 'approaching_completion' && <Sparkles className="w-3.5 h-3.5" />}
                        {alert.type === 'completed'
                          ? 'مرحلة مكتملة بنجاح'
                          : formatDaysDifference(alert.daysDifference)}
                      </span>
                      <button
                        onClick={(e) => handleDismissSingle(alert.id, e)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded"
                        title="إخفاء التنبيه"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stage Details */}
                  <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xs">
                          {alert.stageOrder}
                        </span>
                        <h4 className="font-bold text-white text-sm">{alert.stageName}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">الإنجاز:</span>
                        <span className="font-mono font-bold text-amber-400">{alert.completionRate}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          alert.completionRate === 100
                            ? 'bg-emerald-500'
                            : alert.completionRate >= 80
                            ? 'bg-amber-400'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${alert.completionRate}%` }}
                      />
                    </div>

                    {/* Timeline dates */}
                    <div className="flex items-center justify-between text-2xs text-slate-400 pt-1">
                      <span>البدء المخطط: {alert.plannedStartDate}</span>
                      <span>الانتهاء المخطط: {alert.plannedEndDate}</span>
                      {alert.actualEndDate && (
                        <span className="text-emerald-400 font-semibold">
                          الانتهاء الفعلي: {alert.actualEndDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Alert Message & Advisory Recommendation */}
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-medium text-slate-200">{alert.message}</p>
                    <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-800 flex items-start gap-2 text-2xs text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-300">التوجيه التشغيلي: </strong>
                        <span>{alert.actionRecommendation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {alert.type === 'completed' && onOpenRecordPayment && (
                      <button
                        onClick={() => {
                          onOpenRecordPayment(alert.projectId);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1 active:scale-95"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>تسجيل سند قبض / مستخلص</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectProject(alert.projectId);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow transition flex items-center gap-1 active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>عرض المشروع وتحديث المرحلة</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            يتم تحديث التنبيهات تلقائياً بمجرد تعديل نسب الإنجاز أو تواريخ المراحل.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
