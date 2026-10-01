import React, { useState } from 'react';
import { FormulaDefinition } from '../types';
import { 
  Calculator, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Smartphone, 
  BarChart3, 
  Sparkles, 
  Play, 
  HelpCircle,
  Code
} from 'lucide-react';

interface FormulasViewProps {
  formulas: FormulaDefinition[];
  currency: string;
}

export const FormulasView: React.FC<FormulasViewProps> = ({ formulas, currency }) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'financial' | 'operational' | 'kpi'>('all');

  // Interactive Live Playground State
  const [simContractValue, setSimContractValue] = useState<number>(1500000);
  const [simPaidMilestone1, setSimPaidMilestone1] = useState<number>(300000);
  const [simPaidMilestone2, setSimPaidMilestone2] = useState<number>(450000);
  const [simPaidMilestone3, setSimPaidMilestone3] = useState<number>(200000);

  const totalSimCollected = simPaidMilestone1 + simPaidMilestone2 + simPaidMilestone3;
  const totalSimRemaining = Math.max(0, simContractValue - totalSimCollected);
  const simCollectionRate = simContractValue > 0 ? (totalSimCollected / simContractValue) * 100 : 0;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2500);
  };

  const filteredFormulas = formulas.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                موسوعة الدوال الحسابية المعتمدة
              </span>
              <span className="text-xs text-slate-400">Google Sheets + AppSheet + Looker Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              معادلات حساب المحصل، المتبقي، ونسب الإنجاز التشغيلي
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              مرجع شامل ومقارن لأدق المعادلات المطلوبة لإدارة مشاريع المقاولات. يمكنك نسخ أي صيغة بنقرة واحدة وتطبيقها فوراً في جداول Google Sheets أو في تعبيرات AppSheet الافتراضية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-amber-400">
              {formulas.length} معادلات جاهزة
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Formula Playground (مختبر المعادلات التفاعلي) */}
      <div className="bg-gradient-to-br from-slate-850 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                مختبر الحساب الفوري (Formula Sandbox)
              </h3>
              <p className="text-xs text-slate-400">
                عدّل القيم أدناه وشاهد كيف تحسب الدوال المتبقي ونسب الإنجاز في الوقت الفعلي
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
            Live Evaluator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 text-xs mb-1 font-semibold">
              إجمالي قيمة العقد (Contract_Value)
            </label>
            <input
              type="number"
              value={simContractValue}
              onChange={(e) => setSimContractValue(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 font-semibold">
              المحصل في المرحلة 1 (دفعة مقدمة)
            </label>
            <input
              type="number"
              value={simPaidMilestone1}
              onChange={(e) => setSimPaidMilestone1(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 font-semibold">
              المحصل في المرحلة 2 (الأساسات)
            </label>
            <input
              type="number"
              value={simPaidMilestone2}
              onChange={(e) => setSimPaidMilestone2(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 font-semibold">
              المحصل في المرحلة 3 (العظم)
            </label>
            <input
              type="number"
              value={simPaidMilestone3}
              onChange={(e) => setSimPaidMilestone3(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Live Evaluated Output Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-center">
            <div className="text-2xs text-emerald-300 font-semibold">
              [Total_Collected] = SUM(Milestones)
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatMoney(totalSimCollected)} {currency}
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-center">
            <div className="text-2xs text-amber-300 font-semibold">
              [Total_Remaining] = [Contract] - [Collected]
            </div>
            <div className="text-lg font-black text-amber-400 mt-1">
              {formatMoney(totalSimRemaining)} {currency}
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-center">
            <div className="text-2xs text-blue-300 font-semibold">
              [Collection_Percentage] = ([Collected] / [Contract]) * 100
            </div>
            <div className="text-lg font-black text-blue-400 mt-1">
              {simCollectionRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          جميع المعادلات ({formulas.length})
        </button>
        <button
          onClick={() => setSelectedCategory('financial')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedCategory === 'financial'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          المعادلات المالية (المحصل والمتبقي)
        </button>
        <button
          onClick={() => setSelectedCategory('operational')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedCategory === 'operational'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          المعادلات التشغيلية (المراحل والحالات)
        </button>
        <button
          onClick={() => setSelectedCategory('kpi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedCategory === 'kpi'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          مؤشرات الأداء والرسوم (KPIs & Sparklines)
        </button>
      </div>

      {/* Formulas List */}
      <div className="space-y-4">
        {filteredFormulas.map((item) => (
          <div
            key={item.id}
            className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
          >
            {/* Title and Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                  item.category === 'financial'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : item.category === 'operational'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {item.category === 'financial'
                  ? 'مالي'
                  : item.category === 'operational'
                  ? 'تشغيلي / مراحل'
                  : 'مؤشر أداء KPI'}
              </span>
            </div>

            {/* Side-by-side formula code boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
              {/* Google Sheets Formula */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>صيغة Google Sheets:</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.googleSheetsFormula, `${item.id}-sheets`)}
                    className="flex items-center gap-1 text-2xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                  >
                    {copiedFormula === `${item.id}-sheets` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ الصيغة</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-emerald-300 text-xs overflow-x-auto select-all border border-slate-800/80">
                  {item.googleSheetsFormula}
                </div>
              </div>

              {/* AppSheet Formula */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Smartphone className="w-4 h-4" />
                    <span>تعبير AppSheet (App Formula / Virtual Column):</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.appSheetFormula, `${item.id}-appsheet`)}
                    className="flex items-center gap-1 text-2xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                  >
                    {copiedFormula === `${item.id}-appsheet` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ الصيغة</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-amber-300 text-xs overflow-x-auto select-all border border-slate-800/80 whitespace-pre">
                  {item.appSheetFormula}
                </div>
              </div>
            </div>

            {/* Looker Studio Calculated Field (if present) */}
            {item.lookerStudioFormula && (
              <div className="p-3 bg-slate-900/60 border border-blue-900/40 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-blue-300 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>الحقل المحسوب في Google Looker Studio (Calculated Field):</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.lookerStudioFormula!, `${item.id}-looker`)}
                    className="flex items-center gap-1 text-2xs px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                  >
                    {copiedFormula === `${item.id}-looker` ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
                <div className="font-mono text-blue-200 text-xs bg-slate-950 p-2 rounded border border-slate-800">
                  {item.lookerStudioFormula}
                </div>
              </div>
            )}

            {/* Explanation & Best Practice */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>كيف تعمل وأفضل الممارسات التنفيذية:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{item.explanation}</p>
              <div className="text-slate-400 pt-1 border-t border-slate-700/50">
                <strong>توصية المهندس:</strong> {item.bestPractice}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
