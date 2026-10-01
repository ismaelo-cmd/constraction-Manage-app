import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Project, ProjectPayment, ProjectStage } from '../types';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Layers, 
  Table, 
  ArrowRight,
  Database,
  HelpCircle
} from 'lucide-react';

interface SmartImportModalProps {
  existingProjects: Project[];
  currency: string;
  onClose: () => void;
  onImportData: (importedProjects: Project[], importedPaymentsCount: number) => void;
}

type DetectedFileType = 'combined' | 'projects' | 'payments' | 'unknown';

interface ColumnMapping {
  projectName: string;
  contractValue: string;
  clientName: string;
  milestoneTitle: string;
  dueAmount: string;
  collectedAmount: string;
  dueDate: string;
  stageName: string;
}

export const SmartImportModal: React.FC<SmartImportModalProps> = ({
  existingProjects,
  currency,
  onClose,
  onImportData,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [detectedType, setDetectedType] = useState<DetectedFileType>('unknown');
  const [mapping, setMapping] = useState<ColumnMapping>({
    projectName: '',
    contractValue: '',
    clientName: '',
    milestoneTitle: '',
    dueAmount: '',
    collectedAmount: '',
    dueDate: '',
    stageName: '',
  });

  const [pasteText, setPasteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to normalize strings for comparison
  const normalize = (str: string) => str.toLowerCase().replace(/[\s_\-–]/g, '');

  // Intelligent column auto-guesser
  const guessColumnMapping = (headers: string[]) => {
    const newMapping: ColumnMapping = {
      projectName: '',
      contractValue: '',
      clientName: '',
      milestoneTitle: '',
      dueAmount: '',
      collectedAmount: '',
      dueDate: '',
      stageName: '',
    };

    headers.forEach((h) => {
      const norm = normalize(h);

      // Project Name
      if (norm.includes('مشروع') || norm.includes('project') || norm.includes('اسم') || norm.includes('title')) {
        if (!norm.includes('بيان') && !norm.includes('دفعة') && !newMapping.projectName) {
          newMapping.projectName = h;
        }
      }

      // Contract Value
      if (norm.includes('عقد') || norm.includes('contract') || norm.includes('اجمالي') || norm.includes('total')) {
        if (!newMapping.contractValue) newMapping.contractValue = h;
      }

      // Client Name
      if (norm.includes('عميل') || norm.includes('مالك') || norm.includes('client') || norm.includes('owner')) {
        if (!newMapping.clientName) newMapping.clientName = h;
      }

      // Milestone Title
      if (norm.includes('دفعة') || norm.includes('مستخلص') || norm.includes('milestone') || norm.includes('payment') || norm.includes('بيان')) {
        if (!norm.includes('تاريخ') && !norm.includes('مبلغ') && !newMapping.milestoneTitle) {
          newMapping.milestoneTitle = h;
        }
      }

      // Due Amount
      if (norm.includes('مستحق') || norm.includes('due') || norm.includes('مبلغ') || norm.includes('قيمة')) {
        if (!norm.includes('عقد') && !norm.includes('حصل') && !newMapping.dueAmount) {
          newMapping.dueAmount = h;
        }
      }

      // Collected Amount
      if (norm.includes('حصل') || norm.includes('مدفوع') || norm.includes('collected') || norm.includes('paid')) {
        if (!newMapping.collectedAmount) newMapping.collectedAmount = h;
      }

      // Due Date
      if (norm.includes('تاريخ') || norm.includes('date') || norm.includes('استحقاق') || norm.includes('سداد')) {
        if (!newMapping.dueDate) newMapping.dueDate = h;
      }

      // Stage
      if (norm.includes('مرحلة') || norm.includes('stage') || norm.includes('بناء') || norm.includes('تنفيذ')) {
        if (!newMapping.stageName) newMapping.stageName = h;
      }
    });

    // Fallbacks
    if (!newMapping.projectName && headers.length > 0) newMapping.projectName = headers[0];
    if (!newMapping.contractValue && headers.find((h) => typeof h === 'string' && h.match(/\d/))) {
      newMapping.contractValue = headers.find((h) => typeof h === 'string' && h.match(/\d/))!;
    }

    setMapping(newMapping);

    // Detect type
    const hasProject = !!newMapping.projectName;
    const hasPayment = !!newMapping.milestoneTitle || !!newMapping.dueAmount;

    if (hasProject && hasPayment) {
      setDetectedType('combined');
    } else if (hasProject) {
      setDetectedType('projects');
    } else if (hasPayment) {
      setDetectedType('payments');
    } else {
      setDetectedType('unknown');
    }
  };

  // Process File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (data.length === 0) {
          setErrorMsg('الملف فارغ، يرجى اختيار ملف يحتوي على بيانات مشاريع أو دفعات.');
          setIsProcessing(false);
          return;
        }

        const headers = Object.keys(data[0] as object);
        setDetectedHeaders(headers);
        setRawRows(data);
        guessColumnMapping(headers);
        setIsProcessing(false);
      } catch (err: any) {
        setErrorMsg('حدث خطأ أثناء قراءة الملف: ' + err.message);
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  // Process Pasted Data
  const handleProcessPastedText = () => {
    if (!pasteText.trim()) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      // Split lines
      const lines = pasteText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setErrorMsg('البيانات غير كافية، يجب أن يحتوي النص على صف عناوين وصف بيانات على الأقل.');
        setIsProcessing(false);
        return;
      }

      // Check delimiter (tab or comma)
      const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(',') ? ',' : ';';
      const headers = lines[0].split(delimiter).map((h) => h.replace(/["']/g, '').trim());

      const dataRows = lines.slice(1).map((line) => {
        const values = line.split(delimiter).map((v) => v.replace(/["']/g, '').trim());
        const rowObj: Record<string, any> = {};
        headers.forEach((h, i) => {
          rowObj[h] = values[i] ?? '';
        });
        return rowObj;
      });

      setDetectedHeaders(headers);
      setRawRows(dataRows);
      guessColumnMapping(headers);
      setIsProcessing(false);
    } catch (err: any) {
      setErrorMsg('خطأ في معالجة النص: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Download Sample Template for old projects
  const handleDownloadSample = () => {
    const sampleData = [
      {
        'اسم المشروع': 'مشروع فيلا الملقا السكني (قديم)',
        'العميل': 'أحمد السعدون',
        'الموقع': 'الرياض - الملقا',
        'قيمة العقد': 1200000,
        'المرحلة الإنشائية': 'العظم والخرسانات',
        'بيان الدفعة': 'الدفعة الأولى: مقدمة المشروع وتوقيع العقد',
        'المبلغ المستحق': 240000,
        'المبلغ المحصل': 240000,
        'تاريخ الاستحقاق': '2024-01-10',
      },
      {
        'اسم المشروع': 'مشروع فيلا الملقا السكني (قديم)',
        'العميل': 'أحمد السعدون',
        'الموقع': 'الرياض - الملقا',
        'قيمة العقد': 1200000,
        'المرحلة الإنشائية': 'الأساسات',
        'بيان الدفعة': 'الدفعة الثانية: إتمام صب القواعد والميدات',
        'المبلغ المستحق': 240000,
        'المبلغ المحصل': 240000,
        'تاريخ الاستحقاق': '2024-03-15',
      },
      {
        'اسم المشروع': 'مشروع فيلا الملقا السكني (قديم)',
        'العميل': 'أحمد السعدون',
        'الموقع': 'الرياض - الملقا',
        'قيمة العقد': 1200000,
        'المرحلة الإنشائية': 'العظم',
        'بيان الدفعة': 'الدفعة الثالثة: صبة سقف الدور الأرضي',
        'المبلغ المستحق': 240000,
        'المبلغ المحصل': 240000,
        'تاريخ الاستحقاق': '2024-05-20',
      },
      {
        'اسم المشروع': 'مشروع فيلا الملقا السكني (قديم)',
        'العميل': 'أحمد السعدون',
        'الموقع': 'الرياض - الملقا',
        'قيمة العقد': 1200000,
        'المرحلة الإنشائية': 'اللياسة والتشطيب',
        'بيان الدفعة': 'الدفعة الرابعة: اللياسة وتأسيس الكهرباء',
        'المبلغ المستحق': 240000,
        'المبلغ المحصل': 100000,
        'تاريخ الاستحقاق': '2024-09-01',
      },
      {
        'اسم المشروع': 'مشروع فيلا الملقا السكني (قديم)',
        'العميل': 'أحمد السعدون',
        'الموقع': 'الرياض - الملقا',
        'قيمة العقد': 1200000,
        'المرحلة الإنشائية': 'التسليم',
        'بيان الدفعة': 'الدفعة الخامسة: التسليم النهائي ومحضر الإشراف',
        'المبلغ المستحق': 240000,
        'المبلغ المحصل': 0,
        'تاريخ الاستحقاق': '2024-12-30',
      },
      {
        'اسم المشروع': 'ترميم مبنى تجاري (3 دفعات فقط)',
        'العميل': 'مؤسسة الرواد للتجارة',
        'الموقع': 'الدمام - الشاطئ',
        'قيمة العقد': 450000,
        'المرحلة الإنشائية': 'التشطيبات',
        'بيان الدفعة': 'دفعة البداية وتوريد الخامات',
        'المبلغ المستحق': 150000,
        'المبلغ المحصل': 150000,
        'تاريخ الاستحقاق': '2024-02-01',
      },
      {
        'اسم المشروع': 'ترميم مبنى تجاري (3 دفعات فقط)',
        'العميل': 'مؤسسة الرواد للتجارة',
        'الموقع': 'الدمام - الشاطئ',
        'قيمة العقد': 450000,
        'المرحلة الإنشائية': 'التشطيبات',
        'بيان الدفعة': 'دفعة إنجاز الواجهات الزجاجية',
        'المبلغ المستحق': 200000,
        'المبلغ المحصل': 150000,
        'تاريخ الاستحقاق': '2024-04-15',
      },
      {
        'اسم المشروع': 'ترميم مبنى تجاري (3 دفعات فقط)',
        'العميل': 'مؤسسة الرواد للتجارة',
        'الموقع': 'الدمام - الشاطئ',
        'قيمة العقد': 450000,
        'المرحلة الإنشائية': 'التسليم',
        'بيان الدفعة': 'دفعة الختام ومخالصة الدفاع المدني',
        'المبلغ المستحق': 100000,
        'المبلغ المحصل': 0,
        'تاريخ الاستحقاق': '2024-07-01',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Old_Projects_Sample');
    XLSX.writeFile(wb, 'Contracting_Old_Projects_Template.xlsx');
  };

  // Execute Import & Auto-placement
  const handleExecuteImport = () => {
    if (rawRows.length === 0 || !mapping.projectName) {
      setErrorMsg('يرجى تحديد عمود اسم المشروع على الأقل للاستيراد.');
      return;
    }

    try {
      // Group rows by project name
      const projectGroups: Record<string, any[]> = {};

      rawRows.forEach((row) => {
        const prjName = String(row[mapping.projectName] || '').trim();
        if (!prjName) return;

        if (!projectGroups[prjName]) {
          projectGroups[prjName] = [];
        }
        projectGroups[prjName].push(row);
      });

      const importedProjects: Project[] = [];
      let totalImportedPayments = 0;

      Object.keys(projectGroups).forEach((prjName, pIdx) => {
        const rows = projectGroups[prjName];
        const firstRow = rows[0];

        const projectId = `PRJ-IMP-${Date.now().toString().slice(-4)}-${pIdx + 1}`;
        const projectCode = `PRJ-ARC-${String(pIdx + 1).padStart(2, '0')}`;

        // Get contract value from mapping, or sum up due amounts
        let contractVal = Number(firstRow[mapping.contractValue]) || 0;
        const clientVal = String(firstRow[mapping.clientName] || 'عميل مستورد').trim();
        const stageVal = String(firstRow[mapping.stageName] || 'قيد التنفيذ').trim();

        // Build payments for this project
        const projectPayments: ProjectPayment[] = [];
        let projectCollected = 0;
        let sumDue = 0;

        rows.forEach((r, rIdx) => {
          const mTitle = String(
            r[mapping.milestoneTitle] || `المستخلص رقم ${rIdx + 1}`
          ).trim();

          const due = Number(r[mapping.dueAmount]) || (contractVal > 0 ? Math.round(contractVal / rows.length) : 100000);
          const collected = Number(r[mapping.collectedAmount]) || 0;
          const dDate = String(r[mapping.dueDate] || new Date().toISOString().split('T')[0]);
          const remaining = Math.max(0, due - collected);

          sumDue += due;
          projectCollected += collected;
          totalImportedPayments++;

          const pStatus =
            collected >= due && due > 0
              ? 'محصلة'
              : collected > 0
              ? 'محصلة جزئياً'
              : new Date(dDate) < new Date()
              ? 'متأخرة'
              : 'قيد الانتظار';

          projectPayments.push({
            id: `${projectId}-PAY-${rIdx + 1}`,
            paymentCode: `${projectCode}-${String(rIdx + 1).padStart(2, '0')}`,
            projectId,
            stageName: String(r[mapping.stageName] || stageVal || 'مرحلة تنفيذية'),
            milestoneTitle: mTitle,
            dueAmount: due,
            collectedAmount: collected,
            remainingAmount: remaining,
            dueDate: dDate,
            collectedDate: collected > 0 ? dDate : undefined,
            voucherNumber: collected > 0 ? `REC-OLD-${Math.floor(100 + Math.random() * 900)}` : undefined,
            paymentMethod: 'تحويل بنكي',
            status: pStatus,
          });
        });

        if (contractVal <= 0) {
          contractVal = sumDue;
        }

        const projectRemaining = Math.max(0, contractVal - projectCollected);
        const finProgress = contractVal > 0 ? (projectCollected / contractVal) * 100 : 0;

        // Default stages
        const defaultStages: ProjectStage[] = [
          {
            id: `${projectId}-STG-1`,
            projectId,
            order: 1,
            name: 'الحفر والأساسات',
            nameEn: 'Foundations',
            status: finProgress >= 30 ? 'مكتملة' : 'قيد التنفيذ',
            plannedStartDate: '2024-01-01',
            plannedEndDate: '2024-03-01',
            completionRate: finProgress >= 30 ? 100 : 60,
            weight: 30,
          },
          {
            id: `${projectId}-STG-2`,
            projectId,
            order: 2,
            name: 'الهيكل الإنشائي (العظم)',
            nameEn: 'Structure',
            status: finProgress >= 70 ? 'مكتملة' : finProgress >= 30 ? 'قيد التنفيذ' : 'لم تبدأ',
            plannedStartDate: '2024-03-02',
            plannedEndDate: '2024-07-01',
            completionRate: finProgress >= 70 ? 100 : finProgress >= 30 ? 50 : 0,
            weight: 40,
          },
          {
            id: `${projectId}-STG-3`,
            projectId,
            order: 3,
            name: 'التشطيبات والتسليم',
            nameEn: 'Finishing & Handover',
            status: finProgress === 100 ? 'مكتملة' : finProgress >= 70 ? 'قيد التنفيذ' : 'لم تبدأ',
            plannedStartDate: '2024-07-02',
            plannedEndDate: '2024-12-30',
            completionRate: finProgress === 100 ? 100 : finProgress >= 70 ? 40 : 0,
            weight: 30,
          },
        ];

        importedProjects.push({
          id: projectId,
          projectCode,
          name: prjName,
          clientName: clientVal,
          location: 'موقع معتمد للمشروع',
          engineerInCharge: 'م. إدارة المشاريع',
          contractValue: contractVal,
          currentStage: stageVal || (finProgress >= 70 ? 'التشطيبات والتسليم' : 'الهيكل الإنشائي (العظم)'),
          currentStageStatus: finProgress === 100 ? 'مكتملة' : 'قيد التنفيذ',
          status: finProgress === 100 ? 'مكتمل' : 'نشط',
          startDate: '2024-01-01',
          expectedEndDate: '2024-12-30',
          physicalProgress: Math.min(100, Math.round(finProgress)),
          totalCollected: projectCollected,
          totalRemaining: projectRemaining,
          financialProgress: finProgress,
          stages: defaultStages,
          payments: projectPayments,
        });
      });

      onImportData(importedProjects, totalImportedPayments);
      onClose();
    } catch (err: any) {
      setErrorMsg('خطأ أثناء تحويل وتوزيع البيانات: ' + err.message);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  استيراد وقراءة ملفات المشاريع والدفعات القديمة
                </h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  Smart Auto-Detector
                </span>
              </div>
              <p className="text-xs text-slate-400">
                يقوم النظام بالتعرف على الأعمدة وتوزيع المشاريع والدفعات أوتوماتيكياً في قاعدة البيانات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Dropzone or Paste Options */}
          {rawRows.length === 0 ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl bg-slate-850/50 hover:bg-slate-800/50 transition cursor-pointer text-center space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv, .tsv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    اضغط هنا لاختيار ملف Excel أو CSV
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    يدعم ملفات (.xlsx, .xls, .csv) سواء كانت جداول مشاريع، كشوف دفعات، أو مشاريع قديمة
                  </p>
                </div>
              </div>

              {/* Paste from Clipboard alternative */}
              <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-amber-400" />
                    <span>أو انسخ جدول من الإكسل مباشرة والصقه هنا:</span>
                  </label>
                  <button
                    onClick={handleDownloadSample}
                    className="flex items-center gap-1 text-2xs text-amber-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل نموذج إكسل استرشادي (Sample)</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="انسخ صفوف من ملف الإكسل (Ctrl+C) والصقها هنا مباشرة (Ctrl+V)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {pasteText.trim() && (
                  <button
                    type="button"
                    onClick={handleProcessPastedText}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition"
                  >
                    معالجة الجدول المنسوخ
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Analysis & Smart Column Mapper */
            <div className="space-y-4">
              {/* Detection Summary Banner */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    تم قراءة <strong>{rawRows.length}</strong> سجل بنجاح. نوع الملف المكتشف:{' '}
                    <strong className="text-white">
                      {detectedType === 'combined'
                        ? 'ملف مدمج (مشاريع مع دفعات متعددة)'
                        : detectedType === 'projects'
                        ? 'كشف مشاريع رئيسية'
                        : 'كشف دفعات ومستخلصات'}
                    </strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setRawRows([]);
                    setDetectedHeaders([]);
                    setFile(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  اختيار ملف آخر
                </button>
              </div>

              {/* Column Mapping Selectors */}
              <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>تأكيد مطابقة الأعمدة (Smart Column Mapping)</span>
                  </div>
                  <span className="text-2xs text-slate-400">
                    عدّل الاختيارات إذا كان ملفك يستخدم مسميات مختلفة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      اسم المشروع <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={mapping.projectName}
                      onChange={(e) => setMapping({ ...mapping, projectName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- اختر العمود --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      قيمة العقد الإجمالية
                    </label>
                    <select
                      value={mapping.contractValue}
                      onChange={(e) => setMapping({ ...mapping, contractValue: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- أو احسبها من مجموع الدفعات --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      بيان / مسمى الدفعة
                    </label>
                    <select
                      value={mapping.milestoneTitle}
                      onChange={(e) => setMapping({ ...mapping, milestoneTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- اختر عمود الدفعة --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      المبلغ المستحق
                    </label>
                    <select
                      value={mapping.dueAmount}
                      onChange={(e) => setMapping({ ...mapping, dueAmount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- عمود المستحق --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      المبلغ المحصل
                    </label>
                    <select
                      value={mapping.collectedAmount}
                      onChange={(e) => setMapping({ ...mapping, collectedAmount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- عمود المحصل --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      تاريخ الاستحقاق
                    </label>
                    <select
                      value={mapping.dueDate}
                      onChange={(e) => setMapping({ ...mapping, dueDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- عمود التاريخ --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      اسم العميل / المالك
                    </label>
                    <select
                      value={mapping.clientName}
                      onChange={(e) => setMapping({ ...mapping, clientName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- عمود العميل --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      المرحلة الإنشائية
                    </label>
                    <select
                      value={mapping.stageName}
                      onChange={(e) => setMapping({ ...mapping, stageName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-amber-500"
                    >
                      <option value="">-- عمود المرحلة --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Raw Data Preview Table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">
                  معاينة لأول 4 صفوف من الملف:
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                      <tr>
                        {detectedHeaders.slice(0, 6).map((h) => (
                          <th key={h} className="p-2.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      {rawRows.slice(0, 4).map((row, idx) => (
                        <tr key={idx}>
                          {detectedHeaders.slice(0, 6).map((h) => (
                            <td key={h} className="p-2.5 text-slate-300 font-mono whitespace-nowrap">
                              {String(row[h] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-amber-400" />
            <span>سيتم وضع المشاريع في قائمة المشاريع، وربط كافة دفعاتها بها وتحديث لوحة القيادة فوراً.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              إلغاء
            </button>
            {rawRows.length > 0 && (
              <button
                onClick={handleExecuteImport}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>اعتماد واستيراد البيانات للمنظومة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
