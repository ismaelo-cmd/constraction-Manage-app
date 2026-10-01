import React, { useState, useMemo } from 'react';
import { Project, ProjectPayment, ProjectStage, StageStatus, PaymentStatus, KPIStats, Subcontractor, SubcontractorPayment } from './types';
import { initialProjects, initialClients, initialSubcontractors, databaseSchema, formulaLibrary } from './data/mockData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SubcontractorsView } from './components/SubcontractorsView';
import { SubcontractorDetailModal } from './components/SubcontractorDetailModal';
import { AddSubcontractorModal } from './components/AddSubcontractorModal';
import { DisburseSubPaymentModal } from './components/DisburseSubPaymentModal';
import { SchemaView } from './components/SchemaView';
import { FormulasView } from './components/FormulasView';
import { LookerStudioView } from './components/LookerStudioView';
import { GuideView } from './components/GuideView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AddPaymentModal } from './components/AddPaymentModal';
import { AddProjectModal } from './components/AddProjectModal';
import { SmartImportModal } from './components/SmartImportModal';
import { StageNotificationCenterModal } from './components/StageNotificationCenterModal';
import { CreateProjectFromContractModal } from './components/CreateProjectFromContractModal';
import { getAllStageAlerts } from './utils/stageAlerts';
import { CheckCircle2, Building2, HardHat, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(initialSubcontractors);
  const [clients, setClients] = useState(initialClients);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subcontractors' | 'schema' | 'formulas' | 'looker' | 'guide'>('dashboard');
  const [currency, setCurrency] = useState<string>('ر.س');

  // Stage alerts calculated across all projects
  const allStageAlerts = useMemo(() => getAllStageAlerts(projects), [projects]);
  const [isStageNotificationsOpen, setIsStageNotificationsOpen] = useState(false);
  const [isCreateFromContractOpen, setIsCreateFromContractOpen] = useState(false);

  // Modals state
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [selectedSubcontractorForDetail, setSelectedSubcontractorForDetail] = useState<Subcontractor | null>(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [addPaymentProjectId, setAddPaymentProjectId] = useState<string | undefined>(undefined);
  const [addPaymentPaymentId, setAddPaymentPaymentId] = useState<string | undefined>(undefined);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);

  // Subcontractor modals state
  const [isAddSubcontractorOpen, setIsAddSubcontractorOpen] = useState(false);
  const [isDisburseSubPaymentOpen, setIsDisburseSubPaymentOpen] = useState(false);
  const [disburseSubId, setDisburseSubId] = useState<string | undefined>(undefined);
  const [disbursePaymentId, setDisbursePaymentId] = useState<string | undefined>(undefined);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recalculate KPIs whenever projects change
  const kpis: KPIStats = useMemo(() => {
    let totalContractValue = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let totalPhysical = 0;
    let activeProjectsCount = 0;
    let completedProjectsCount = 0;
    let delayedProjectsCount = 0;
    let totalPaymentsCount = 0;
    let pendingPaymentsCount = 0;
    let collectedPaymentsCount = 0;
    let delayedPaymentsCount = 0;

    projects.forEach((p) => {
      totalContractValue += p.contractValue;
      totalCollected += p.totalCollected;
      totalRemaining += p.totalRemaining;
      totalPhysical += p.physicalProgress;

      if (p.status === 'نشط') activeProjectsCount++;
      if (p.status === 'مكتمل') completedProjectsCount++;
      if (p.status === 'متعثر') delayedProjectsCount++;

      p.payments.forEach((pay) => {
        totalPaymentsCount++;
        if (pay.status === 'محصلة') collectedPaymentsCount++;
        else if (pay.status === 'متأخرة') delayedPaymentsCount++;
        else pendingPaymentsCount++;
      });
    });

    const count = projects.length || 1;
    const overallCollectionRate = totalContractValue > 0 ? (totalCollected / totalContractValue) * 100 : 0;
    const averagePhysicalProgress = totalPhysical / count;

    return {
      totalContractValue,
      totalCollected,
      totalRemaining,
      overallCollectionRate,
      averagePhysicalProgress,
      activeProjectsCount,
      completedProjectsCount,
      delayedProjectsCount,
      totalPaymentsCount,
      pendingPaymentsCount,
      collectedPaymentsCount,
      delayedPaymentsCount,
    };
  }, [projects]);

  // Handler for recording/updating payments
  const handleSavePayment = (
    projectId: string,
    paymentId: string | 'new',
    collectedAmount: number,
    voucherNumber: string,
    collectedDate: string,
    paymentMethod: 'تحويل بنكي' | 'شيك مصرفي' | 'نقدي' | 'شبكة (مدى)',
    notes: string,
    newMilestoneTitle?: string,
    newDueAmount?: number
  ) => {
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id !== projectId) return project;

        let updatedPayments = [...project.payments];

        if (paymentId === 'new') {
          const due = newDueAmount || collectedAmount;
          const remaining = Math.max(0, due - collectedAmount);
          const newStatus: PaymentStatus =
            remaining === 0 ? 'محصلة' : collectedAmount > 0 ? 'محصلة جزئياً' : 'قيد الانتظار';

          const newPay: ProjectPayment = {
            id: `PAY-${project.id}-${Date.now().toString().slice(-4)}`,
            paymentCode: `PAY-${project.projectCode.split('-').pop()}-${updatedPayments.length + 1}`,
            projectId: project.id,
            stageName: project.currentStage,
            milestoneTitle: newMilestoneTitle || 'مستخلص إضافي جديد',
            dueAmount: due,
            collectedAmount,
            remainingAmount: remaining,
            dueDate: collectedDate,
            collectedDate,
            voucherNumber,
            paymentMethod,
            status: newStatus,
            notes,
          };
          updatedPayments.push(newPay);
        } else {
          updatedPayments = updatedPayments.map((p) => {
            if (p.id !== paymentId) return p;

            const newCollected = p.collectedAmount + collectedAmount;
            const newRemaining = Math.max(0, p.dueAmount - newCollected);
            const status: PaymentStatus =
              newRemaining === 0
                ? 'محصلة'
                : newCollected > 0
                ? 'محصلة جزئياً'
                : 'قيد الانتظار';

            return {
              ...p,
              collectedAmount: newCollected,
              remainingAmount: newRemaining,
              collectedDate,
              voucherNumber: voucherNumber || p.voucherNumber,
              paymentMethod: paymentMethod || p.paymentMethod,
              notes: notes ? `${p.notes ? p.notes + ' | ' : ''}${notes}` : p.notes,
              status,
            };
          });
        }

        // Recalculate Project totals
        const totalCollected = updatedPayments.reduce((acc, pay) => acc + pay.collectedAmount, 0);
        const totalRemaining = Math.max(0, project.contractValue - totalCollected);
        const financialProgress =
          project.contractValue > 0 ? (totalCollected / project.contractValue) * 100 : 0;

        const updatedProj = {
          ...project,
          payments: updatedPayments,
          totalCollected,
          totalRemaining,
          financialProgress,
        };

        // If modal was viewing this project, update it
        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      });
    });

    showToast(`تم اعتماد سند القبض بمبلغ ${new Intl.NumberFormat('ar-SA').format(collectedAmount)} ${currency} بنجاح!`);
  };

  // Handler for editing an existing payment
  const handleUpdatePayment = (projectId: string, updatedPayment: ProjectPayment) => {
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id !== projectId) return project;

        const updatedPayments = project.payments.map((p) =>
          p.id === updatedPayment.id ? updatedPayment : p
        );

        const totalCollected = updatedPayments.reduce((acc, pay) => acc + pay.collectedAmount, 0);
        const totalRemaining = Math.max(0, project.contractValue - totalCollected);
        const financialProgress =
          project.contractValue > 0 ? (totalCollected / project.contractValue) * 100 : 0;

        const updatedProj = {
          ...project,
          payments: updatedPayments,
          totalCollected,
          totalRemaining,
          financialProgress,
        };

        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      });
    });

    showToast('تم تعديل بيانات الدفعة والمبالغ المستحقة بنجاح.');
  };

  // Handler for deleting a payment
  const handleDeletePayment = (projectId: string, paymentId: string) => {
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id !== projectId) return project;

        const updatedPayments = project.payments.filter((p) => p.id !== paymentId);

        const totalCollected = updatedPayments.reduce((acc, pay) => acc + pay.collectedAmount, 0);
        const totalRemaining = Math.max(0, project.contractValue - totalCollected);
        const financialProgress =
          project.contractValue > 0 ? (totalCollected / project.contractValue) * 100 : 0;

        const updatedProj = {
          ...project,
          payments: updatedPayments,
          totalCollected,
          totalRemaining,
          financialProgress,
        };

        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      });
    });

    showToast('تم حذف الدفعة وتحديث رصيد المشروع فوراً.');
  };

  // Handler for smart file import
  const handleImportData = (importedProjects: Project[], countPayments: number) => {
    setProjects((prev) => [...importedProjects, ...prev]);
    showToast(`تم استيراد ${importedProjects.length} مشاريع قديمة بنجاح، وتوزيع ${countPayments} دفعة مرتبطة بها!`);
  };

  // Subcontractor Handlers
  const handleSaveSubcontractor = (newSub: Subcontractor) => {
    setSubcontractors((prev) => [newSub, ...prev]);
    showToast(`تمت إضافة مقاول الباطن "${newSub.name}" بنجاح.`);
  };

  const handleSaveDisbursement = (
    subcontractorId: string,
    paymentId: string,
    paidAmount: number,
    voucherNumber: string,
    paidDate: string,
    paymentMethod: 'تحويل بنكي' | 'شيك مصرفي' | 'نقدي',
    notes: string
  ) => {
    setSubcontractors((prevSubs) => {
      return prevSubs.map((sub) => {
        if (sub.id !== subcontractorId) return sub;

        const updatedPayments = sub.payments.map((p) => {
          if (p.id !== paymentId) return p;

          const newPaid = p.paidAmount + paidAmount;
          const newRemaining = Math.max(0, p.dueAmount - newPaid);
          const newStatus =
            newRemaining === 0 ? 'مسددة' : newPaid > 0 ? 'مسددة جزئياً' : 'قيد المراجعة';

          return {
            ...p,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            paidDate,
            voucherNumber: voucherNumber || p.voucherNumber,
            paymentMethod: paymentMethod || p.paymentMethod,
            notes: notes ? `${p.notes ? p.notes + ' | ' : ''}${notes}` : p.notes,
            status: newStatus as any,
          };
        });

        const totalPaid = updatedPayments.reduce((acc, pay) => acc + pay.paidAmount, 0);
        const totalRemaining = Math.max(0, sub.contractValue - totalPaid);

        const updatedSub = {
          ...sub,
          payments: updatedPayments,
          totalPaid,
          totalRemaining,
        };

        if (selectedSubcontractorForDetail?.id === subcontractorId) {
          setSelectedSubcontractorForDetail(updatedSub);
        }

        return updatedSub;
      });
    });

    showToast(`تم اعتماد سند صرف بمبلغ ${new Intl.NumberFormat('ar-SA').format(paidAmount)} ${currency} لمقاول الباطن بنجاح!`);
  };

  const handleEditSubPayment = (subcontractorId: string, updatedPayment: SubcontractorPayment) => {
    setSubcontractors((prevSubs) => {
      return prevSubs.map((sub) => {
        if (sub.id !== subcontractorId) return sub;

        const updatedPayments = sub.payments.map((p) =>
          p.id === updatedPayment.id ? updatedPayment : p
        );

        const totalPaid = updatedPayments.reduce((acc, pay) => acc + pay.paidAmount, 0);
        const totalRemaining = Math.max(0, sub.contractValue - totalPaid);

        const updatedSub = {
          ...sub,
          payments: updatedPayments,
          totalPaid,
          totalRemaining,
        };

        if (selectedSubcontractorForDetail?.id === subcontractorId) {
          setSelectedSubcontractorForDetail(updatedSub);
        }

        return updatedSub;
      });
    });

    showToast('تم تحديث مستخلص مقاول الباطن بنجاح.');
  };

  const handleDeleteSubPayment = (subcontractorId: string, paymentId: string) => {
    setSubcontractors((prevSubs) => {
      return prevSubs.map((sub) => {
        if (sub.id !== subcontractorId) return sub;

        const updatedPayments = sub.payments.filter((p) => p.id !== paymentId);
        const totalPaid = updatedPayments.reduce((acc, pay) => acc + pay.paidAmount, 0);
        const totalRemaining = Math.max(0, sub.contractValue - totalPaid);

        const updatedSub = {
          ...sub,
          payments: updatedPayments,
          totalPaid,
          totalRemaining,
        };

        if (selectedSubcontractorForDetail?.id === subcontractorId) {
          setSelectedSubcontractorForDetail(updatedSub);
        }

        return updatedSub;
      });
    });

    showToast('تم حذف المستخلص وتحديث رصيد مقاول الباطن.');
  };

  const handleAddSubPayment = (
    subcontractorId: string,
    title: string,
    amount: number,
    dueDate: string
  ) => {
    setSubcontractors((prevSubs) => {
      return prevSubs.map((sub) => {
        if (sub.id !== subcontractorId) return sub;

        const newPay: SubcontractorPayment = {
          id: `${sub.id}-PAY-${Date.now().toString().slice(-4)}`,
          paymentCode: `SUB-${sub.id.split('-').pop()}-${sub.payments.length + 1}`,
          subcontractorId: sub.id,
          subcontractorName: sub.name,
          projectId: sub.projectId,
          projectName: sub.projectName,
          milestoneTitle: title,
          dueAmount: amount,
          paidAmount: 0,
          remainingAmount: amount,
          dueDate,
          status: 'قيد المراجعة',
        };

        const updatedPayments = [...sub.payments, newPay];
        const totalPaid = updatedPayments.reduce((acc, pay) => acc + pay.paidAmount, 0);
        const totalRemaining = Math.max(0, sub.contractValue - totalPaid);

        const updatedSub = {
          ...sub,
          payments: updatedPayments,
          totalPaid,
          totalRemaining,
        };

        if (selectedSubcontractorForDetail?.id === subcontractorId) {
          setSelectedSubcontractorForDetail(updatedSub);
        }

        return updatedSub;
      });
    });

    showToast('تمت إضافة المستخلص الجديد لمقاول الباطن.');
  };

  // Handler for adding new project
  const handleSaveProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    showToast(`تمت إضافة المشروع "${newProject.name}" وجدولة مراحله بنجاح!`);
  };

  // Handler for deleting a project completely
  const handleDeleteProject = (projectId: string) => {
    const projToDelete = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Clean up subcontractors tied to this project
    setSubcontractors((prev) => prev.filter((s) => s.projectId !== projectId));

    if (selectedProjectForDetail?.id === projectId) {
      setSelectedProjectForDetail(null);
    }

    showToast(`تم حذف المشروع "${projToDelete?.name || ''}" وجميع سجلاته بالكامل.`);
  };

  // Handler for deleting a subcontractor completely
  const handleDeleteSubcontractor = (subcontractorId: string) => {
    const subToDelete = subcontractors.find((s) => s.id === subcontractorId);
    setSubcontractors((prev) => prev.filter((s) => s.id !== subcontractorId));

    if (selectedSubcontractorForDetail?.id === subcontractorId) {
      setSelectedSubcontractorForDetail(null);
    }

    showToast(`تم حذف مقاول الباطن "${subToDelete?.name || ''}" وسندات صرفه بنجاح.`);
  };

  // Handler for updating a stage in a project
  const handleUpdateStage = (
    projectId: string,
    stageId: string,
    newStatus: StageStatus,
    newProgress: number,
    customActualEndDate?: string
  ) => {
    let updatedStageName = '';
    let isNowCompleted = false;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;

        const updatedStages = proj.stages.map((stg) => {
          if (stg.id !== stageId) return stg;
          updatedStageName = stg.name;
          const completed = newStatus === 'مكتملة' || newProgress === 100;
          if (completed) isNowCompleted = true;

          return {
            ...stg,
            status: newStatus,
            completionRate: newProgress,
            actualEndDate: completed
              ? (customActualEndDate || stg.actualEndDate || new Date().toISOString().split('T')[0])
              : stg.actualEndDate,
          };
        });

        // Compute overall weighted physical progress
        let totalWeighted = 0;
        let totalWeight = 0;
        updatedStages.forEach((st) => {
          totalWeighted += st.completionRate * (st.weight / 100);
          totalWeight += st.weight;
        });

        const overallPhysical = totalWeight > 0 ? Math.round(totalWeighted * (100 / totalWeight)) : 0;

        // Current active stage
        const activeStage = updatedStages.find((st) => st.status === 'قيد التنفيذ') || updatedStages[0];

        const updatedProj = {
          ...proj,
          stages: updatedStages,
          physicalProgress: overallPhysical,
          currentStage: activeStage.name,
          currentStageStatus: activeStage.status,
        };

        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      })
    );

    if (isNowCompleted) {
      showToast(`🎉 تم إنجاز مرحلة "${updatedStageName}" بنسبة 100% بنجاح! تم اعتماد تاريخ الانتهاء الفعلي وتنبيه الإدارة.`);
    } else if (newProgress >= 80) {
      showToast(`⏳ تنبيه: مرحلة "${updatedStageName}" قاربت على الانتهاء بنسبة ${newProgress}%! يرجى التنسيق المسبق للفحص والاستلام.`);
    } else {
      showToast('تم تحديث بيانات المرحلة التشغيلية بنجاح.');
    }
  };

  // Handler for adding a new stage to an existing project
  const handleAddStage = (
    projectId: string,
    stageData: {
      name: string;
      nameEn?: string;
      weight: number;
      status: StageStatus;
      plannedStartDate: string;
      plannedEndDate: string;
      notes?: string;
    }
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;

        const nextOrder = proj.stages.length + 1;
        const newStage: ProjectStage = {
          id: `${proj.id}-STG-${Date.now().toString().slice(-4)}`,
          projectId: proj.id,
          order: nextOrder,
          name: stageData.name.trim(),
          nameEn: stageData.nameEn?.trim() || `Stage ${nextOrder}`,
          status: stageData.status,
          plannedStartDate: stageData.plannedStartDate,
          plannedEndDate: stageData.plannedEndDate,
          completionRate: stageData.status === 'مكتملة' ? 100 : stageData.status === 'قيد التنفيذ' ? 30 : 0,
          weight: stageData.weight,
          notes: stageData.notes,
        };

        const updatedStages = [...proj.stages, newStage];

        // Recalculate physical progress
        let totalWeighted = 0;
        let totalWeight = 0;
        updatedStages.forEach((st) => {
          totalWeighted += st.completionRate * (st.weight / 100);
          totalWeight += st.weight;
        });
        const overallPhysical = totalWeight > 0 ? Math.round(totalWeighted * (100 / totalWeight)) : 0;
        const activeStage = updatedStages.find((st) => st.status === 'قيد التنفيذ') || updatedStages[0];

        const updatedProj = {
          ...proj,
          stages: updatedStages,
          physicalProgress: overallPhysical,
          currentStage: activeStage?.name || proj.currentStage,
          currentStageStatus: activeStage?.status || proj.currentStageStatus,
        };

        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      })
    );

    showToast(`تمت إضافة مرحلة "${stageData.name}" بنجاح.`);
  };

  // Handler for deleting a stage from a project
  const handleDeleteStage = (projectId: string, stageId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        if (proj.stages.length <= 1) {
          showToast('لا يمكن حذف المرحلة الوحيدة المتبقية للمشروع.');
          return proj;
        }

        const filteredStages = proj.stages
          .filter((stg) => stg.id !== stageId)
          .map((stg, idx) => ({ ...stg, order: idx + 1 }));

        let totalWeighted = 0;
        let totalWeight = 0;
        filteredStages.forEach((st) => {
          totalWeighted += st.completionRate * (st.weight / 100);
          totalWeight += st.weight;
        });
        const overallPhysical = totalWeight > 0 ? Math.round(totalWeighted * (100 / totalWeight)) : 0;
        const activeStage = filteredStages.find((st) => st.status === 'قيد التنفيذ') || filteredStages[0];

        const updatedProj = {
          ...proj,
          stages: filteredStages,
          physicalProgress: overallPhysical,
          currentStage: activeStage?.name || proj.currentStage,
          currentStageStatus: activeStage?.status || proj.currentStageStatus,
        };

        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      })
    );

    showToast('تم حذف المرحلة وتحديث معدل الإنجاز.');
  };

  // Handler for adding a scheduled payment to a project with auto-calculated percentage
  const handleAddProjectPayment = (
    projectId: string,
    paymentData: {
      milestoneTitle: string;
      stageName: string;
      dueAmount: number;
      percentage?: number;
      dueDate: string;
      notes?: string;
    }
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;

        const nextNum = proj.payments.length + 1;
        const calcPct =
          paymentData.percentage ??
          (proj.contractValue > 0
            ? Number(((paymentData.dueAmount / proj.contractValue) * 100).toFixed(1))
            : 0);

        const newPay: ProjectPayment = {
          id: `${proj.id}-PAY-${Date.now().toString().slice(-4)}`,
          paymentCode: `PAY-${proj.projectCode.split('-').pop()}-${String(nextNum).padStart(2, '0')}`,
          projectId: proj.id,
          stageName: paymentData.stageName,
          milestoneTitle: paymentData.milestoneTitle,
          dueAmount: paymentData.dueAmount,
          collectedAmount: 0,
          remainingAmount: paymentData.dueAmount,
          percentage: calcPct,
          dueDate: paymentData.dueDate,
          status: 'قيد الانتظار',
          notes: paymentData.notes,
        };

        const updatedPayments = [...proj.payments, newPay];
        const totalCollected = updatedPayments.reduce((acc, pay) => acc + pay.collectedAmount, 0);
        const totalRemaining = Math.max(0, proj.contractValue - totalCollected);
        const financialProgress =
          proj.contractValue > 0 ? (totalCollected / proj.contractValue) * 100 : 0;

        const updatedProj = {
          ...proj,
          payments: updatedPayments,
          totalCollected,
          totalRemaining,
          financialProgress,
        };

        if (selectedProjectForDetail?.id === projectId) {
          setSelectedProjectForDetail(updatedProj);
        }

        return updatedProj;
      })
    );

    showToast('تمت إضافة الدفعة الجديدة للمشروع بنجاح.');
  };

  // CSV Export for Google Sheets
  const handleExportCSV = () => {
    const headers = [
      'Project_Code',
      'Project_Name',
      'Client_Name',
      'Location',
      'Contract_Value',
      'Total_Collected',
      'Total_Remaining',
      'Collection_Percentage',
      'Current_Stage',
      'Physical_Progress',
      'Status',
    ];

    const rows = projects.map((p) => [
      `"${p.projectCode}"`,
      `"${p.name}"`,
      `"${p.clientName}"`,
      `"${p.location}"`,
      p.contractValue,
      p.totalCollected,
      p.totalRemaining,
      `"${p.financialProgress.toFixed(1)}%"`,
      `"${p.currentStage}"`,
      `"${p.physicalProgress}%"`,
      `"${p.status}"`,
    ]);

    const csvContent = `\uFEFF${headers.join(',')}\n` + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Contracting_Projects_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تصدير ملف البيانات بصيغة CSV المتوافقة مع Google Sheets بنجاح!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        stageAlertsCount={allStageAlerts.length}
        onOpenStageNotifications={() => setIsStageNotificationsOpen(true)}
        onOpenCreateFromContract={() => setIsCreateFromContractOpen(true)}
        onOpenAddPayment={() => {
          setAddPaymentProjectId(undefined);
          setAddPaymentPaymentId(undefined);
          setIsAddPaymentOpen(true);
        }}
        onOpenAddProject={() => setIsAddProjectOpen(true)}
        onOpenSmartImport={() => setIsSmartImportOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            subcontractors={subcontractors}
            kpis={kpis}
            currency={currency}
            stageAlerts={allStageAlerts}
            onOpenStageNotifications={() => setIsStageNotificationsOpen(true)}
            onOpenCreateFromContract={() => setIsCreateFromContractOpen(true)}
            onSelectProject={(project) => setSelectedProjectForDetail(project)}
            onOpenAddPayment={(projId, payId) => {
              setAddPaymentProjectId(projId);
              setAddPaymentPaymentId(payId);
              setIsAddPaymentOpen(true);
            }}
            onOpenAddProject={() => setIsAddProjectOpen(true)}
            onOpenSmartImport={() => setIsSmartImportOpen(true)}
            onNavigateToSubcontractors={() => setActiveTab('subcontractors')}
            onDeleteProject={handleDeleteProject}
            onDeleteSubcontractor={handleDeleteSubcontractor}
            onOpenDisbursePayment={(subId, payId) => {
              setDisburseSubId(subId);
              setDisbursePaymentId(payId);
              setIsDisburseSubPaymentOpen(true);
            }}
          />
        )}

        {activeTab === 'subcontractors' && (
          <SubcontractorsView
            subcontractors={subcontractors}
            projects={projects}
            currency={currency}
            onOpenAddSubcontractor={() => setIsAddSubcontractorOpen(true)}
            onOpenDisbursePayment={(subId, payId) => {
              setDisburseSubId(subId);
              setDisbursePaymentId(payId);
              setIsDisburseSubPaymentOpen(true);
            }}
            onEditSubcontractorPayment={handleEditSubPayment}
            onDeleteSubcontractorPayment={handleDeleteSubPayment}
            onSelectSubcontractor={(sub) => setSelectedSubcontractorForDetail(sub)}
            onDeleteSubcontractor={handleDeleteSubcontractor}
          />
        )}

        {activeTab === 'schema' && <SchemaView tables={databaseSchema} />}

        {activeTab === 'formulas' && (
          <FormulasView formulas={formulaLibrary} currency={currency} />
        )}

        {activeTab === 'looker' && <LookerStudioView />}

        {activeTab === 'guide' && <GuideView />}
      </main>

      {/* Modals */}
      {selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          subcontractors={subcontractors}
          currency={currency}
          onClose={() => setSelectedProjectForDetail(null)}
          onAddPaymentClick={(projId, payId) => {
            setAddPaymentProjectId(projId);
            setAddPaymentPaymentId(payId);
            setIsAddPaymentOpen(true);
          }}
          onUpdateStage={handleUpdateStage}
          onAddStage={handleAddStage}
          onDeleteStage={handleDeleteStage}
          onAddProjectPayment={handleAddProjectPayment}
          onUpdatePayment={handleUpdatePayment}
          onDeletePayment={handleDeletePayment}
          onOpenDisbursePayment={(subId, payId) => {
            setDisburseSubId(subId);
            setDisbursePaymentId(payId);
            setIsDisburseSubPaymentOpen(true);
          }}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {selectedSubcontractorForDetail && (
        <SubcontractorDetailModal
          subcontractor={selectedSubcontractorForDetail}
          currency={currency}
          onClose={() => setSelectedSubcontractorForDetail(null)}
          onOpenDisburse={(subId, payId) => {
            setDisburseSubId(subId);
            setDisbursePaymentId(payId);
            setIsDisburseSubPaymentOpen(true);
          }}
          onAddSubPayment={handleAddSubPayment}
          onDeleteSubPayment={handleDeleteSubPayment}
          onEditSubPayment={handleEditSubPayment}
          onDeleteSubcontractor={handleDeleteSubcontractor}
        />
      )}

      {isAddSubcontractorOpen && (
        <AddSubcontractorModal
          projects={projects}
          currency={currency}
          onClose={() => setIsAddSubcontractorOpen(false)}
          onSaveSubcontractor={handleSaveSubcontractor}
        />
      )}

      {isDisburseSubPaymentOpen && (
        <DisburseSubPaymentModal
          subcontractors={subcontractors}
          preSelectedSubcontractorId={disburseSubId}
          preSelectedPaymentId={disbursePaymentId}
          currency={currency}
          onClose={() => setIsDisburseSubPaymentOpen(false)}
          onSaveDisbursement={handleSaveDisbursement}
        />
      )}

      {isAddPaymentOpen && (
        <AddPaymentModal
          projects={projects}
          preSelectedProjectId={addPaymentProjectId}
          preSelectedPaymentId={addPaymentPaymentId}
          currency={currency}
          onClose={() => setIsAddPaymentOpen(false)}
          onSavePayment={handleSavePayment}
        />
      )}

      {isAddProjectOpen && (
        <AddProjectModal
          clients={clients}
          currency={currency}
          onClose={() => setIsAddProjectOpen(false)}
          onSaveProject={handleSaveProject}
        />
      )}

      {isSmartImportOpen && (
        <SmartImportModal
          existingProjects={projects}
          currency={currency}
          onClose={() => setIsSmartImportOpen(false)}
          onImportData={handleImportData}
        />
      )}

      {/* Stage Notification Center Modal */}
      <StageNotificationCenterModal
        isOpen={isStageNotificationsOpen}
        onClose={() => setIsStageNotificationsOpen(false)}
        alerts={allStageAlerts}
        currency={currency}
        onSelectProject={(projId) => {
          const prj = projects.find((p) => p.id === projId);
          if (prj) {
            setSelectedProjectForDetail(prj);
          }
        }}
        onOpenRecordPayment={(projId) => {
          setAddPaymentProjectId(projId);
          setAddPaymentPaymentId(undefined);
          setIsAddPaymentOpen(true);
        }}
      />

      {/* Create Project from Contract (PDF) Modal */}
      <CreateProjectFromContractModal
        isOpen={isCreateFromContractOpen}
        onClose={() => setIsCreateFromContractOpen(false)}
        currency={currency}
        clients={clients}
        onSaveProject={(newProj) => {
          handleSaveProject(newProj);
          showToast(`🎉 تم إنشاء مشروع "${newProj.name}" من العقد بنجاح (${newProj.stages.length} مراحل و ${newProj.payments.length} دفعات)!`);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <span>
              نظام بنيان لإدارة مشاريع المقاولات • محرك قواعد بيانات Google Sheets وتطبيقات AppSheet ولوحات Looker Studio
            </span>
          </div>

          <div className="flex items-center gap-4 text-2xs text-slate-500">
            <span>تحديث فوري للحسابات</span>
            <span>•</span>
            <span>دعم العملات الإقليمية</span>
            <span>•</span>
            <span>جاهز للربط السحابي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
