import React, { useState } from 'react';
import { 
  BarChart3, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  Table, 
  PieChart, 
  TrendingUp, 
  Copy, 
  Check, 
  Calendar, 
  Sliders, 
  Mail,
  ShieldAlert
} from 'lucide-react';

export const LookerStudioView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const calculatedFields = [
    {
      id: 'cf-rate',
      name: 'نسبة التحصيل المالي (Collection Rate %)',
      formula: `SUM(Collected_Amount) / SUM(Contract_Value)`,
      type: 'Percent (نسبة مئوية)',
      usage: 'يستخدم في بطاقات الأداء ومقارنة الإنجاز المالي بالميداني.',
    },
    {
      id: 'cf-remaining',
      name: 'إجمالي المتبقي (Total Remaining)',
      formula: `SUM(Contract_Value) - SUM(Collected_Amount)`,
      type: 'Currency (SAR)',
      usage: 'يستخدم كعمود في الرسم البياني المشترك (Combo Chart).',
    },
    {
      id: 'cf-aging',
      name: 'تصنيف أعمار الديون (Payment Aging Bucket)',
      formula: `CASE 
  WHEN Payment_Status = "محصلة" THEN "محصلة"
  WHEN DATE_DIFF(CURRENT_DATE(), Due_Date) <= 0 THEN "قيد الاستحقاق (أقل من الموعد)"
  WHEN DATE_DIFF(CURRENT_DATE(), Due_Date) <= 30 THEN "متأخرة 1-30 يوم"
  WHEN DATE_DIFF(CURRENT_DATE(), Due_Date) <= 60 THEN "متأخرة 31-60 يوم"
  ELSE "متأخرة أكثر من 60 يوم (حرجة)" 
END`,
      type: 'Text (Dimension)',
      usage: 'لفرز الدفعات المتأخرة حسب خطورتها وعرضها في مخطط دائري.',
    },
    {
      id: 'cf-stage-risk',
      name: 'فارق الإنجاز المالي والتشغيلي (Cash vs Site Variance)',
      formula: `(SUM(Collected_Amount) / SUM(Contract_Value)) - AVG(Physical_Progress)`,
      type: 'Percent (نسبة مئوية)',
      usage: 'إذا كانت النتيجة سالبة فالمقاول يمول المشروع من جيبه الخاص، وإذا كانت موجبة فالسيولة آمنة.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Google Looker Studio Blueprint
              </span>
              <span className="text-xs text-slate-400">لوحات قيادة تنفيذية تفاعلية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              مخطط وتصميم لوحة القيادة لشركة المقاولات في Looker Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              دليل عملي وهندسي خطوة بخطوة لربط جداول Google Sheets بـ Google Looker Studio، وتكوين الرسوم البيانية، بطاقات الأداء، الحقول المحسوبة، والفلاتر التنفيذية.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="https://lookerstudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg"
            >
              <span>فتح Google Looker Studio</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Looker Studio Dashboard Visual Layout Mockup */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              هيكل توزيع العناصر في لوحة التحكم (Dashboard Layout Blueprint)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Canvas: 1600 × 1000 px (Landscape)
          </span>
        </div>

        {/* Visual Mock canvas */}
        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-800 space-y-4">
          {/* Top Filter Strip */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>فلاتر التحكم (Controls Strip):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                ▼ فلتر المشروع (Drop-down List: Project_Name)
              </span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                ▼ فلتر المرحلة (Drop-down List: Current_Stage)
              </span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                ▼ فلتر العميل (Drop-down List: Client_Name)
              </span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                📅 نطاق التاريخ (Date Range Control)
              </span>
            </div>
          </div>

          {/* Scorecards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/90 border border-slate-850 rounded-xl text-center">
              <div className="text-2xs text-slate-400">Scorecard 1</div>
              <div className="font-bold text-white mt-1">إجمالي قيمة العقود</div>
              <div className="text-base font-black text-amber-400 font-mono">SUM(Contract_Value)</div>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-850 rounded-xl text-center">
              <div className="text-2xs text-slate-400">Scorecard 2</div>
              <div className="font-bold text-emerald-400 mt-1">المحصل الفعلي</div>
              <div className="text-base font-black text-emerald-400 font-mono">SUM(Collected_Amount)</div>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-850 rounded-xl text-center">
              <div className="text-2xs text-slate-400">Scorecard 3</div>
              <div className="font-bold text-amber-400 mt-1">الدفعات المتبقية</div>
              <div className="text-base font-black text-amber-400 font-mono">SUM(Remaining_Amount)</div>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-850 rounded-xl text-center">
              <div className="text-2xs text-slate-400">Scorecard 4</div>
              <div className="font-bold text-blue-400 mt-1">نسبة التحصيل العام</div>
              <div className="text-base font-black text-blue-400 font-mono">Collection Rate %</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Chart 1: رسم بياني شريطي مكدس أو مزدوج (Stacked Combo Chart)</span>
                <span className="text-2xs text-amber-400">Dimension: Project_Name</span>
              </div>
              <div className="h-28 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                📊 أعمدة متجاورة تقارن: [قيمة العقد] مقابل [المحصل] مقابل [المتبقي] لكل مشروع على حدة
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Chart 2: مخطط دائري (Donut)</span>
                <span className="text-2xs text-amber-400">Dimension: Current_Stage</span>
              </div>
              <div className="h-28 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500 text-center p-2">
                🍩 نسبة المشاريع في كل مرحلة: الأساسات 25%، العظم 50%، التشطيبات 25%
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>Table with Heatmap: جدول تفاصيل الدفعات والمستخلصات (Detailed Payments Table)</span>
              <span className="text-2xs text-slate-400 font-mono">Row dimension: Payment_Title</span>
            </div>
            <div className="h-20 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500">
              📋 أعمدة الجدول: [اسم المشروع] | [المرحلة] | [المبلغ المستحق] | [المحصل] | [المتبقي] | [تاريخ الاستحقاق] | [الحالة]
            </div>
          </div>
        </div>
      </div>

      {/* Looker Studio Calculated Fields (الحقول المحسوبة) */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">
                معادلات الحقول المحسوبة في Looker Studio (Calculated Fields)
              </h3>
              <p className="text-xs text-slate-400">
                أضف هذه الحقول عبر النقر على "Add Field" في مصدر البيانات داخل Looker Studio
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculatedFields.map((cf) => (
            <div
              key={cf.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{cf.name}</h4>
                <span className="font-mono text-2xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {cf.type}
                </span>
              </div>

              <div className="relative">
                <pre className="p-2.5 bg-slate-950 rounded-lg font-mono text-cyan-300 text-xs overflow-x-auto border border-slate-800/80 whitespace-pre">
                  {cf.formula}
                </pre>
                <button
                  onClick={() => handleCopy(cf.formula, cf.id)}
                  className="absolute left-2 top-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-2xs flex items-center gap-1 transition"
                >
                  {copiedCode === cf.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-slate-400 text-2xs leading-relaxed">
                <strong>الاستخدام:</strong> {cf.usage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Executive Looker Studio Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tip 1: Data Blending */}
        <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>دمج البيانات (Data Blending) بدون تكرار:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            عند ربط جدول المشاريع (Projects) مع جدول الدفعات (Payments)، استخدم دمج من نوع <strong>Left Outer Join</strong> مع تعيين <strong>Project_ID</strong> كمفتاح انضمام (Join Condition). تأكد من تجنب مضاعفة قيمة العقد عند تكرار الدفعات عن طريق اختيار دالة <strong>MAX(Contract_Value)</strong> بدلاً من SUM في التقارير المجمعة.
          </p>
        </div>

        {/* Tip 2: Automated Email Delivery */}
        <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>جدولة الإرسال التلقائي (Scheduled Email Report):</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            في Looker Studio، انقر على سهم المشاركة ثم اختر <strong>Schedule delivery</strong>. اضبط الإرسال صباح كل يوم أحد ليرسل ملف PDF باللوحة مباشرة إلى إيميل الملاك والمدير المالي دون الحاجة لفتح الرابط يدوياً!
          </p>
        </div>
      </div>
    </div>
  );
};
