import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
