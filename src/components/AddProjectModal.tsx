import React, { useState } from 'react';
import { Project, ProjectStage, ProjectPayment, Client, StageStatus, ProjectType } from '../types';
import { 
  X, 
  Building2, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Layers, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Percent,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Droplets,
  Zap,
  Wind,
  Paintbrush
} from 'lucide-react';

interface AddProjectModalProps {
  clients: Client[];
  currency: string;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
}

interface DraftPayment {
  title: string;
  stageName: string;
  percentage: number; // e.g. 20%
  amount: number;
  isPaid: boolean;
  dueDate: string;
}

interface DraftStage {
  id: string;
  name: string;
  weight: number; // e.g. 20%
  status: StageStatus;
  plannedStartDate: string;
  plannedEndDate: string;
}

const templatesByProjectType: Record<
  ProjectType,
  {
    stages: Array<{ name: string; weight: number; status: StageStatus }>;
    payments: Array<{ title: string; percentage: number }>;
  }
> = {
  سباكة: {
    stages: [
      { name: 'تأسيس شبكات الصرف الصحي والتغذية الأرضية', weight: 25, status: 'قيد التنفيذ' },
      { name: 'تمديد خطوط الصواعد والمياه المعلقة واختبار الضغط', weight: 25, status: 'لم تبدأ' },
      { name: 'عزل دورات المياه والمطابخ واختبار العزل المائي', weight: 20, status: 'لم تبدأ' },
      { name: 'توريد وتركيب الخزانات والمضخات والسخانات المركزية', weight: 15, status: 'لم تبدأ' },
      { name: 'تركيب الأطقم الصحية والخلاطات والإكسسوارات والتشغيل', weight: 15, status: 'لم تبدأ' },
    ],
    payments: [
      { title: 'الدفعة الأولى: دفعة مقدمة وتوريد مواسير التغذية والصرف', percentage: 20 },
      { title: 'الدفعة الثانية: إتمام التأسيسات الأرضية والصواعد واختبار الضغط', percentage: 25 },
      { title: 'الدفعة الثالثة: إنهاء العزل المائي وتثبيت الخزانات السفلية والعلوية', percentage: 25 },
      { title: 'الدفعة الرابعة: توريد وتركيب المضخات والسخانات المركزية والفلترة', percentage: 15 },
      { title: 'الدفعة الخامسة: تركيب الأطقم الصحية والتشغيل والضمان النهائي', percentage: 15 },
    ],
  },
  كهرباء: {
    stages: [
      { name: 'تكسير وتمديد ليات وخراطيم الجدران والأسقف ومخارج الكهرباء', weight: 20, status: 'قيد التنفيذ' },
      { name: 'سحب وتمديد الأسلاك والكابلات وشبكة التأريض والحماية', weight: 25, status: 'لم تبدأ' },
      { name: 'تركيب وتوصيل الطبالين والقواطع ولوحات التوزيع الرئيسية', weight: 25, status: 'لم تبدأ' },
      { name: 'تركيب مفاتيح الإنارة والسبوت لايت ومخارج القوى والتكييف', weight: 15, status: 'لم تبدأ' },
      { name: 'فحص العزل وموازنة الأحمال وإطلاق التيار والتسليم المعتمد', weight: 15, status: 'لم تبدأ' },
    ],
    payments: [
      { title: 'الدفعة الأولى: دفعة مقدمة وتوريد الكابلات وخراطيم التأسيس', percentage: 20 },
      { title: 'الدفعة الثانية: إتمام تمديدات الخراطيم وتأسيس الجدران والأسقف', percentage: 25 },
      { title: 'الدفعة الثالثة: إنهاء سحب الكابلات وتثبيت لوحات التوزيع والقواطع', percentage: 25 },
      { title: 'الدفعة الرابعة: توريد وتركيب أجهزة الإنارة والأفياش والمفاتيح', percentage: 15 },
      { title: 'الدفعة الخامسة: إطلاق التيار الكهربائي واختبار الأحمال والتسليم النهائي', percentage: 15 },
    ],
  },
  تكييف: {
    stages: [
      { name: 'تمديد مواسير النحاس المعزولة ومسارات صرف المكيفات', weight: 20, status: 'قيد التنفيذ' },
      { name: 'تفصيل وتثبيت مجاري الهواء (Ducting) والعزل الحراري والصوتي', weight: 25, status: 'لم تبدأ' },
      { name: 'توريد وتعليق الوحدات الداخلية (Indoor Units) وجريلات الهواء', weight: 25, status: 'لم تبدأ' },
      { name: 'تركيب الوحدات الخارجية (Outdoor Units) وتوصيلات التحكم', weight: 15, status: 'لم تبدأ' },
      { name: 'ضغط النيتروجين وشحن الفريون واختبار تدفق الهواء والموازنة', weight: 15, status: 'لم تبدأ' },
    ],
    payments: [
      { title: 'الدفعة الأولى: دفعة مقدمة وتوريد النحاس ومواد الدكت والعوازل', percentage: 25 },
      { title: 'الدفعة الثانية: إتمام تصنيع وتركيب مجاري الهواء (الدكت) والعزل', percentage: 25 },
      { title: 'الدفعة الثالثة: توريد وتركيب الوحدات الداخلية وجريلات توزيع الهواء', percentage: 25 },
      { title: 'الدفعة الرابعة: تركيب الوحدات الخارجية والربط الكهربائي والتحكم', percentage: 15 },
      { title: 'الدفعة الخامسة: شحن الفريون واختبارات تدفق الهواء والتشغيل التجريبي', percentage: 10 },
    ],
  },
  'مقاولات عامة وإنشائي': {
    stages: [
      { name: 'الحفر والإحلال والأساسات والقواعد المسلحة', weight: 20, status: 'قيد التنفيذ' },
      { name: 'الهيكل الإنشائي (العظم) للأدوار والملحقات', weight: 35, status: 'لم تبدأ' },
      { name: 'أعمال التأسيسات الكهروميكانيكية (السباكة والكهرباء MEP)', weight: 15, status: 'لم تبدأ' },
      { name: 'اللياسة والعوازل والواجهات الخارجية', weight: 15, status: 'لم تبدأ' },
      { name: 'التشطيبات النهائية والتسليم الابتدائي', weight: 15, status: 'لم تبدأ' },
    ],
    payments: [
      { title: 'الدفعة الأولى: دفعة مقدمة عند توقيع العقد', percentage: 20 },
      { title: 'الدفعة الثانية: إتمام القواعد والميدات والرقاب', percentage: 25 },
      { title: 'الدفعة الثالثة: استكمال صبة الهيكل الإنشائي (العظم)', percentage: 30 },
      { title: 'الدفعة الرابعة: التشطيبات والتسليم النهائي', percentage: 25 },
    ],
  },
  'تشطيب وديكور': {
    stages: [
      { name: 'أعمال تكسير وتعديل القواطع واللياسة الداخلية', weight: 15, status: 'قيد التنفيذ' },
      { name: 'تأسيسات الجبس بورد والأسقف المستعارة والإنارة المخفية', weight: 25, status: 'لم تبدأ' },
      { name: 'أعمال البلاط والرخام والبورسلان للأرضيات والجدران', weight: 25, status: 'لم تبدأ' },
      { name: 'الدهانات والديكورات وبديل الخشب والرخام', weight: 20, status: 'لم تبدأ' },
      { name: 'تركيب الأبواب والألمنيوم والإكسسوارات والتسليم النهائي', weight: 15, status: 'لم تبدأ' },
    ],
    payments: [
      { title: 'الدفعة الأولى: دفعة مقدمة وتوريد مواد التأسيس', percentage: 25 },
      { title: 'الدفعة الثانية: إنهاء الأسقف المستعارة والتأسيسات الأولية', percentage: 25 },
      { title: 'الدفعة الثالثة: إتمام أعمال الأرضيات والبورسلان', percentage: 25 },
      { title: 'الدفعة الرابعة: إنهاء الدهانات والتركيبات النهائية والتسليم', percentage: 25 },
    ],
  },
  أخرى: {
    stages: [
      { name: 'المرحلة التحضيرية وتوريد المواد والبدء الميداني', weight: 25, status: 'قيد التنفيذ' },
      { name: 'مرحلة التنفيذ الرئيسية الأولى', weight: 35, status: 'لم تبدأ' },
      { name: 'مرحلة التنفيذ الميداني الثانية', weight: 25, status: 'لم تبدأ' },
      { name: 'التشطيب والفحص النهائي والتسليم', weight: 15, status: 'لم تبدأ' },
    ],
    payments: [
      { title: 'الدفعة الأولى: دفعة مقدمة عند بدء العمل', percentage: 30 },
      { title: 'الدفعة الثانية: مستخلص إنجاز 50% من الأعمال', percentage: 40 },
      { title: 'الدفعة الثالثة: التسليم النهائي والاعتماد', percentage: 30 },
    ],
  },
};

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  clients,
  currency,
  onClose,
  onSaveProject,
}) => {
  const [modalTab, setModalTab] = useState<'payments' | 'stages'>('payments');

  // Basic project fields
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('سباكة');
  const [clientName, setClientName] = useState(clients[0]?.name || 'عميل جديد');
  const [location, setLocation] = useState('الرياض - حي الياسمين');
  const [engineer, setEngineer] = useState('م. فهد السبيعي');
  const [contractValue, setContractValue] = useState<number>(1000000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Dynamic stages list - initialized with default template
  const [draftStages, setDraftStages] = useState<DraftStage[]>([
    {
      id: 'stg-1',
      name: 'تأسيس شبكات الصرف الصحي والتغذية الأرضية',
      weight: 25,
      status: 'قيد التنفيذ',
      plannedStartDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'stg-2',
      name: 'تمديد خطوط الصواعد والمياه المعلقة واختبار الضغط',
      weight: 25,
      status: 'لم تبدأ',
      plannedStartDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'stg-3',
      name: 'عزل دورات المياه والمطابخ واختبار العزل المائي',
      weight: 20,
      status: 'لم تبدأ',
      plannedStartDate: new Date(Date.now() + 66 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'stg-4',
      name: 'توريد وتركيب الخزانات والمضخات والسخانات المركزية',
      weight: 15,
      status: 'لم تبدأ',
      plannedStartDate: new Date(Date.now() + 106 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 145 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'stg-5',
      name: 'تركيب الأطقم الصحية والخلاطات والإكسسوارات والتشغيل',
      weight: 15,
      status: 'لم تبدأ',
      plannedStartDate: new Date(Date.now() + 146 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ]);

  // Dynamic payments list with percentage calculation
  const [draftPayments, setDraftPayments] = useState<DraftPayment[]>([
    {
      title: 'الدفعة الأولى: دفعة مقدمة وتوريد مواسير التغذية والصرف',
      stageName: 'تأسيس شبكات الصرف الصحي والتغذية الأرضية',
      percentage: 20,
      amount: 200000,
      isPaid: true,
      dueDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'الدفعة الثانية: إتمام التأسيسات الأرضية والصواعد واختبار الضغط',
      stageName: 'تمديد خطوط الصواعد والمياه المعلقة واختبار الضغط',
      percentage: 25,
      amount: 250000,
      isPaid: false,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: 'الدفعة الثالثة: إنهاء العزل المائي وتثبيت الخزانات السفلية والعلوية',
      stageName: 'عزل دورات المياه والمطابخ واختبار العزل المائي',
      percentage: 25,
      amount: 250000,
      isPaid: false,
      dueDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: 'الدفعة الرابعة: توريد وتركيب المضخات والسخانات المركزية والفلترة',
      stageName: 'توريد وتركيب الخزانات والمضخات والسخانات المركزية',
      percentage: 15,
      amount: 150000,
      isPaid: false,
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: 'الدفعة الخامسة: تركيب الأطقم الصحية والتشغيل والضمان النهائي',
      stageName: 'تركيب الأطقم الصحية والخلاطات والإكسسوارات والتشغيل',
      percentage: 15,
      amount: 150000,
      isPaid: false,
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ]);

  // Handle switching project type (loads custom stages & payments)
  const handleProjectTypeChange = (type: ProjectType) => {
    setProjectType(type);
    const template = templatesByProjectType[type];
    if (template) {
      // Auto-load stages tailored to this project type
      const newStages: DraftStage[] = template.stages.map((st, idx) => ({
        id: `stg-${idx + 1}`,
        name: st.name,
        weight: st.weight,
        status: st.status,
        plannedStartDate: new Date(Date.now() + idx * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
      setDraftStages(newStages);

      // Auto-load payments with exact percentages
      const newPayments: DraftPayment[] = template.payments.map((p, idx) => ({
        title: p.title,
        stageName: newStages[Math.min(idx, newStages.length - 1)]?.name || 'مرحلة التنفيذ',
        percentage: p.percentage,
        amount: Math.round(contractValue * (p.percentage / 100)),
        isPaid: idx === 0,
        dueDate: new Date(Date.now() + idx * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
      setDraftPayments(newPayments);
    }
  };

  // When contract value changes, recalculate amounts based on existing percentages
  const handleContractValueChange = (newVal: number) => {
    setContractValue(newVal);
    if (newVal > 0) {
      setDraftPayments((prev) =>
        prev.map((dp) => ({
          ...dp,
          amount: Math.round(newVal * (dp.percentage / 100)),
        }))
      );
    }
  };

  // Quick Preset Generator for Payments
  const applyPreset = (count: number) => {
    if (contractValue <= 0) return;
    const basePct = Number((100 / count).toFixed(1));
    const newDrafts: DraftPayment[] = [];

    const defaultNames = [
      'دفعة مقدمة عند توقيع العقد',
      'دفعة أعمال الحفر والأساسات والقواعد',
      'دفعة صبة أعمدة وسقف الدور الأرضي',
      'دفعة صبة الدور الأول والملحق',
      'دفعة تمديدات السباكة والكهرباء الأولية',
      'دفعة أعمال اللياسة الداخلية والخارجية والعزل',
      'دفعة تركيب البلاط والأرضيات والدهانات',
      'دفعة توريد وتركيب الأبواب والشبابيك والألومنيوم',
      'دفعة التشطيبات الدقيقة واختبارات الأنظمة',
      'دفعة التسليم النهائي ومخالصة الاستشاري',
    ];

    let allocatedPct = 0;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const pct = isLast ? Number((100 - allocatedPct).toFixed(1)) : basePct;
      allocatedPct += pct;
      const amt = Math.round(contractValue * (pct / 100));

      newDrafts.push({
        title: `الدفعة ${i + 1}: ${defaultNames[i] || `المستخلص رقم ${i + 1}`}`,
        stageName: draftStages[Math.min(i, draftStages.length - 1)]?.name || 'مرحلة التنفيذ',
        percentage: pct,
        amount: amt,
        isPaid: i === 0, // Advance payment usually paid
        dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }

    setDraftPayments(newDrafts);
  };

  // Update a payment by percentage
  const handlePaymentPercentageChange = (index: number, newPct: number) => {
    const amt = contractValue > 0 ? Math.round(contractValue * (newPct / 100)) : 0;
    setDraftPayments((prev) =>
      prev.map((dp, i) =>
        i === index ? { ...dp, percentage: newPct, amount: amt } : dp
      )
    );
  };

  // Update a payment by amount
  const handlePaymentAmountChange = (index: number, newAmt: number) => {
    const pct = contractValue > 0 ? Number(((newAmt / contractValue) * 100).toFixed(1)) : 0;
    setDraftPayments((prev) =>
      prev.map((dp, i) =>
        i === index ? { ...dp, amount: newAmt, percentage: pct } : dp
      )
    );
  };

  // Add draft payment
  const handleAddDraftPayment = () => {
    const nextIdx = draftPayments.length + 1;
    const currentTotalPct = draftPayments.reduce((s, d) => s + (d.percentage || 0), 0);
    const remPct = Math.max(5, Number((100 - currentTotalPct).toFixed(1)));
    const amt = contractValue > 0 ? Math.round(contractValue * (remPct / 100)) : 50000;

    setDraftPayments([
      ...draftPayments,
      {
        title: `الدفعة ${nextIdx}: مستخلص مرحلي إضافي`,
        stageName: draftStages[draftStages.length - 1]?.name || 'التشطيبات والتسليم',
        percentage: remPct,
        amount: amt,
        isPaid: false,
        dueDate: new Date(Date.now() + nextIdx * 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ]);
  };

  // Remove draft payment
  const handleRemoveDraftPayment = (index: number) => {
    if (draftPayments.length <= 1) return;
    setDraftPayments(draftPayments.filter((_, i) => i !== index));
  };

  // Add draft stage
  const handleAddDraftStage = () => {
    const nextIdx = draftStages.length + 1;
    setDraftStages([
      ...draftStages,
      {
        id: `stg-${Date.now().toString().slice(-4)}`,
        name: `مرحلة إضافية ${nextIdx}`,
        weight: 10,
        status: 'لم تبدأ',
        plannedStartDate: new Date(Date.now() + (nextIdx - 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + nextIdx * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ]);
  };

  // Remove draft stage
  const handleRemoveDraftStage = (id: string) => {
    if (draftStages.length <= 1) return;
    setDraftStages(draftStages.filter((s) => s.id !== id));
  };

  const totalPaymentsAmount = draftPayments.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const totalPaymentsPct = Number(
    draftPayments.reduce((sum, d) => sum + Number(d.percentage || 0), 0).toFixed(1)
  );
  const totalStagesWeight = Number(
    draftStages.reduce((sum, s) => sum + Number(s.weight || 0), 0).toFixed(1)
  );

  const formatMoney = (val: number) => new Intl.NumberFormat('ar-SA').format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || contractValue <= 0 || draftPayments.length === 0) return;

    const newId = 'PRJ-' + Math.floor(105 + Math.random() * 800);
    const newCode = 'PRJ-2025-' + String(Math.floor(5 + Math.random() * 95)).padStart(2, '0');

    // Build Project Stages
    const finalStages: ProjectStage[] = draftStages.map((stg, idx) => ({
      id: `${newId}-STG-${idx + 1}`,
      projectId: newId,
      order: idx + 1,
      name: stg.name,
      nameEn: `Stage ${idx + 1}`,
      status: stg.status,
      plannedStartDate: stg.plannedStartDate,
      plannedEndDate: stg.plannedEndDate,
      completionRate: stg.status === 'مكتملة' ? 100 : stg.status === 'قيد التنفيذ' ? 30 : 0,
      weight: stg.weight,
    }));

    // Build Project Payments
    let totalCollected = 0;
    const finalPayments: ProjectPayment[] = draftPayments.map((dp, idx) => {
      const isPaid = dp.isPaid;
      const due = Number(dp.amount);
      const collected = isPaid ? due : 0;
      totalCollected += collected;

      return {
        id: `${newId}-PAY-${idx + 1}`,
        paymentCode: `PAY-${newCode.split('-').pop()}-${String(idx + 1).padStart(2, '0')}`,
        projectId: newId,
        stageName: dp.stageName,
        milestoneTitle: dp.title,
        dueAmount: due,
        percentage: dp.percentage,
        collectedAmount: collected,
        remainingAmount: Math.max(0, due - collected),
        dueDate: dp.dueDate,
        collectedDate: isPaid ? dp.dueDate : undefined,
        voucherNumber: isPaid ? `REC-AUTO-${idx + 1}` : undefined,
        paymentMethod: 'تحويل بنكي',
        status: isPaid ? 'محصلة' : 'قيد الانتظار',
      };
    });

    const activeStage = finalStages.find((s) => s.status === 'قيد التنفيذ') || finalStages[0];

    const newProject: Project = {
      id: newId,
      projectCode: newCode,
      name: name.trim(),
      projectType,
      clientName,
      location,
      engineerInCharge: engineer,
      contractValue,
      currentStage: activeStage ? activeStage.name : 'مرحلة التنفيذ',
      currentStageStatus: activeStage ? activeStage.status : 'قيد التنفيذ',
      status: 'نشط',
      startDate,
      expectedEndDate: endDate,
      physicalProgress: 15,
      totalCollected,
      totalRemaining: Math.max(0, contractValue - totalCollected),
      financialProgress: contractValue > 0 ? (totalCollected / contractValue) * 100 : 0,
      stages: finalStages,
      payments: finalPayments,
    };

    onSaveProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                إضافة مشروع مقاولات جديد
              </h3>
              <p className="text-xs text-slate-400">
                جدولة العقد، حساب الدفعات بالنسبة المئوية %، وإضافة المراحل الميدانية
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
          {/* Project Type Selector */}
          <div className="p-4 bg-slate-850/80 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="font-bold text-white flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>نوع وتخصص المشروع</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-2xs text-amber-300 font-medium">
                اختيار التخصص يملأ مراحل التنفيذ ونسب الدفعات تلقائياً (يمكنك تعديلها بحرية)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { 
                  type: 'سباكة' as ProjectType, 
                  label: 'أعمال سباكة', 
                  sub: 'تغذية وصرف', 
                  icon: <Droplets className="w-5 h-5 text-cyan-400" />,
                  activeClass: 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/40' 
                },
                { 
                  type: 'كهرباء' as ProjectType, 
                  label: 'أعمال كهرباء', 
                  sub: 'إنارة وقوى وكابلات', 
                  icon: <Zap className="w-5 h-5 text-amber-400" />,
                  activeClass: 'bg-amber-950/60 border-amber-500 text-amber-300 ring-2 ring-amber-500/40' 
                },
                { 
                  type: 'تكييف' as ProjectType, 
                  label: 'تكييف وتبريد', 
                  sub: 'دكت وإسبليت وVRF', 
                  icon: <Wind className="w-5 h-5 text-sky-400" />,
                  activeClass: 'bg-sky-950/60 border-sky-500 text-sky-300 ring-2 ring-sky-500/40' 
                },
                { 
                  type: 'مقاولات عامة وإنشائي' as ProjectType, 
                  label: 'مقاولات وعظم', 
                  sub: 'حفر وأساسات وهيكل', 
                  icon: <Building2 className="w-5 h-5 text-emerald-400" />,
                  activeClass: 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40' 
                },
                { 
                  type: 'تشطيب وديكور' as ProjectType, 
                  label: 'تشطيب وديكور', 
                  sub: 'جبس وبلاط ودهان', 
                  icon: <Paintbrush className="w-5 h-5 text-purple-400" />,
                  activeClass: 'bg-purple-950/60 border-purple-500 text-purple-300 ring-2 ring-purple-500/40' 
                },
                { 
                  type: 'أخرى' as ProjectType, 
                  label: 'تخصص آخر', 
                  sub: 'مشروع مخصص', 
                  icon: <Layers className="w-5 h-5 text-slate-300" />,
                  activeClass: 'bg-slate-800 border-amber-400 text-amber-300 ring-2 ring-amber-500/40' 
                },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleProjectTypeChange(item.type)}
                  className={`p-3 rounded-xl border text-right transition flex flex-col justify-between gap-2 cursor-pointer active:scale-98 ${
                    projectType === item.type
                      ? item.activeClass
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {item.icon}
                    {projectType === item.type && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-3xs text-slate-400 mt-0.5">{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-850/70 border border-slate-800 rounded-xl">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                اسم المشروع / الوصف <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: برج الأعمال الفندقي / فيلا النرجس المودرن"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                إجمالي قيمة العقد ({currency}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1000"
                value={contractValue}
                onChange={(e) => handleContractValueChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-bold font-mono text-base focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">العميل / المالك</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="اسم المالك أو الشركة"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">الموقع / المدينة</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="الرياض - حي النرجس"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">المهندس المشرف</label>
              <input
                type="text"
                value={engineer}
                onChange={(e) => setEngineer(e.target.value)}
                placeholder="م. فهد السبيعي"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">تاريخ بدء المشروع</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">تاريخ التسليم المتوقع</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tab Switcher: Payments (% Calculator) vs Stages (مراحل المشروع) */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setModalTab('payments')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                modalTab === 'payments'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>جدولة الدفعات بالنسبة المئوية % ({draftPayments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setModalTab('stages')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                modalTab === 'stages'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>مراحل التنفيذ الإنشائية ({draftStages.length} مراحل)</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PAYMENTS WITH DIRECT PERCENTAGE CALCULATION */}
          {/* ========================================================================= */}
          {modalTab === 'payments' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-850/80 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>حساب نسب الدفعات مباشرة من قيمة العقد:</span>
                    <span className="text-amber-400 font-mono text-xs">
                      {formatMoney(contractValue)} {currency}
                    </span>
                  </h4>
                  <p className="text-2xs text-slate-400">
                    أدخل النسبة المئوية % لكل دفعة وسيقوم النظام باحتساب المبلغ بالريال فوراً، أو العكس.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-2xs font-semibold text-slate-300 shrink-0">
                  <span className="px-2 text-slate-400">تقسيم متساوٍ:</span>
                  {[2, 3, 4, 5, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => applyPreset(num)}
                      className="px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition"
                    >
                      {num} دفعات
                    </button>
                  ))}
                </div>
              </div>

              {/* Payments List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {draftPayments.map((dp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-mono font-bold text-2xs text-amber-400 shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={dp.title}
                          onChange={(e) =>
                            setDraftPayments((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: e.target.value } : item))
                            )
                          }
                          placeholder="بيان الدفعة"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium text-xs focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      {draftPayments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftPayment(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="حذف هذه الدفعة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      {/* Percentage Input */}
                      <div>
                        <label className="text-2xs text-amber-400 font-bold block mb-0.5">
                          النسبة المئوية (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="100"
                            value={dp.percentage}
                            onChange={(e) => handlePaymentPercentageChange(idx, Number(e.target.value))}
                            className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                            required
                          />
                          <span className="absolute left-2.5 top-1 text-slate-500 font-bold">%</span>
                        </div>
                      </div>

                      {/* Due Amount Input */}
                      <div>
                        <label className="text-2xs text-slate-400 block mb-0.5">المبلغ المحسوب ({currency})</label>
                        <input
                          type="number"
                          min="1"
                          value={dp.amount}
                          onChange={(e) => handlePaymentAmountChange(idx, Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
                          required
                        />
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="text-2xs text-slate-400 block mb-0.5">تاريخ الاستحقاق</label>
                        <input
                          type="date"
                          value={dp.dueDate}
                          onChange={(e) =>
                            setDraftPayments((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, dueDate: e.target.value } : item))
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                        />
                      </div>

                      {/* Advance Collected Checkbox */}
                      <div className="flex items-center pt-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={dp.isPaid}
                            onChange={(e) =>
                              setDraftPayments((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, isPaid: e.target.checked } : item))
                              )
                            }
                            className="accent-emerald-500 w-4 h-4 rounded"
                          />
                          <span className={dp.isPaid ? 'text-emerald-400 font-bold' : ''}>
                            محصلة مسبقاً ✅
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payments Footer with Total Summary */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAddDraftPayment}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>+ إضافة دفعة جديدة</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    مجموع النسب:{' '}
                    <strong className={totalPaymentsPct === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                      {totalPaymentsPct}% {totalPaymentsPct === 100 && '✓'}
                    </strong>
                  </div>
                  <div>
                    إجمالي المبالغ:{' '}
                    <strong className={totalPaymentsAmount === contractValue ? 'text-emerald-400' : 'text-amber-400'}>
                      {formatMoney(totalPaymentsAmount)} / {formatMoney(contractValue)} {currency}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: STAGES CUSTOMIZATION & WEIGHTS */}
          {/* ========================================================================= */}
          {modalTab === 'stages' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-850/80 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>مراحل التنفيذ التشغيلية وأوزانها:</span>
                  </h4>
                  <p className="text-2xs text-slate-400">
                    يمكنك إضافة أو حذف أو تعديل أي مرحلة وتحديد وزنها من إجمالي إنجاز المشروع الميداني.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddDraftStage}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مرحلة جديدة</span>
                </button>
              </div>

              {/* Stages List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {draftStages.map((stg, idx) => (
                  <div
                    key={stg.id}
                    className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-mono font-bold text-2xs text-blue-400 shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={stg.name}
                          onChange={(e) =>
                            setDraftStages((prev) =>
                              prev.map((s) => (s.id === stg.id ? { ...s, name: e.target.value } : s))
                            )
                          }
                          placeholder="اسم المرحلة"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium text-xs focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      {draftStages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftStage(stg.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="حذف هذه المرحلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-2xs text-slate-400 block mb-0.5">وزن المرحلة (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={stg.weight}
                            onChange={(e) =>
                              setDraftStages((prev) =>
                                prev.map((s) => (s.id === stg.id ? { ...s, weight: Number(e.target.value) } : s))
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
                            required
                          />
                          <span className="absolute left-2.5 top-1 text-slate-500 font-bold">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-2xs text-slate-400 block mb-0.5">الحالة الحالية</label>
                        <select
                          value={stg.status}
                          onChange={(e) =>
                            setDraftStages((prev) =>
                              prev.map((s) => (s.id === stg.id ? { ...s, status: e.target.value as StageStatus } : s))
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs cursor-pointer"
                        >
                          <option value="لم تبدأ">لم تبدأ</option>
                          <option value="قيد التنفيذ">قيد التنفيذ</option>
                          <option value="مكتملة">مكتملة</option>
                          <option value="معلقة">معلقة</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-2xs text-slate-400 block mb-0.5">تاريخ البدء المخطط</label>
                        <input
                          type="date"
                          value={stg.plannedStartDate}
                          onChange={(e) =>
                            setDraftStages((prev) =>
                              prev.map((s) => (s.id === stg.id ? { ...s, plannedStartDate: e.target.value } : s))
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-2xs text-slate-400 block mb-0.5">تاريخ الانتهاء المخطط</label>
                        <input
                          type="date"
                          value={stg.plannedEndDate}
                          onChange={(e) =>
                            setDraftStages((prev) =>
                              prev.map((s) => (s.id === stg.id ? { ...s, plannedEndDate: e.target.value } : s))
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">مجموع أوزان المراحل:</span>
                <strong className={totalStagesWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                  {totalStagesWeight}% {totalStagesWeight === 100 && '✓'}
                </strong>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg transition active:scale-95"
            >
              اعتماد وإنشاء المشروع ({draftPayments.length} دفعات • {draftStages.length} مراحل)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
