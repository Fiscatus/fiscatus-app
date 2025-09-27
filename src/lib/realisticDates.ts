import { businessDaysDiff } from "@/lib/business-days/utils";

export type RealisticDateConfig = {
  now?: Date;
  isCompleted?: boolean;
  closedAt?: string;
  maxDaysBack?: number;
  maxDaysForward?: number;
  holidays?: string[];
};

export type RealisticTimeline = {
  startedAt: string;
  reviewStartAt?: string;
  reviewDueAt?: string;
  dueAt: string;
  closedAt?: string;
  hasReview: boolean;
};

// Gerar datas realistas baseadas na data atual
export function generateRealisticDates(config: RealisticDateConfig = {}): RealisticTimeline {
  const now = config.now || new Date();
  const maxDaysBack = config.maxDaysBack || 30;
  const maxDaysForward = config.maxDaysForward || 30;
  const holidays = config.holidays || [];
  
  // Se concluído, usar data de fechamento como referência
  const referenceDate = config.isCompleted && config.closedAt 
    ? new Date(config.closedAt) 
    : now;

  // Normalizar para fuso São Paulo
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(12, 0, 0, 0);
    return normalized;
  };

  // Calcular dias úteis entre datas
  const businessDays = (start: Date, end: Date) => 
    businessDaysDiff(start, end, { holidays });

  // Gerar início da etapa (entre 1 e 30 dias atrás)
  const daysBack = Math.floor(Math.random() * Math.min(maxDaysBack, 20)) + 1;
  const startedAt = new Date(referenceDate);
  startedAt.setDate(startedAt.getDate() - daysBack);
  startedAt.setHours(9, 0, 0, 0);

  // Decidir se terá revisão (70% de chance)
  const hasReview = Math.random() > 0.3;

  let reviewStartAt: string | undefined;
  let reviewDueAt: string | undefined;

  if (hasReview) {
    // Início da revisão: entre 1 e 5 dias úteis após o início
    const reviewStartDays = Math.floor(Math.random() * 4) + 1;
    const reviewStart = new Date(startedAt);
    reviewStart.setDate(reviewStart.getDate() + reviewStartDays);
    reviewStart.setHours(14, 30, 0, 0);
    reviewStartAt = reviewStart.toISOString();

    // Prazo da revisão: entre 2 e 10 dias úteis após início da revisão
    const reviewDueDays = Math.floor(Math.random() * 8) + 2;
    const reviewDue = new Date(reviewStart);
    reviewDue.setDate(reviewDue.getDate() + reviewDueDays);
    reviewDue.setHours(17, 0, 0, 0);
    reviewDueAt = reviewDue.toISOString();
  }

  // Prazo final: entre 2 e 20 dias úteis após o início
  const totalDays = Math.floor(Math.random() * 18) + 2;
  const dueAt = new Date(startedAt);
  dueAt.setDate(dueAt.getDate() + totalDays);
  dueAt.setHours(18, 0, 0, 0);

  // Se concluído, gerar data de fechamento
  let closedAt: string | undefined;
  if (config.isCompleted) {
    // Fechamento pode ser antes ou depois do prazo
    const isLate = Math.random() > 0.6; // 40% de chance de atraso
    const closeDate = new Date(dueAt);
    
    if (isLate) {
      // Atraso: entre 1 e 5 dias úteis
      const lateDays = Math.floor(Math.random() * 4) + 1;
      closeDate.setDate(closeDate.getDate() + lateDays);
    } else {
      // Adiantado: entre 0 e 3 dias úteis
      const earlyDays = Math.floor(Math.random() * 3);
      closeDate.setDate(closeDate.getDate() - earlyDays);
    }
    
    closeDate.setHours(16, 0, 0, 0);
    closedAt = closeDate.toISOString();
  }

  return {
    startedAt: startedAt.toISOString(),
    reviewStartAt,
    reviewDueAt,
    dueAt: dueAt.toISOString(),
    closedAt,
    hasReview
  };
}

// Validar e corrigir ordem cronológica
export function validateAndFixTimeline(timeline: RealisticTimeline): RealisticTimeline {
  const { startedAt, reviewStartAt, reviewDueAt, dueAt, closedAt } = timeline;
  
  const start = new Date(startedAt);
  const reviewStart = reviewStartAt ? new Date(reviewStartAt) : null;
  const reviewDue = reviewDueAt ? new Date(reviewDueAt) : null;
  const due = new Date(dueAt);
  const closed = closedAt ? new Date(closedAt) : null;

  // Corrigir início da revisão se necessário
  if (reviewStart && reviewStart <= start) {
    reviewStart.setDate(start.getDate() + 1);
    reviewStart.setHours(14, 30, 0, 0);
  }

  // Corrigir prazo da revisão se necessário
  if (reviewDue && reviewStart && reviewDue <= reviewStart) {
    reviewDue.setDate(reviewStart.getDate() + 1);
    reviewDue.setHours(17, 0, 0, 0);
  }

  // Corrigir prazo final se necessário
  const latestReview = reviewDue || reviewStart;
  if (latestReview && due <= latestReview) {
    due.setDate(latestReview.getDate() + 1);
    due.setHours(18, 0, 0, 0);
  }

  // Corrigir data de fechamento se necessário
  if (closed && closed < start) {
    closed.setDate(due.getDate() + 1);
    closed.setHours(16, 0, 0, 0);
  }

  return {
    startedAt: start.toISOString(),
    reviewStartAt: reviewStart?.toISOString(),
    reviewDueAt: reviewDue?.toISOString(),
    dueAt: due.toISOString(),
    closedAt: closed?.toISOString(),
    hasReview: !!reviewStartAt
  };
}

// Gerar timeline para diferentes cenários
export function generateTimelineForScenario(scenario: 'on_time' | 'late' | 'early' | 'in_review'): RealisticTimeline {
  const now = new Date();
  
  switch (scenario) {
    case 'on_time':
      return generateRealisticDates({ 
        now, 
        isCompleted: true,
        maxDaysBack: 15,
        maxDaysForward: 5
      });
      
    case 'late':
      return generateRealisticDates({ 
        now, 
        isCompleted: true,
        maxDaysBack: 20,
        maxDaysForward: 10
      });
      
    case 'early':
      return generateRealisticDates({ 
        now, 
        isCompleted: true,
        maxDaysBack: 10,
        maxDaysForward: 5
      });
      
    case 'in_review':
      return generateRealisticDates({ 
        now, 
        isCompleted: false,
        maxDaysBack: 10,
        maxDaysForward: 15
      });
      
    default:
      return generateRealisticDates({ now });
  }
}

