import React from 'react';
import { 
  Building2, 
  Database, 
  Calculator, 
  BarChart3, 
  BookOpen, 
  Plus, 
  DollarSign, 
  Download,
  Layers,
  Sparkles,
  UploadCloud,
  HardHat,
  Bell,
  FileCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'subcontractors' | 'schema' | 'formulas' | 'looker' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'subcontractors' | 'schema' | 'formulas' | 'looker' | 'guide') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  onOpenAddPayment: () => void;
  onOpenAddProject: () => void;
  onOpenSmartImport: () => void;
  onExportCSV: () => void;
  stageAlertsCount?: number;
  onOpenStageNotifications?: () => void;
  onOpenCreateFromContract?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenAddPayment,
  onOpenAddProject,
  onOpenSmartImport,
  onExportCSV,
  stageAlertsCount = 0,
  onOpenStageNotifications,
  onOpenCreateFromContract,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all">
      {/* Top Banner / Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  بنيان <span className="text-amber-400 font-extrabold text-lg">PRO</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  AppSheet + Looker Studio
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                نظام إدارة المقاولات: تتبع التحصيل المالي والمراحل التشغيلية
              </p>
            </div>
          </div>

          {/* Quick Actions & Currency Switcher */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 text-xs">
              <span className="px-2 text-slate-400 font-medium">العملة:</span>
              {(['ر.س', 'USD', 'د.إ', 'ج.م'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 rounded-md transition-all font-semibold ${
                    currency === curr
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Stage Alerts Bell Button */}
            {onOpenStageNotifications && (
              <button
                onClick={onOpenStageNotifications}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-amber-500/40 hover:border-amber-400 rounded-lg text-xs sm:text-sm font-bold shadow-md transition active:scale-95 group"
                title="تنبيهات المراحل التشغيلية: اقتراب موعد التسليم والمراحل المكتملة والمتأخرة"
              >
                <div className="relative">
                  <Bell className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                  {stageAlertsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  )}
                </div>
                <span>تنبيهات المراحل</span>
                {stageAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-2xs font-black bg-amber-500 text-slate-950 rounded-full shadow-sm">
                    {stageAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Smart Import Button */}
            <button
              onClick={onOpenSmartImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-blue-900/30 transition active:scale-95"
              title="استيراد وقراءة ملفات إكسل للمشاريع والدفعات القديمة"
            >
              <UploadCloud className="w-4 h-4" />
              <span>استيراد ملفات Excel</span>
            </button>

            {/* Quick Record Payment Button */}
            <button
              onClick={onOpenAddPayment}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/30 transition active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>تسجيل سند قبض</span>
            </button>

            {/* Create Project from Contract PDF Button */}
            {onOpenCreateFromContract && (
              <button
                onClick={onOpenCreateFromContract}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-slate-950 rounded-lg text-xs sm:text-sm font-black shadow-md shadow-amber-900/30 transition active:scale-95"
                title="إنشاء مشروع آلي عبر إرفاق عقد PDF واستخراج الدفعات والمدة"
              >
                <FileCheck className="w-4 h-4" />
                <span>مشروع من عقد PDF</span>
              </button>
            )}

            {/* Quick Add Project Button */}
            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs sm:text-sm font-black shadow-md shadow-amber-900/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>مشروع جديد</span>
            </button>

            {/* Export CSV button */}
            <button
              onClick={onExportCSV}
              title="تصدير بيانات الشيت بصيغة CSV لفتحها في Google Sheets"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تصدير Google Sheets</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>لوحة القيادة التفاعلية (Live Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('subcontractors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'subcontractors'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>مقاولو الباطن (Subcontractors)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'schema'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>هيكل قاعدة البيانات (Database Schema)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'formulas'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>مكتبة المعادلات (Formulas & AppSheet)</span>
          </button>

          <button
            onClick={() => setActiveTab('looker')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'looker'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>دليل Looker Studio للداشبورد</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دليل التنفيذ خطوة بخطوة (Step-by-Step)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
