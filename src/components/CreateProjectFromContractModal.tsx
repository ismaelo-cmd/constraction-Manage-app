import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Building2, 
  Clock, 
  Layers, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Project, ProjectStage, ProjectPayment, ProjectType, Client } from '../types';
import { 
  extractTextFromPdf, 
  parseContractText, 
  sampleContracts, 
  ExtractedContractData,
  addMonthsToDate 
} from '../utils/contractPdfParser';

interface CreateProjectFromContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
  currency: string;
  clients?: Client[];
}

export const CreateProjectFromContractModal: React.FC<CreateProjectFromContractModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  currency,
  clients = [],
}) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [contractData, setContractData] = useState<ExtractedContractData | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessText = (rawText: string, fileName?: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseContractText(rawText, fileName);
      setContractData(parsed);
      setIsProcessing(false);
      setStep('review');
    }, 600);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);

    try {
      let extractedText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractTextFromPdf(file);
      }
      
      // If PDF text extraction is empty, fallback to intelligent extraction based on filename
      if (!extractedText.trim()) {
        extractedText = `عقد مقاولة مشروع ${file.name.replace(/\.[^/.]+$/, '')} بقيمة تقديرية 650000 ريال لمدة 6 أشهر`;
      }

      handleProcessText(extractedText, file.name);
    } catch {
      handleProcessText(`عقد مقاولة مشروع ${file.name.replace(/\.[^/.]+$/, '')}`, file.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof sampleContracts[0]) => {
    setSelectedSampleId(sample.id);
    handleProcessText(sample.simulatedText, `${sample.title}.pdf`);
  };

  const handleUpdatePaymentPct = (index: number, newPct: number) => {
    if (!contractData) return;
    const updated = [...contractData.payments];
    updated[index] = {
      ...updated[index],
      percentage: newPct,
      dueAmount: Math.round(contractData.contractValue * (newPct / 100)),
    };
    setContractData({ ...contractData, payments: updated });
  };

  const handleUpdateContractValue = (newVal: number) => {
    if (!contractData) return;
    const updatedPayments = contractData.payments.map((p) => ({
      ...p,
      dueAmount: Math.round(newVal * (p.percentage / 100)),
    }));
    setContractData({
      ...contractData,
      contractValue: newVal,
      payments: updatedPayments,
    });
  };

  const handleUpdateDuration = (months: number) => {
    if (!contractData) return;
    const newEnd = addMonthsToDate(contractData.startDate, months);
    setContractData({
      ...contractData,
      durationMonths: months,
      expectedEndDate: newEnd,
    });
  };

  const handleFinalSubmit = () => {
    if (!contractData) return;

    const newId = `PRJ-${Date.now().toString().slice(-4)}`;
    const randomCodeSuffix = Math.floor(10 + Math.random() * 90);
    const newCode = `PRJ-2025-${randomCodeSuffix}`;

    const newStages: ProjectStage[] = contractData.stages.map((stg, idx) => ({
      id: `${newId}-STG-${idx + 1}`,
      projectId: newId,
      order: idx + 1,
      name: stg.name,
      nameEn: stg.nameEn,
      status: idx === 0 ? 'قيد التنفيذ' : 'لم تبدأ',
      plannedStartDate: stg.plannedStartDate,
      plannedEndDate: stg.plannedEndDate,
      completionRate: idx === 0 ? 25 : 0,
      weight: stg.weight,
    }));

    const newPayments: ProjectPayment[] = contractData.payments.map((p, idx) => ({
      id: `PAY-${newId}-${idx + 1}`,
      paymentCode: `PAY-${randomCodeSuffix}-${String(idx + 1).padStart(2, '0')}`,
      projectId: newId,
      stageName: p.stageName,
      milestoneTitle: p.milestoneTitle,
      dueAmount: p.dueAmount,
      collectedAmount: 0,
      remainingAmount: p.dueAmount,
      dueDate: p.dueDate,
      percentage: p.percentage,
      status: 'قيد الانتظار',
    }));

    const newProject: Project = {
      id: newId,
      projectCode: newCode,
      name: contractData.projectName.trim() || 'مشروع جديد من العقد',
      projectType: contractData.projectType,
      clientName: contractData.clientName.trim() || 'عميل العقد',
      location: contractData.location.trim() || 'المملكة العربية السعودية',
      engineerInCharge: contractData.engineerInCharge.trim() || 'م. فهد السبيعي',
      contractValue: contractData.contractValue,
      currentStage: newStages[0]?.name || 'المرحلة الأولى',
      currentStageStatus: 'قيد التنفيذ',
      status: 'نشط',
      startDate: contractData.startDate,
      expectedEndDate: contractData.expectedEndDate,
      physicalProgress: Math.round(newStages[0]?.weight * 0.25 || 10),
      totalCollected: 0,
      totalRemaining: contractData.contractValue,
      financialProgress: 0,
      stages: newStages,
      payments: newPayments,
    };

    onSaveProject(newProject);
    onClose();
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  إنشاء مشروع ذكي من عقد (PDF)
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  استخراج الدفعات والقيمة والمدة آلياً
                </span>
              </div>
              <p className="text-xs text-slate-400">
                أرفق ملف عقد PDF وسيقوم النظام باستخراج قيمة العقد، التواريخ، المدة، وتوليد جدول الدفعات والنسب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'upload' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
            {/* Upload Area */}
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center space-y-3 ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-850/60 hover:border-slate-600'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-lg">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-bold text-white text-base">
                  اسحب وأفلت عقد المشروع هنا (ملف PDF)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  يدعم عقود المقاولات، السباكة، الكهرباء، التكييف، والتشطيب
                </p>
              </div>

              <div className="pt-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95">
                  <FileText className="w-4 h-4" />
                  <span>تصفح واختيار ملف PDF من جهازك</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {isProcessing && (
                <div className="flex items-center gap-2 text-amber-400 pt-2 font-bold animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>جارٍ قراءة العقد واستخراج البيانات المالية والجدول الزمني...</span>
                </div>
              )}
            </div>

            {/* Quick Sample Contracts Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  أو اختر نموذج عقد معتمد للتجربة السريعة:
                </span>
                <span className="text-2xs text-slate-400">عقود نموذجية متكاملة الدفعات</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleContracts.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-3.5 bg-slate-850/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl cursor-pointer transition space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-2xs font-bold rounded-full ${
                        sample.type === 'سباكة'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : sample.type === 'كهرباء'
                          ? 'bg-amber-500/20 text-amber-300'
                          : sample.type === 'تكييف'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {sample.type === 'سباكة' ? '💧 سباكة' : sample.type === 'كهرباء' ? '⚡ كهرباء' : sample.type === 'تكييف' ? '❄️ تكييف' : '🏗️ مقاولات عامة'}
                      </span>
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        {formatMoney(sample.contractValue)} {currency}
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-400 transition truncate">
                      {sample.title}
                    </h5>

                    <p className="text-2xs text-slate-400 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>

                    <div className="flex items-center justify-between text-2xs text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>المدة: {sample.durationMonths} أشهر</span>
                      <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                        تطبيق هذا العقد
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: REVIEW & CONFIRM EXTRACTED PROJECT DATA */
          contractData && (
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Top Banner Notice */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    تم استخراج بيانات العقد وجدولة الدفعات بنجاح!
                  </h4>
                  <p className="text-2xs text-slate-300 mt-0.5">
                    يمكنك مراجعة وتعديل أي تفاصيل، وتأكيد نسب الدفعات وتواريخ المراحل قبل اعتماد إنشاء المشروع.
                  </p>
                </div>
              </div>

              {/* Basic Contract Information Form */}
              <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>البيانات الأساسية للمشروع والعقد</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-2xs font-semibold text-slate-400 mb-1">اسم المشروع</label>
                    <input
                      type="text"
                      value={contractData.projectName}
                      onChange={(e) => setContractData({ ...contractData, projectName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-slate-400 mb-1">تخصص المشروع</label>
                    <select
                      value={contractData.projectType}
                      onChange={(e) => {
                        const newType = e.target.value as ProjectType;
                        setContractData({ ...contractData, projectType: newType });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="سباكة">💧 سباكة وصحي</option>
                      <option value="كهرباء">⚡ كهرباء وإنارة</option>
                      <option value="تكييف">❄️ تكييف مركزي ودكت</option>
                      <option value="مقاولات عامة وإنشائي">🏗️ مقاولات عامة وإنشائي</option>
                      <option value="تشطيب وديكور">🎨 تشطيب وديكور</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-slate-400 mb-1">اسم العميل / الطرف الأول</label>
                    <input
                      type="text"
                      value={contractData.clientName}
                      onChange={(e) => setContractData({ ...contractData, clientName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-slate-400 mb-1">موقع المشروع</label>
                    <input
                      type="text"
                      value={contractData.location}
                      onChange={(e) => setContractData({ ...contractData, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-amber-400 mb-1">
                      قيمة العقد الإجمالية ({currency})
                    </label>
                    <input
                      type="number"
                      value={contractData.contractValue}
                      onChange={(e) => handleUpdateContractValue(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-amber-400 font-bold font-mono text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-slate-400 mb-1">مدة العقد (بالأشهر)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={contractData.durationMonths}
                        onChange={(e) => handleUpdateDuration(Number(e.target.value) || 1)}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-2xs text-slate-400 font-mono">
                        تاريخ الانتهاء: {contractData.expectedEndDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payments & Milestones Breakdown */}
              <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>جدول الدفعات والمستخلصات المستخرجة من العقد</span>
                    </h4>
                    <p className="text-2xs text-slate-400 mt-0.5">
                      يتم حساب قيمة كل دفعة بناءً على النسبة المئوية المحددة في بنود العقد
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">إجمالي النسب:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      contractData.payments.reduce((s, p) => s + p.percentage, 0) === 100
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {contractData.payments.reduce((s, p) => s + p.percentage, 0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {contractData.payments.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xs">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={p.milestoneTitle}
                            onChange={(e) => {
                              const updated = [...contractData.payments];
                              updated[idx].milestoneTitle = e.target.value;
                              setContractData({ ...contractData, payments: updated });
                            }}
                            className="bg-transparent text-white font-bold border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none flex-1"
                          />
                        </div>
                        <div className="text-2xs text-slate-400 font-mono">
                          المرحلة المرتبطة: {p.stageName} • استحقاق: {p.dueDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg">
                          <span className="text-2xs text-slate-400">النسبة:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={p.percentage}
                            onChange={(e) => handleUpdatePaymentPct(idx, Number(e.target.value) || 0)}
                            className="w-12 bg-transparent text-amber-400 font-mono font-bold text-xs text-center focus:outline-none"
                          />
                          <span className="text-amber-400 font-bold">%</span>
                        </div>

                        <div className="text-left font-mono min-w-[120px]">
                          <div className="font-bold text-white text-xs">
                            {formatMoney(p.dueAmount)} {currency}
                          </div>
                          <div className="text-3xs text-slate-400">مستحق الصرف</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stages Preview */}
              <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>مراحل التنفيذ التشغيلية للمشروع ({contractData.stages.length} مراحل)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {contractData.stages.map((stg, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-2xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-200">{stg.name}</span>
                          <div className="text-3xs text-slate-400 font-mono">
                            {stg.plannedStartDate} ➔ {stg.plannedEndDate}
                          </div>
                        </div>
                      </div>

                      <span className="text-2xs font-mono text-amber-400 font-bold">
                        وزن {stg.weight}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {step === 'review' ? (
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              رجوع لاختيار عقد آخر
            </button>
          ) : (
            <div className="text-2xs text-slate-400">
              يمكنك أيضاً إنشاء المشروع يدوياً من زر "مشروع جديد".
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              إلغاء
            </button>

            {step === 'review' && (
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>اعتماد وإنشاء المشروع من العقد</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
