export type StageStatus = 'لم تبدأ' | 'قيد التنفيذ' | 'مكتملة' | 'معلقة';
export type PaymentStatus = 'محصلة' | 'محصلة جزئياً' | 'قيد الانتظار' | 'متأخرة';
export type ProjectStatus = 'نشط' | 'مكتمل' | 'متعثر' | 'قيد التخطيط';
export type ProjectType = 'سباكة' | 'كهرباء' | 'تكييف' | 'مقاولات عامة وإنشائي' | 'تشطيب وديكور' | 'أخرى';

export type StageAlertType = 
  | 'approaching_deadline'    // قرب موعد الانتهاء الزمني
  | 'approaching_completion'  // قرب الاكتمال بنسبة إنجاز عالية (80-99%)
  | 'completed'               // تم إنجاز واكتمال المرحلة (100% أو مكتملة)
  | 'overdue';                // تجاوزت موعد الانتهاء دون اكتمال

export interface StageAlert {
  id: string;
  stageId: string;
  stageName: string;
  stageNameEn?: string;
  stageOrder: number;
  projectId: string;
  projectName: string;
  projectCode: string;
  projectType?: ProjectType;
  type: StageAlertType;
  title: string;
  message: string;
  severity: 'urgent' | 'warning' | 'info' | 'success';
  daysDifference: number; // >0 days until plannedEndDate, <0 days overdue, 0 = today
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  completionRate: number;
  weight: number;
  status: StageStatus;
  actionRecommendation: string;
  nextStageName?: string;
  read?: boolean;
}

export interface ProjectStage {
  id: string;
  projectId: string;
  order: number;
  name: string; // e.g., 'الحفر والأساسات', 'الهيكل الإنشائي (العظم)'
  nameEn: string;
  status: StageStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  completionRate: number; // 0 - 100
  weight: number; // Percentage weight in total project (e.g. 20%)
  notes?: string;
}

export interface ProjectPayment {
  id: string;
  paymentCode: string; // e.g. PAY-001
  projectId: string;
  stageId?: string; // Linked stage
  stageName: string;
  milestoneTitle: string; // e.g., 'دفعة مقدمة عند توقيع العقد', 'دفعة صبة سقف الدور الأرضي'
  dueAmount: number; // المبلغ المستحق
  collectedAmount: number; // المبلغ المحصل
  remainingAmount: number; // المتبقي
  dueDate: string; // تاريخ الاستحقاق
  collectedDate?: string; // تاريخ التحصيل الفعلي
  voucherNumber?: string; // رقم سند القبض
  paymentMethod?: 'تحويل بنكي' | 'شيك مصرفي' | 'نقدي' | 'شبكة (مدى)';
  status: PaymentStatus;
  notes?: string;
  percentage?: number; // النسبة المئوية من إجمالي قيمة العقد
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  city: string;
}

export interface Project {
  id: string;
  projectCode: string; // e.g. PRJ-2025-01
  name: string;
  clientName: string;
  location: string;
  engineerInCharge: string;
  contractValue: number; // إجمالي قيمة العقد
  currentStage: string; // المرحلة الحالية
  currentStageStatus: StageStatus;
  status: ProjectStatus;
  projectType?: ProjectType;
  startDate: string;
  expectedEndDate: string;
  physicalProgress: number; // نسبة الإنجاز الميداني 0-100%
  // Computed / Roll-up fields
  totalCollected: number;
  totalRemaining: number;
  financialProgress: number; // (totalCollected / contractValue) * 100
  stages: ProjectStage[];
  payments: ProjectPayment[];
}

export interface SchemaColumn {
  nameAr: string;
  nameEn: string;
  dataTypeSheets: string;
  dataTypeAppSheet: string;
  isKey?: boolean;
  isLabel?: boolean;
  isRequired?: boolean;
  formulaSheets?: string;
  formulaAppSheet?: string;
  description: string;
  example: string;
}

export interface SchemaTable {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  columns: SchemaColumn[];
}

export interface FormulaDefinition {
  id: string;
  title: string;
  category: 'financial' | 'operational' | 'kpi';
  description: string;
  googleSheetsFormula: string;
  appSheetFormula: string;
  lookerStudioFormula?: string;
  explanation: string;
  bestPractice: string;
}

export interface SubcontractorPayment {
  id: string;
  paymentCode: string; // e.g. SUB-PAY-001
  subcontractorId: string;
  subcontractorName: string;
  projectId: string;
  projectName: string;
  milestoneTitle: string; // e.g., 'مستخلص صبة القواعد والميدات', 'دفعة التوريد الأولى'
  dueAmount: number; // المبلغ المستحق لمقاول الباطن
  paidAmount: number; // المبلغ المسدد له
  remainingAmount: number; // المتبقي له
  dueDate: string; // موعد استحقاق الدفعة
  paidDate?: string; // تاريخ الصرف الفعلي
  voucherNumber?: string; // رقم سند الصرف
  paymentMethod?: 'تحويل بنكي' | 'شيك مصرفي' | 'نقدي';
  status: 'مسددة' | 'مسددة جزئياً' | 'قيد المراجعة' | 'مستحقة الصرف';
  notes?: string;
  percentage?: number; // النسبة المئوية من إجمالي قيمة عقد مقاول الباطن
}

export interface Subcontractor {
  id: string;
  name: string;
  trade: string; // التخصص: حدادة ونجارة، سباكة، كهرباء، لياسة، تكييف، دهانات
  phone: string;
  email?: string;
  crNumber?: string; // السجل التجاري / الهوية
  projectId: string; // المشروع المربوط به
  projectName: string;
  contractValue: number; // إجمالي قيمة عقد مقاول الباطن
  totalPaid: number; // إجمالي ما تم صرفه له
  totalRemaining: number; // إجمالي المتبقي له
  status: 'نشط' | 'مكتمل' | 'معلق';
  payments: SubcontractorPayment[];
}

export interface KPIStats {
  totalContractValue: number;
  totalCollected: number;
  totalRemaining: number;
  overallCollectionRate: number;
  averagePhysicalProgress: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  delayedProjectsCount: number;
  totalPaymentsCount: number;
  pendingPaymentsCount: number;
  collectedPaymentsCount: number;
  delayedPaymentsCount: number;
}
