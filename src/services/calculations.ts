import type { Report } from '../types/report'

export interface ItemStatus {
  rotulo: string
  valor: number
  percentual: number
}

export function totalIncidentes(r: Report): number {
  return r.incNovo + r.incAndamento + r.incResolvido + r.incImprocedente
}

export function somaStatus(r: Report): number {
  return r.pendente + r.sucesso + r.falha + r.bloqueado + r.na
}

export function percentual(valor: number, total: number): number {
  return total > 0 ? (valor / total) * 100 : 0
}

export function statusCenarios(r: Report): ItemStatus[] {
  const itens: [string, number][] = [
    ['Pendente', r.pendente],
    ['Sucesso', r.sucesso],
    ['Falha', r.falha],
    ['Bloqueado', r.bloqueado],
    ['N/A', r.na],
  ]
  return itens.map(([rotulo, valor]) => ({
    rotulo,
    valor,
    percentual: percentual(valor, r.totalCenarios),
  }))
}

// 54.5736 -> "54,57%"
export function formatarPercentual(p: number): string {
  return (
    p.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%'
  )
}

// 5 -> "05"
export function formatarDoisDigitos(n: number): string {
  return String(n).padStart(2, '0')
}

// "2026-10-13" -> "13/10/26"
export function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano.slice(2)}`
}