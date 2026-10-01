import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  FileSpreadsheet, 
  Smartphone, 
  BarChart3, 
  Sparkles, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Layers, 
  Link2,
  Share2,
  BellRing
} from 'lucide-react';

export const GuideView: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'step-1-1': true,
    'step-1-2': true,
  });

  const [expandedPhase, setExpandedPhase] = useState<number>(1);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const phases = [
    {
      id: 1,
      title: 'المرحلة الأولى: إعداد قاعدة بيانات Google Sheets بدقة واحترافية',
      description: 'تجهيز الشيت والجداول الأربعة وتعيين أنواع البيانات والمفاتيح الأساسية لمنع أخطاء الربط.',
      icon: FileSpreadsheet,
      steps: [
        {
          id: 'step-1-1',
          title: 'إنشاء ملف Google Sheets جديد وتسميته',
          details: 'قم بإنشاء جدول بيانات جديد على Google Drive وسمّه مثلاً: "قاعدة بيانات إدارة مشاريع المقاولات".',
        },
        {
          id: 'step-1-2',
          title: 'إنشاء التبويبات الأربعة (Sheets Tabs)',
          details: 'أنشئ 4 تبويبات بالأسماء الإنجليزية لضمان توافق AppSheet: [Projects]، [Project_Stages]، [Project_Payments]، [Clients].',
        },
        {
          id: 'step-1-3',
          title: 'لصق رؤوس الأعمدة (Header Rows) في الصف رقم 1',
          details: 'انسخ رؤوس الأعمدة من تبويب "هيكل قاعدة البيانات" في نظامنا وضعها في الصف الأول بالضبط دون أي صفوف فارغة فوقها.',
        },
        {
          id: 'step-1-4',
          title: 'ضبط تنسيق الأعمدة (Data Formatting)',
          details: 'حدد أعمدة المبالغ (Contract_Value, Due_Amount, Collected_Amount) واضبط تنسيقها كـ "عملة" (Currency). وأعمدة التواريخ كـ "تاريخ" (Date YYYY-MM-DD).',
        },
      ],
    },
    {
      id: 2,
      title: 'المرحلة الثانية: بناء تطبيق الهاتف الميداني عبر Google AppSheet',
      description: 'ربط الجداول، ضبط المفاتيح والعلاقات (Ref)، إنشاء الأعمدة الافتراضية، وتصميم الواجهات للمهندسين.',
      icon: Smartphone,
      steps: [
        {
          id: 'step-2-1',
          title: 'بدء تطبيق AppSheet من داخل الشيت',
          details: 'من داخل Google Sheets، اضغط على Extensions (الإضافات) ثم اختر AppSheet > Create an App. سيقوم AppSheet بإنشاء تطبيق تلقائياً وربط جدول المشاريع.',
        },
        {
          id: 'step-2-2',
          title: 'إضافة باقي الجداول (Add Tables)',
          details: 'في منصة AppSheet، اذهب إلى Data > Tables واضغط على (+) لإضافة الجداول الثلاثة المتبقية: Project_Stages, Project_Payments, Clients.',
        },
        {
          id: 'step-2-3',
          title: 'ضبط أنواع الأعمدة والعلاقات (Column Types & Ref)',
          details: 'في جدول Project_Payments، اجعل نوع عمود Project_ID هو [Ref] وأشر إلى جدول Projects. ونفس الشيء في جدول Project_Stages. هذا يولد تلقائياً قائمة الدفعات والمراحل داخل صفحة كل مشروع (Related Payments & Related Stages)!',
        },
        {
          id: 'step-2-4',
          title: 'إضافة الأعمدة الافتراضية (Virtual Columns)',
          details: 'في جدول Projects، اضغط Add Virtual Column وأضف: 1) [Total_Collected] بالمعادلة: SUM(SELECT(Project_Payments[Collected_Amount], [Project_ID] = [_THISROW].[Project_ID])) و 2) [Total_Remaining] بالمعادلة: [Contract_Value] - [Total_Collected].',
        },
        {
          id: 'step-2-5',
          title: 'تصميم الواجهات (Views & UX)',
          details: 'اذهب إلى Navigation / Views وأنشئ: 1) Deck View لعرض بطاقات المشاريع مع نسبة التحصيل، 2) Table View لسندات القبض، 3) Form View لتسهيل تسجيل المهندس للدفعات من الموقع.',
        },
        {
          id: 'step-2-6',
          title: 'إنشاء إجراء سريع لسند القبض (Action Button)',
          details: 'في تبويب Actions، أنشئ إجراء باسم "تحصيل الدفعة" لتسجيل تاريخ اليوم تلقائياً وتحديث حالة الدفعة إلى "محصلة" بنقرة واحدة.',
        },
      ],
    },
    {
      id: 3,
      title: 'المرحلة الثالثة: بناء لوحة القيادة التنفيذية في Google Looker Studio',
      description: 'ربط مصدر البيانات، تصميم الرسوم البيانية المتطورة، وحساب مؤشرات السيولة ومتابعة التعثر.',
      icon: BarChart3,
      steps: [
        {
          id: 'step-3-1',
          title: 'تسجيل الدخول وإضافة مصدر البيانات (Add Data Source)',
          details: 'افتح lookerstudio.google.com واضغط "Create" > "Report". اختر موصل Google Sheets، ثم اختر ملف الشيت الخاص بك وتبويب [Projects].',
        },
        {
          id: 'step-3-2',
          title: 'إضافة جدول الدفعات ودمج البيانات (Data Blend)',
          details: 'اضغط Resource > Manage blends > Add a blend. اربط جدول Projects مع جدول Project_Payments عبر Left Join باستخدام مفتاح Project_ID.',
        },
        {
          id: 'step-3-3',
          title: 'إنشاء الحقول المحسوبة (Calculated Fields)',
          details: 'انسخ معادلات الحقول المحسوبة من تبويب "دليل Looker Studio" مثل [Collection Rate %] و [Aging Bucket] لتصنيف الديون المتأخرة.',
        },
        {
          id: 'step-3-4',
          title: 'إدراج بطاقات الأداء (Scorecards)',
          details: 'أضف 4 بطاقات أداء رئيسية في أعلى الصفحة: إجمالي قيمة العقود، المحصل الفعلي، المتبقي غير المحصل، ونسبة التحصيل العام.',
        },
        {
          id: 'step-3-5',
          title: 'إدراج الرسوم البيانية التفاعلية',
          details: 'أضف Combo Chart يقارن المبالغ المحصلة والمتبقية لكل مشروع، ومخطط Donut لتوزيع مراحل البناء، وجدول تفصيلي بالدفعات المتأخرة.',
        },
        {
          id: 'step-3-6',
          title: 'إضافة فلاتر التحكم ونشر التقرير (Controls & Sharing)',
          details: 'أضف Drop-down list لاختيار اسم المشروع، والمرحلة الحالية، ونطاق التاريخ. ثم اضغط Share لمشاركة اللوحة برابط قراءة فقط مع مجلس الإدارة والملاك.',
        },
      ],
    },
    {
      id: 4,
      title: 'المرحلة الرابعة: أفضل الممارسات التشغيلية لشركات المقاولات',
      description: 'نصائح وحلول للمشاكل الواقعية: أوامر التغيير، الدفعات المحتجزة (Retention)، وإشعارات واتساب.',
      icon: Sparkles,
      steps: [
        {
          id: 'step-4-1',
          title: 'إدارة أوامر التغيير (Variation Orders)',
          details: 'عند إضافة بنود إضافية خارج العقد الأصلي، لا تعدل قيمة العقد الأصلية يدوياً؛ بل أضف دفعة جديدة في جدول الدفعات من نوع "أمر تغيير" لتتبع الزيادات بشفافية تامة.',
        },
        {
          id: 'step-4-2',
          title: 'التعامل مع الدفعة المحتجزة للضمان (Retention 5% - 10%)',
          details: 'خصص آخر دفعة في جدول المستخلصات باسم "دفعة إفراج محتجز الضمان" وضع تاريخ استحقاقها بعد سنة كاملة من تاريخ التسليم الابتدائي لضمان متابعة استردادها.',
        },
        {
          id: 'step-4-3',
          title: 'ربط إشعارات الواتساب والبريد التلقائي (Automation Bot)',
          details: 'في AppSheet > Automation، أنشئ Bot يرسل رسالة فورية إلى الإدارة والعميل فور تسجيل أي سند قبض جديد مرفقاً برقم السند والمبلغ والمتبقي.',
        },
      ],
    },
  ];

  const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = (completedCount / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                خارطة طريق التنفيذ العملي (Implementation Roadmap)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              دليل الربط والتنفيذ خطوة بخطوة (Step-by-Step Manual)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              اتبّع هذا الدليل التسلسلي لبناء وتشغيل منظومة المقاولات الرقمية من الصفر: بدءاً من إعداد ملف Google Sheets، ثم برمجة تطبيق AppSheet الميداني، وانتهاءً بتصميم لوحة Looker Studio ومشاركتها مع الإدارة.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 min-w-[200px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-semibold">
              <span>نسبة إنجاز التهيئة:</span>
              <span className="font-mono text-amber-400 font-bold">
                {completedCount} من {totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Phases list */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const PhaseIcon = phase.icon;
          const isExpanded = expandedPhase === phase.id;

          const phaseCompletedSteps = phase.steps.filter((s) => completedSteps[s.id]).length;

          return (
            <div
              key={phase.id}
              className="bg-slate-850/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
            >
              {/* Phase Header */}
              <div
                onClick={() => setExpandedPhase(isExpanded ? 0 : phase.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition select-none"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <PhaseIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">{phase.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{phase.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xs font-mono px-2 py-1 bg-slate-800 rounded-lg text-slate-300">
                    {phaseCompletedSteps} / {phase.steps.length} مكتمل
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Phase Body */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 space-y-3 bg-slate-900/40">
                  <div className="space-y-2.5 pt-3">
                    {phase.steps.map((step) => {
                      const isDone = !!completedSteps[step.id];

                      return (
                        <div
                          key={step.id}
                          onClick={() => toggleStep(step.id)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500" />
                            )}
                          </div>

                          <div className="space-y-1 flex-1">
                            <h4
                              className={`text-sm font-bold ${
                                isDone ? 'text-emerald-300 line-through opacity-85' : 'text-white'
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {step.details}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
