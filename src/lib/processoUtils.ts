/**
 * Converte um número de processo com prefixo (DFD, ETP, TR) para o formato "Processo Administrativo"
 * @param numeroProcesso - Número do processo (ex: "DFD 012/2025", "ETP 045/2025")
 * @returns Número convertido para "Processo Administrativo XXX/YYYY"
 */
export function converterNumeroProcesso(numeroProcesso: string): string {
  // Se já está no formato "Processo Administrativo", retorna como está
  if (numeroProcesso.includes("Processo administrativo")) {
    return numeroProcesso;
  }

  // Extrair o número e ano do processo
  const match = numeroProcesso.match(/(?:DFD|ETP|TR)\s*(\d+)\/(\d+)/);
  if (match) {
    const numero = match[1];
    const ano = match[2];
    return `Processo administrativo ${numero}/${ano}`;
  }

  // Se não conseguir extrair, retorna como está
  return numeroProcesso;
}

/**
 * Converte um número de processo para o formato "Processo Administrativo" se necessário
 * @param numeroProcesso - Número do processo
 * @returns Número convertido
 */
export function formatarNumeroProcesso(numeroProcesso: string): string {
  return converterNumeroProcesso(numeroProcesso);
}

/**
 * Gera um novo número de processo no formato "Processo Administrativo"
 * @param numero - Número sequencial
 * @param ano - Ano do processo
 * @returns Número formatado
 */
export function gerarNumeroProcessoAdministrativo(numero: number, ano: number): string {
  return `Processo administrativo ${numero.toString().padStart(3, '0')}/${ano}`;
} 