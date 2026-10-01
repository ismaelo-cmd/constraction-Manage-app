import { ProjectType, ProjectStage, ProjectPayment } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if in browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface ExtractedContractData {
  projectName: string;
  projectType: ProjectType;
  clientName: string;
  location: string;
  engineerInCharge: string;
  contractValue: number;
  startDate: string;
  durationMonths: number;
  expectedEndDate: string;
  stages: Array<{
    name: string;
    nameEn: string;
    weight: number;
    plannedStartDate: string;
    plannedEndDate: string;
  }>;
  payments: Array<{
    milestoneTitle: string;
    percentage: number;
    dueAmount: number;
    stageName: string;
    dueDate: string;
  }>;
  rawTextPreview?: string;
  fileName?: string;
}

/**
 * Extracts plain text from an uploaded PDF File
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    
    let fullText = '';
    const numPages = Math.min(pdfDoc.numPages, 10); // Extract up to 10 pages

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n--- صفحة ${pageNum} ---\n` + pageStrings;
    }

    return fullText.trim();
  } catch (error) {
    console.warn('PDF extraction failed or worker error:', error);
    // If PDF text extraction throws, return empty or fallback
    return '';
  }
}

/**
 * Calculates an ISO end date by adding months to an ISO start date
 */
export function addMonthsToDate(startDateStr: string, months: number): string {
  try {
    const [y, m, d] = startDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  } catch {
    return new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
}

/**
 * Generates tailored operational stages and payment milestones based on project type and duration
 */
export function generateDefaultStagesAndPayments(
  type: ProjectType,
  contractValue: number,
  startDateStr: string,
  durationMonths: number
) {
  const months = Math.max(1, durationMonths);
  const stageDurationDays = Math.round((months * 30) / 4);

  const getStageDate = (offsetDays: number) => {
    const [y, m, d] = startDateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d + offsetDays);
    return dt.toISOString().split('T')[0];
  };

  switch (type) {
    case 'سباكة':
      return {
        stages: [
          {
            name: 'تأسيس شبكات الصرف المعلق والمدفون',
            nameEn: 'Drainage Rough-in',
            weight: 25,
            plannedStartDate: getStageDate(0),
            plannedEndDate: getStageDate(stageDurationDays),
          },
          {
            name: 'تمديد خطوط التغذية والمحابس الحرارية (PPR)',
            nameEn: 'Water Supply Piping',
            weight: 30,
            plannedStartDate: getStageDate(stageDurationDays + 1),
            plannedEndDate: getStageDate(stageDurationDays * 2),
          },
          {
            name: 'اختبارات ضغط المياه والعزل والاعتماد',
            nameEn: 'Pressure Testing & Insulation',
            weight: 25,
            plannedStartDate: getStageDate(stageDurationDays * 2 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 3),
          },
          {
            name: 'تركيب الأدوات الصحية والخلاطات والتسليم',
            nameEn: 'Sanitary Fixtures & Handover',
            weight: 20,
            plannedStartDate: getStageDate(stageDurationDays * 3 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 4),
          },
        ],
        payments: [
          {
            milestoneTitle: 'دفعة مقدمة عند توقيع عقد السباكة وتوريد المواسير',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'تأسيس شبكات الصرف المعلق والمدفون',
            dueDate: getStageDate(5),
          },
          {
            milestoneTitle: 'دفعة الانتهاء من شبكات الصرف وتمديدات التغذية',
            percentage: 30,
            dueAmount: Math.round(contractValue * 0.30),
            stageName: 'تمديد خطوط التغذية والمحابس الحرارية (PPR)',
            dueDate: getStageDate(stageDurationDays * 2),
          },
          {
            milestoneTitle: 'دفعة اجتياز اختبارات ضغط النيتروجين والاعتماد',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'اختبارات ضغط المياه والعزل والاعتماد',
            dueDate: getStageDate(stageDurationDays * 3),
          },
          {
            milestoneTitle: 'دفعة ختامية عند تركيب الأجهزة والتشغيل والتسليم',
            percentage: 20,
            dueAmount: Math.round(contractValue * 0.20),
            stageName: 'تركيب الأدوات الصحية والخلاطات والتسليم',
            dueDate: getStageDate(stageDurationDays * 4),
          },
        ],
      };

    case 'كهرباء':
      return {
        stages: [
          {
            name: 'تكسير وتمديد ليات وخراطيم الجدران والأسقف',
            nameEn: 'Conduit & Slab Piping',
            weight: 25,
            plannedStartDate: getStageDate(0),
            plannedEndDate: getStageDate(stageDurationDays),
          },
          {
            name: 'سحب الأسلاك وتأسيس علب المفاتيح وتأريض اللوحات',
            nameEn: 'Wire Pulling & Earthing',
            weight: 30,
            plannedStartDate: getStageDate(stageDurationDays + 1),
            plannedEndDate: getStageDate(stageDurationDays * 2),
          },
          {
            name: 'تجميع وتركيب القواطع واللوحات الرئيسية والفرعية (DB)',
            nameEn: 'Distribution Boards Assembly',
            weight: 25,
            plannedStartDate: getStageDate(stageDurationDays * 2 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 3),
          },
          {
            name: 'تركيب وحدات الإنارة والأفياش وإطلاق التيار والتسليم',
            nameEn: 'Lighting Fixtures & Energization',
            weight: 20,
            plannedStartDate: getStageDate(stageDurationDays * 3 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 4),
          },
        ],
        payments: [
          {
            milestoneTitle: 'دفعة مقدمة وتوريد الخراطيم والأسلاك المعتمدة',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'تكسير وتمديد ليات وخراطيم الجدران والأسقف',
            dueDate: getStageDate(5),
          },
          {
            milestoneTitle: 'دفعة الانتهاء من سحب الأسلاك وتمديدات الجدران',
            percentage: 30,
            dueAmount: Math.round(contractValue * 0.30),
            stageName: 'سحب الأسلاك وتأسيس علب المفاتيح وتأريض اللوحات',
            dueDate: getStageDate(stageDurationDays * 2),
          },
          {
            milestoneTitle: 'دفعة تركيب اللوحات وتوصيل القواطع الكهربائية',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'تجميع وتركيب القواطع واللوحات الرئيسية والفرعية (DB)',
            dueDate: getStageDate(stageDurationDays * 3),
          },
          {
            milestoneTitle: 'دفعة التسليم النهائي بعد فحص التيار والإنارة',
            percentage: 20,
            dueAmount: Math.round(contractValue * 0.20),
            stageName: 'تركيب وحدات الإنارة والأفياش وإطلاق التيار والتسليم',
            dueDate: getStageDate(stageDurationDays * 4),
          },
        ],
      };

    case 'تكييف':
      return {
        stages: [
          {
            name: 'تمديد مواسير النحاس ومسارات الدكت والعزل',
            nameEn: 'Copper Piping & Ductwork',
            weight: 30,
            plannedStartDate: getStageDate(0),
            plannedEndDate: getStageDate(stageDurationDays),
          },
          {
            name: 'توريد وتعليق الوحدات الداخلية (Indoor Units)',
            nameEn: 'Indoor Units Installation',
            weight: 25,
            plannedStartDate: getStageDate(stageDurationDays + 1),
            plannedEndDate: getStageDate(stageDurationDays * 2),
          },
          {
            name: 'تركيب المكثفات والوحدات الخارجية (Outdoor Units)',
            nameEn: 'Outdoor Units & Compressors',
            weight: 25,
            plannedStartDate: getStageDate(stageDurationDays * 2 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 3),
          },
          {
            name: 'شحن الفريون واختبارات التبريد وموازنة الهواء (TAB)',
            nameEn: 'Refrigerant & Air Balancing',
            weight: 20,
            plannedStartDate: getStageDate(stageDurationDays * 3 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 4),
          },
        ],
        payments: [
          {
            milestoneTitle: 'دفعة مقدمة وتوريد النحاس والصاج ومواد العزل',
            percentage: 30,
            dueAmount: Math.round(contractValue * 0.30),
            stageName: 'تمديد مواسير النحاس ومسارات الدكت والعزل',
            dueDate: getStageDate(5),
          },
          {
            milestoneTitle: 'دفعة الانتهاء من الدكت وتعليق الماكينات الداخلية',
            percentage: 30,
            dueAmount: Math.round(contractValue * 0.30),
            stageName: 'توريد وتعليق الوحدات الداخلية (Indoor Units)',
            dueDate: getStageDate(stageDurationDays * 2),
          },
          {
            milestoneTitle: 'دفعة تركيب الوحدات الخارجية وشبكة الصرف والكهرباء',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'تركيب المكثفات والوحدات الخارجية (Outdoor Units)',
            dueDate: getStageDate(stageDurationDays * 3),
          },
          {
            milestoneTitle: 'دفعة التشغيل والتبريد والفحص ومخالصة التسليم',
            percentage: 15,
            dueAmount: Math.round(contractValue * 0.15),
            stageName: 'شحن الفريون واختبارات التبريد وموازنة الهواء (TAB)',
            dueDate: getStageDate(stageDurationDays * 4),
          },
        ],
      };

    case 'تشطيب وديكور':
      return {
        stages: [
          {
            name: 'أعمال الأسقف المستعارة والجبس بورد والقواطع',
            nameEn: 'Gypsum Board & Ceilings',
            weight: 25,
            plannedStartDate: getStageDate(0),
            plannedEndDate: getStageDate(stageDurationDays),
          },
          {
            name: 'أعمال البلاط والرخام والبورسلان للأرضيات والجدران',
            nameEn: 'Tiling, Porcelain & Flooring',
            weight: 30,
            plannedStartDate: getStageDate(stageDurationDays + 1),
            plannedEndDate: getStageDate(stageDurationDays * 2),
          },
          {
            name: 'أعمال المعجون والدهانات والبروفايل والديكورات',
            nameEn: 'Painting & Decorative Wall Finishes',
            weight: 25,
            plannedStartDate: getStageDate(stageDurationDays * 2 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 3),
          },
          {
            name: 'تركيب الأبواب والألمنيوم والإكسسوارات والتسليم',
            nameEn: 'Doors, Aluminum & Final Handover',
            weight: 20,
            plannedStartDate: getStageDate(stageDurationDays * 3 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 4),
          },
        ],
        payments: [
          {
            milestoneTitle: 'دفعة مقدمة وتوريد المواد والجبس بورد',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'أعمال الأسقف المستعارة والجبس بورد والقواطع',
            dueDate: getStageDate(5),
          },
          {
            milestoneTitle: 'دفعة الانتهاء من بلاط الأرضيات والجبسيات',
            percentage: 30,
            dueAmount: Math.round(contractValue * 0.30),
            stageName: 'أعمال البلاط والرخام والبورسلان للأرضيات والجدران',
            dueDate: getStageDate(stageDurationDays * 2),
          },
          {
            milestoneTitle: 'دفعة الانتهاء من الدهانات والتشطيبات الجدارية',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'أعمال المعجون والدهانات والبروفايل والديكورات',
            dueDate: getStageDate(stageDurationDays * 3),
          },
          {
            milestoneTitle: 'دفعة مخالصة التسليم النهائي والضمان',
            percentage: 20,
            dueAmount: Math.round(contractValue * 0.20),
            stageName: 'تركيب الأبواب والألمنيوم والإكسسوارات والتسليم',
            dueDate: getStageDate(stageDurationDays * 4),
          },
        ],
      };

    case 'مقاولات عامة وإنشائي':
    default:
      return {
        stages: [
          {
            name: 'الحفر والإحلال وتجهيز الأساسات والقواعد',
            nameEn: 'Excavation & Foundations',
            weight: 25,
            plannedStartDate: getStageDate(0),
            plannedEndDate: getStageDate(stageDurationDays),
          },
          {
            name: 'الهيكل الإنشائي وصب الأعمدة والأسقف (العظم)',
            nameEn: 'Structural Concrete Frame',
            weight: 35,
            plannedStartDate: getStageDate(stageDurationDays + 1),
            plannedEndDate: getStageDate(stageDurationDays * 2),
          },
          {
            name: 'أعمال البلوك واللياسة والعوازل والتأسيسات',
            nameEn: 'Masonry, Plaster & MEP Rough-in',
            weight: 25,
            plannedStartDate: getStageDate(stageDurationDays * 2 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 3),
          },
          {
            name: 'التشطيبات والواجهات والتسليم النهائي للمشروع',
            nameEn: 'Finishes, Facades & Final Delivery',
            weight: 15,
            plannedStartDate: getStageDate(stageDurationDays * 3 + 1),
            plannedEndDate: getStageDate(stageDurationDays * 4),
          },
        ],
        payments: [
          {
            milestoneTitle: 'الدفعة الأولى: مقدمة العقد وتجهيز الموقع والحفر',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'الحفر والإحلال وتجهيز الأساسات والقواعد',
            dueDate: getStageDate(5),
          },
          {
            milestoneTitle: 'الدفعة الثانية: الانتهاء من صب القواعد والميدات',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'الهيكل الإنشائي وصب الأعمدة والأسقف (العظم)',
            dueDate: getStageDate(stageDurationDays),
          },
          {
            milestoneTitle: 'الدفعة الثالثة: الانتهاء من صب أسقف الهيكل الإنشائي',
            percentage: 25,
            dueAmount: Math.round(contractValue * 0.25),
            stageName: 'الهيكل الإنشائي وصب الأعمدة والأسقف (العظم)',
            dueDate: getStageDate(stageDurationDays * 2),
          },
          {
            milestoneTitle: 'الدفعة الرابعة: الانتهاء من أعمال اللياسة والتأسيسات',
            percentage: 15,
            dueAmount: Math.round(contractValue * 0.15),
            stageName: 'أعمال البلوك واللياسة والعوازل والتأسيسات',
            dueDate: getStageDate(stageDurationDays * 3),
          },
          {
            milestoneTitle: 'الدفعة الخامسة: مخالصة الاستلام النهائي للمبنى',
            percentage: 10,
            dueAmount: Math.round(contractValue * 0.10),
            stageName: 'التشطيبات والواجهات والتسليم النهائي للمشروع',
            dueDate: getStageDate(stageDurationDays * 4),
          },
        ],
      };
  }
}

