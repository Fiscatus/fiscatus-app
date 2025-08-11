// Retorna a data de "hoje" no fuso selecionado em ISO yyyy-MM-dd
export function getTodayISO(tz: string = "America/Sao_Paulo"): string {
  // Se o timezone for local, usar a data local diretamente
  if (tz === "America/Sao_Paulo" || tz === Intl.DateTimeFormat().resolvedOptions().timeZone) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Para outros timezones, usar Intl.DateTimeFormat
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz, 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const dd = parts.find(p => p.type === "day")!.value;
  const mm = parts.find(p => p.type === "month")!.value;
  const yyyy = parts.find(p => p.type === "year")!.value;
  return `${yyyy}-${mm}-${dd}`;
}

// Função auxiliar para verificar se uma data é hoje
export function isToday(date: string | Date, tz: string = "America/Sao_Paulo"): boolean {
  const todayISO = getTodayISO(tz);
  const dateISO = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  return dateISO === todayISO;
}

// Função para formatar data para exibição no formato brasileiro
export function formatDateForDisplay(date: string | Date, tz: string = "America/Sao_Paulo"): string {
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit", 
    year: "numeric"
  });
  return fmt.format(date);
}
