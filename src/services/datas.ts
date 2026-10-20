function formatar(data: Date): string {
  const mm = String(data.getMonth() + 1).padStart(2, '0')
  const dd = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mm}-${dd}`
}

// Data de hoje no formato "2026-10-16"
export function hojeISO(): string {
  return formatar(new Date())
}

// "2026-10-31" + 1 -> "2026-11-01"
export function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return formatar(new Date(ano, mes - 1, dia + dias))
}

// "2026-10-13" -> "13/10/2026"
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}