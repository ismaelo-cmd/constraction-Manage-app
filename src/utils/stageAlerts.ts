import { Project, ProjectStage, StageAlert, StageAlertType } from '../types';

/**
 * Calculates calendar days difference between a target date string (YYYY-MM-DD) and a reference date
 * Returns positive if targetDate is in the future, negative if in the past, 0 if today.
 */
export function getDaysDifference(targetDateStr: string, referenceDate: Date = new Date()): number {
  if (!targetDateStr) return 0;
  
  const [year, month, day] = targetDateStr.split('-').map(Number);
  if (!year || !month || !day) return 0;

  const target = new Date(year, month - 1, day);
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const diffTime = target.getTime() - ref.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats the days difference into natural Arabic text
 */
export function formatDaysDifference(days: number): string {
  if (days === 0) return 'ينتهي اليوم';
  if (days === 1) return 'متبقي يوم واحد';
  if (days === 2) return 'متبقي يومان';
  if (days > 2 && days <= 10) return `متبقي ${days} أيام`;
  if (days > 10) return `متبقي ${days} يوماً`;
  
  const absDays = Math.abs(days);
  if (absDays === 1) return 'متأخرة منذ يوم';
  if (absDays === 2) return 'متأخرة منذ يومين';
  if (absDays > 2 && absDays <= 10) return `متأخرة منذ ${absDays} أيام`;
  return `متأخرة منذ ${absDays} يوماً`;
}

/**
 * Checks a specific stage and generates an alert if applicable:
 * - When approaching deadline (<= 7 days remaining)
 * - When approaching completion by rate (>= 80% and < 100%)
 * - After completion (status === 'مكتملة' or completionRate === 100)
 * - When overdue (plannedEndDate passed and completionRate < 100)
 */
export function getStageAlert(
  stage: ProjectStage,
  project: Project,
  nextStage?: ProjectStage,
  referenceDate: Date = new Date()
): StageAlert | null {
  const isCompleted = stage.status === 'مكتملة' || stage.completionRate === 100;
  const daysDiff = getDaysDifference(stage.plannedEndDate, referenceDate);

  // 1. After Completion (تم الانتهاء منها)
  if (isCompleted) {
    return {
      id: `alert-completed-${stage.id}`,
      stageId: stage.id,
      stageName: stage.name,
      stageNameEn: stage.nameEn,
      stageOrder: stage.order,
      projectId: project.id,
      projectName: project.name,
      projectCode: project.projectCode,
      projectType: project.projectType,
      type: 'completed',
      title: `✅ تم إنجاز المرحلة: ${stage.name}`,
      message: `تم الانتهاء بنجاح من كافة متطلبات مرحلة "${stage.name}" بنسبة 100%${
        stage.actualEndDate ? ` (تاريخ الإنجاز الميداني: ${stage.actualEndDate})` : ''
      }.`,
      severity: 'success',
      daysDifference: daysDiff,
      plannedStartDate: stage.plannedStartDate,
      plannedEndDate: stage.plannedEndDate,
      actualEndDate: stage.actualEndDate,
      completionRate: 100,
      weight: stage.weight,
      status: 'مكتملة',
      actionRecommendation: nextStage
        ? `اعتماد محضر الاستلام الابتدائي والانتقال لتجهيز المرحلة التالية: "${nextStage.name}".`
        : 'تم استيفاء كامل المراحل بنجاح! جاهز للتسليم النهائي للمشروع ومخالصة العميل.',
      nextStageName: nextStage?.name,
    };
  }

  // 2. Overdue (تجاوزت موعد الانتهاء دون اكتمال)
  if (daysDiff < 0 && !isCompleted) {
    const daysLate = Math.abs(daysDiff);
    return {
      id: `alert-overdue-${stage.id}`,
      stageId: stage.id,
      stageName: stage.name,
      stageNameEn: stage.nameEn,
      stageOrder: stage.order,
      projectId: project.id,
      projectName: project.name,
      projectCode: project.projectCode,
      projectType: project.projectType,
      type: 'overdue',
      title: `⚠️ تأخر مرحلة: ${stage.name} (${daysLate} يوم تأخير)`,
      message: `تجاوزت مرحلة "${stage.name}" موعد التسليم المخطط بـ ${daysLate} ${
        daysLate === 1 ? 'يوم' : daysLate === 2 ? 'يومين' : 'أيام'
      }. نسبة الإنجاز الحالية: ${stage.completionRate}% فقط (الموعد كان: ${stage.plannedEndDate}).`,
      severity: 'urgent',
      daysDifference: daysDiff,
      plannedStartDate: stage.plannedStartDate,
      plannedEndDate: stage.plannedEndDate,
      completionRate: stage.completionRate,
      weight: stage.weight,
      status: stage.status,
      actionRecommendation: 'تكثيف فرق العمل والعمالة ومراجعة مقاول الباطن لمعالجة أسباب التعثر وتحديث المخطط الزمني.',
      nextStageName: nextStage?.name,
    };
  }

  // 3. Approaching Deadline (قرب انتهاء موعد المرحلة: متبقي 7 أيام أو أقل)
  if (daysDiff >= 0 && daysDiff <= 7 && !isCompleted && stage.status !== 'لم تبدأ') {
    const isUrgent = daysDiff <= 2;
    return {
      id: `alert-approaching-date-${stage.id}`,
      stageId: stage.id,
      stageName: stage.name,
      stageNameEn: stage.nameEn,
      stageOrder: stage.order,
      projectId: project.id,
      projectName: project.name,
      projectCode: project.projectCode,
      projectType: project.projectType,
      type: 'approaching_deadline',
      title: daysDiff === 0
        ? `⏳ موعد انتهاء المرحلة اليوم: ${stage.name}`
        : daysDiff === 1
        ? `⏳ موعد انتهاء المرحلة غداً: ${stage.name}`
        : `⏳ قرب انتهاء المرحلة: ${stage.name} (متبقي ${daysDiff} أيام)`,
      message: `المرحلة تقترب من موعد التسليم النهائي المخطط (${stage.plannedEndDate}). الإنجاز الحالي: ${stage.completionRate}%.`,
      severity: isUrgent ? 'urgent' : 'warning',
      daysDifference: daysDiff,
      plannedStartDate: stage.plannedStartDate,
      plannedEndDate: stage.plannedEndDate,
      completionRate: stage.completionRate,
      weight: stage.weight,
      status: stage.status,
      actionRecommendation: 'فحص الأعمال المنفذة والتنسيق مع المهندس المشرف لتجهيز محضر الاستلام والبدء في استحقاق الدفعة.',
      nextStageName: nextStage?.name,
    };
  }

  // 4. Approaching Completion by Rate (قرب الاكتمال الميداني بنسبة 80% فأكثر)
  if (stage.completionRate >= 80 && stage.completionRate < 100 && !isCompleted) {
    return {
      id: `alert-approaching-rate-${stage.id}`,
      stageId: stage.id,
      stageName: stage.name,
      stageNameEn: stage.nameEn,
      stageOrder: stage.order,
      projectId: project.id,
      projectName: project.name,
      projectCode: project.projectCode,
      projectType: project.projectType,
      type: 'approaching_completion',
      title: `⚡ مرحلة شارفت على الانتهاء: ${stage.name} (${stage.completionRate}%)`,
      message: `وصلت المرحلة إلى نسبة إنجاز متقدمة (${stage.completionRate}%) وتقترب من الإغلاق الكامل. موعد التسليم: ${stage.plannedEndDate}.`,
      severity: 'info',
      daysDifference: daysDiff,
      plannedStartDate: stage.plannedStartDate,
      plannedEndDate: stage.plannedEndDate,
      completionRate: stage.completionRate,
      weight: stage.weight,
      status: stage.status,
      actionRecommendation: 'تجهيز مسودة سند القبض والمستخلص المالي وإشعار العميل بقرب انتهاء البند.',
      nextStageName: nextStage?.name,
    };
  }

  return null;
}

/**
 * Returns all stage alerts across all given projects
 */
export function getAllStageAlerts(projects: Project[], referenceDate: Date = new Date()): StageAlert[] {
  const alerts: StageAlert[] = [];

  projects.forEach((proj) => {
    const stages = proj.stages || [];
    stages.forEach((stg, index) => {
      const nextStage = stages[index + 1];
      const alert = getStageAlert(stg, proj, nextStage, referenceDate);
      if (alert) {
        alerts.push(alert);
      }
    });
  });

  // Sort alerts priority:
  // 1. Overdue (urgent)
  // 2. Approaching deadline (sorted by least days remaining)
  // 3. Approaching completion
  // 4. Completed (recently done)
  return alerts.sort((a, b) => {
    const priorityOrder: Record<StageAlert['type'], number> = {
      overdue: 1,
      approaching_deadline: 2,
      approaching_completion: 3,
      completed: 4,
    };

    if (priorityOrder[a.type] !== priorityOrder[b.type]) {
      return priorityOrder[a.type] - priorityOrder[b.type];
    }

    if (a.type === 'approaching_deadline' && b.type === 'approaching_deadline') {
      return a.daysDifference - b.daysDifference;
    }

    return b.completionRate - a.completionRate;
  });
}

/**
 * Returns all stage alerts for a specific project
 */
export function getProjectStageAlerts(project: Project, referenceDate: Date = new Date()): StageAlert[] {
  const alerts: StageAlert[] = [];
  const stages = project.stages || [];

  stages.forEach((stg, index) => {
    const nextStage = stages[index + 1];
    const alert = getStageAlert(stg, project, nextStage, referenceDate);
    if (alert) {
      alerts.push(alert);
    }
  });

  return alerts;
}

/**
 * Returns UI style badge details based on alert type & severity
 */
export function getAlertBadgeStyle(type: StageAlertType, severity: StageAlert['severity']) {
  switch (type) {
    case 'completed':
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        iconColor: 'text-emerald-400',
        label: 'تم الإنجاز بالكامل',
      };
    case 'overdue':
      return {
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/50',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
        iconColor: 'text-rose-400',
        label: 'متأخرة عن المخطط',
      };
    case 'approaching_deadline':
      return severity === 'urgent'
        ? {
            bg: 'bg-rose-950/30',
            border: 'border-rose-500/40',
            text: 'text-rose-400',
            badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
            iconColor: 'text-rose-400',
            label: 'موعد التسليم وشيك جداً',
          }
        : {
            bg: 'bg-amber-950/30',
            border: 'border-amber-500/40',
            text: 'text-amber-400',
            badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
            iconColor: 'text-amber-400',
            label: 'قرب انتهاء المرحلة',
          };
    case 'approaching_completion':
    default:
      return {
        bg: 'bg-blue-950/30',
        border: 'border-blue-500/40',
        text: 'text-blue-400',
        badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        iconColor: 'text-blue-400',
        label: 'شارفت على الاكتمال (80%+)',
      };
  }
}