/**
 * Intelligent parser that extracts structured project and payment data from contract text
 */
export function parseContractText(text: string, fileName?: string): ExtractedContractData {
  const clean = text.replace(/\r/g, ' ');

  // 1. Detect Project Type
  let projectType: ProjectType = 'مقاولات عامة وإنشائي';
  if (/سباك|صحي|مياه|تغذية|صرف|بيارات|مضخات|مواسير/i.test(clean)) {
    projectType = 'سباكة';
  } else if (/تكييف|تبريد|دكت|داكت|hvac|فريون|مكيفات|مجاري هواء/i.test(clean)) {
    projectType = 'تكييف';
  } else if (/كهرب|إنارة|قواطع|لوحات توزيع|أسلاك|تمديد كابلات|محولات|جهد/i.test(clean)) {
    projectType = 'كهرباء';
  } else if (/تشطيب|ديكور|دهان|جبس|بورسلان|أرضيات|رخام|أسقف مستعارة/i.test(clean)) {
    projectType = 'تشطيب وديكور';
  }

  // 2. Detect Contract Value
  let contractValue = 0;
  // Match patterns like: بمبلغ وقدره 1,250,000 ريال, or قيمة العقد: 850000
  const valueMatch = clean.match(/(?:قيمة العقد|المبلغ الإجمالي|إجمالي العقد|مبلغ وقدره|قيمة المشروع|الإجمالي)[\s:]*([0-9,.]+)\s*(?:ريال|ر\.س|SAR)?/i);
  if (valueMatch && valueMatch[1]) {
    const rawNum = valueMatch[1].replace(/,/g, '');
    const num = parseFloat(rawNum);
    if (!isNaN(num) && num > 1000) {
      contractValue = Math.round(num);
    }
  }

  // Fallback value regex if no keyword prefix found
  if (contractValue === 0) {
    const fallbackMatch = clean.match(/([0-9]{1,3}(?:,[0-9]{3})+)\s*(?:ريال|ر\.س)/);
    if (fallbackMatch && fallbackMatch[1]) {
      const num = parseFloat(fallbackMatch[1].replace(/,/g, ''));
      if (!isNaN(num) && num > 10000) {
        contractValue = Math.round(num);
      }
    }
  }

  // Sensible default if not found
  if (contractValue === 0) {
    contractValue = projectType === 'سباكة' ? 380000 : projectType === 'كهرباء' ? 520000 : projectType === 'تكييف' ? 640000 : 1250000;
  }

  // 3. Detect Duration in Months or Days
  let durationMonths = 6;
  const durationMatch = clean.match(/(?:مدة العقد|مدة التنفيذ|فترة التنفيذ|مدة المشروع)[\s:]*([0-9]+)\s*(شهر|أشهر|يوما|يوم|أسبوع|أسابيع)/i);
  if (durationMatch) {
    const val = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2];
    if (!isNaN(val) && val > 0) {
      if (unit.includes('يوم')) {
        durationMonths = Math.max(1, Math.round(val / 30));
      } else if (unit.includes('أسبوع')) {
        durationMonths = Math.max(1, Math.round(val / 4));
      } else {
        durationMonths = Math.min(36, Math.max(1, val));
      }
    }
  }

  // 4. Detect Start Date
  let startDate = new Date().toISOString().split('T')[0];
  const dateMatch = clean.match(/(?:تاريخ العقد|تاريخ البدء|يبدأ من تاريخ|الموافق)[\s:]*([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{4})/);
  if (dateMatch && dateMatch[1]) {
    const rawDate = dateMatch[1].replace(/\//g, '-');
    const parts = rawDate.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      startDate = `${y}-${m}-${d}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      const y = parts[2];
      const m = parts[1].padStart(2, '0');
      const d = parts[0].padStart(2, '0');
      startDate = `${y}-${m}-${d}`;
    }
  }

  const expectedEndDate = addMonthsToDate(startDate, durationMonths);

  // 5. Detect Client / First Party
  let clientName = 'شركة العميل المعتمد';
  const clientMatch = clean.match(/(?:الطرف الأول|المالك|السيد|العميل|المؤسسة)[\s:،-]*([^\n\r،.]{3,40})/i);
  if (clientMatch && clientMatch[1]) {
    const cand = clientMatch[1].trim();
    if (cand.length > 2 && !cand.includes('المملكة') && !cand.includes('العقد')) {
      clientName = cand;
    }
  }

  // 6. Detect Project Name
  let projectName = '';
  const projectMatch = clean.match(/(?:مشروع|اسم المشروع|عملية|موضوع العقد)[\s:،-]*([^\n\r،.]{4,60})/i);
  if (projectMatch && projectMatch[1]) {
    projectName = projectMatch[1].trim();
  }

  if (!projectName) {
    if (fileName) {
      projectName = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    } else {
      projectName = `مشروع أعمال ${projectType} - ${clientName}`;
    }
  }

  // 7. Location
  let location = 'الرياض - حي النرجس';
  const locMatch = clean.match(/(?:موقع المشروع|الموقع|المدينة|العنوان)[\s:،-]*([^\n\r،.]{3,40})/i);
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim();
  }

  // 8. Generate appropriate stages & payments
  const defaults = generateDefaultStagesAndPayments(projectType, contractValue, startDate, durationMonths);

  return {
    projectName,
    projectType,
    clientName,
    location,
    engineerInCharge: 'م. فهد السبيعي',
    contractValue,
    startDate,
    durationMonths,
    expectedEndDate,
    stages: defaults.stages,
    payments: defaults.payments,
    rawTextPreview: clean.slice(0, 1500),
    fileName,
  };
}

/**
 * High-fidelity pre-configured sample PDF contract templates for instant testing
 */
export const sampleContracts: Array<{
  id: string;
  title: string;
  type: ProjectType;
  description: string;
  contractValue: number;
  durationMonths: number;
  simulatedText: string;
}> = [
  {
    id: 'sample-plumbing',
    title: 'عقد مقاولة أعمال السباكة والصحي المتكاملة (برج الياسمين)',
    type: 'سباكة',
    description: 'عقد سباكة متكامل بقيمة 420,000 ر.س يشمل شبكات الصرف والتغذية واختبارات الضغط والأدوات الصحية على 4 دفعات.',
    contractValue: 420000,
    durationMonths: 5,
    simulatedText: `
عقد مقاولة أعمال السباكة والتغذية والصرف الصحي
الطرف الأول (المالك): شركة أبراج اليمامة للتطوير العقاري
الطرف الثاني (المقاول المنفذ): مؤسسة بنيان المتقدمة للمقاولات
موضوع العقد: مشروع أعمال السباكة والصرف الصحي والتغذية - برج الياسمين
موقع المشروع: الرياض - حي الياسمين
قيمة العقد الإجمالية: 420,000 ريال سعودي (أربعمائة وعشرون ألف ريال)
مدة العقد: 5 أشهر تبدأ من تاريخ 2025-03-01
جدول الدفعات والمستخلصات:
1. الدفعة الأولى (25%): دفعة مقدمة عند توقيع العقد وتوريد المواسير وقدرها 105,000 ريال.
2. الدفعة الثانية (30%): بعد إنجاز شبكات الصرف المعلق وتمديد خطوط التغذية وقدرها 126,000 ريال.
3. الدفعة الثالثة (25%): بعد اجتياز اختبارات ضغط النيتروجين والاعتماد وقدرها 105,000 ريال.
4. الدفعة الرابعة (20%): دفعة ختامية عند تركيب الأجهزة الصحية والتسليم وقدرها 84,000 ريال.
    `,
  },
  {
    id: 'sample-electricity',
    title: 'عقد توريد وتنفيذ التمديدات والشبكات الكهربائية (مجمع المعالي)',
    type: 'كهرباء',
    description: 'عقد تمديدات كهربائية بقيمة 560,000 ر.س يشمل الليات وسحب الأسلاك وتجميع اللوحات والإنارة على 4 دفعات.',
    contractValue: 560000,
    durationMonths: 6,
    simulatedText: `
عقد مقاولة تنفيذ الأعمال الكهربائية والشبكات
الطرف الأول (المالك): مجموعة المعالي التجارية المحدودة
الطرف الثاني (المقاول): شركة بنيان للحلول الكهروميكانيكية
موضوع العقد: مشروع الشبكات الكهربائية والإنارة وتأريض اللوحات - مجمع المعالي التجاري
موقع المشروع: جدة - طريق الملك فهد
قيمة العقد: 560,000 ريال سعودي
مدة التنفيذ: 6 أشهر تبدأ من تاريخ 2025-02-15
جدول سداد المستخلصات:
1. دفعة مقدمة وتوريد الخراطيم والكابلات (25%) وقدرها 140,000 ريال.
2. دفعة سحب الأسلاك وتأسيس القواطع (30%) وقدرها 168,000 ريال.
3. دفعة تجميع وتركيب اللوحات الرئيسية والفرعية (25%) وقدرها 140,000 ريال.
4. دفعة ختامية بعد فحص التيار والإنارة وإطلاق الكهرباء (20%) وقدرها 112,000 ريال.
    `,
  },
  {
    id: 'sample-hvac',
    title: 'عقد توريد وتركيب أنظمة التكييف المركزي والدكت (مستشفى الشفاء)',
    type: 'تكييف',
    description: 'عقد تكييف HVAC بقيمة 780,000 ر.س يشمل الدكت والنحاس والماكينات والشحن وموازنة الهواء على 4 دفعات.',
    contractValue: 780000,
    durationMonths: 4,
    simulatedText: `
عقد توريد وتركيب أنظمة التكييف ومجاري الهواء (HVAC)
الطرف الأول: شركة الشفاء الطبية الاستثمارية
الطرف الثاني: مؤسسة بنيان للتكييف والتبريد
موضوع العقد: مشروع توريد وتركيب أجهزة التكييف المركزي ومسارات الدكت والعزل
الموقع: الخبر - حي الحزام الذهبي
قيمة العقد الإجمالية: 780,000 ريال سعودي
مدة العقد: 4 أشهر من تاريخ 2025-04-01
دفعات المشروع:
1. الدفعة الأولى (30%): دفعة مقدمة وتوريد الصاج والنحاس وقدرها 234,000 ريال.
2. الدفعة الثانية (30%): الانتهاء من الدكت وتعليق الماكينات الداخلية وقدرها 234,000 ريال.
3. الدفعة الثالثة (25%): تركيب الوحدات الخارجية والمكثفات وقدرها 195,000 ريال.
4. الدفعة الرابعة (15%): شحن الفريون والتشغيل وموازنة الهواء وقدرها 117,000 ريال.
    `,
  },
  {
    id: 'sample-general',
    title: 'عقد مقاولة إنشاء وبناء هيكل إنشائي وتشطيب (فيلا النخيل)',
    type: 'مقاولات عامة وإنشائي',
    description: 'عقد مقاولات عامة بقيمة 1,650,000 ر.س يشمل الحفر والأساسات والعظم واللياسة والتسليم على 5 دفعات.',
    contractValue: 1650000,
    durationMonths: 8,
    simulatedText: `
عقد مقاولة عامة إنشاء وتسليم مبنى سكني
الطرف الأول: الشيخ منصور بن عبد العزيز الراجحي
الطرف الثاني: شركة بنيان للمقاولات العامة
موضوع العقد: مشروع إنشاء فيلا سكنية فاخرة (عظم ومباني ولياسة)
الموقع: الرياض - حي النخيل الغربي
قيمة العقد: 1,650,000 ريال سعودي (مليون وستمائة وخمسون ألف ريال)
مدة العقد: 8 أشهر تبدأ من تاريخ 2025-01-20
الدفعات والمستخلصات:
1. دفعة مقدمة عند توقيع العقد (25%) وقدرها 412,500 ريال.
2. دفعة صبة القواعد والميدات (25%) وقدرها 412,500 ريال.
3. دفعة الانتهاء من صب أسقف الهيكل الإنشائي (25%) وقدرها 412,500 ريال.
4. دفعة إنجاز اللياسة والتأسيسات (15%) وقدرها 247,500 ريال.
5. دفعة مخالصة الاستلام النهائي (10%) وقدرها 165,000 ريال.
    `,
  },
];
