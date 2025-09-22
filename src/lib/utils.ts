import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o padrão DD/MM/AAAA
 * @param dateString - Data em formato ISO ou string
 * @returns Data formatada como DD/MM/AAAA
 */
export function formatDateBR(dateString: string | Date): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

/**
 * Formata uma data e hora para o padrão DD/MM/AAAA HH:MM
 * @param dateString - Data em formato ISO ou string
 * @returns Data e hora formatada como DD/MM/AAAA HH:MM
 */
export function formatDateTimeBR(dateString: string | Date): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return '';
  }
}

/**
 * Formata uma data para o padrão DD/MM/AAAA HH:MM:SS
 * @param dateString - Data em formato ISO ou string
 * @returns Data e hora formatada como DD/MM/AAAA HH:MM:SS
 */
export function formatDateTimeFullBR(dateString: string | Date): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora completa:', error);
    return '';
  }
}

// Função para calcular dias úteis entre duas datas
export function calcularDiasUteis(dataInicio: string, dataFim?: string): number {
  const inicio = new Date(dataInicio);
  const fim = dataFim ? new Date(dataFim) : new Date();
  
  let diasUteis = 0;
  const dataAtual = new Date(inicio);
  
  while (dataAtual <= fim) {
    // 0 = Domingo, 6 = Sábado
    if (dataAtual.getDay() !== 0 && dataAtual.getDay() !== 6) {
      diasUteis++;
    }
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return diasUteis;
}

// Função para extrair número de dias de uma string de prazo
export function extrairDiasDoPrazo(prazoPrevisao: string): number {
  const match = prazoPrevisao.match(/(\d+)\s*dia/);
  return match ? parseInt(match[1]) : 0;
}

// Função para determinar se uma etapa está atrasada
export function etapaEstaAtrasada(
  status: string,
  dataInicio?: string,
  prazoPrevisao: string
): boolean {
  // Se já está concluída, não está atrasada
  if (status === 'concluido') {
    return false;
  }
  
  // Se não tem data de início, não está atrasada
  if (!dataInicio) {
    return false;
  }
  
  const diasUteisConsumidos = calcularDiasUteis(dataInicio);
  const prazoPrevisto = extrairDiasDoPrazo(prazoPrevisao);
  
  return diasUteisConsumidos > prazoPrevisto;
}

// Função para determinar a cor da borda baseada no status e prazo
export function getBordaEtapa(
  status: string,
  dataInicio?: string,
  prazoPrevisao: string
): string {
  // Etapa Concluída - Borda verde
  if (status === 'concluido') {
    return 'border-green-500';
  }
  
  // Etapa Atrasada - Borda vermelha
  if (etapaEstaAtrasada(status, dataInicio, prazoPrevisao)) {
    return 'border-red-500';
  }
  
  // Etapa Em Andamento e Dentro do Prazo - Borda azul
  if (status === 'andamento') {
    return 'border-blue-500';
  }
  
  // Etapa Pendente e Dentro do Prazo - Borda padrão (cinza)
  return 'border-gray-300';
}

// Legenda padronizada para dias restantes/atraso
export function legendaDiasRestantes(diasRestantes: number | null): string {
  if (diasRestantes === null) return 'Sem prazo definido';
  if (diasRestantes < 0) return 'dias em atraso';
  if (diasRestantes <= 2) return 'dias restantes (urgente)';
  return 'dias restantes';
}

// Classes de cor padronizadas para prazo
export function classesPrazo(diasRestantes: number | null): { text: string; badge: string } {
  if (diasRestantes === null) return { text: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' };
  if (diasRestantes < 0) return { text: 'text-red-600', badge: 'bg-red-100 text-red-800' };
  if (diasRestantes <= 2) return { text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' };
  return { text: 'text-green-600', badge: 'bg-green-100 text-green-800' };
}