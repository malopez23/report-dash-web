import type { Report } from '../types/report'
import { somaStatus } from './calculations'
import { formatarData } from './datas'

export interface ResultadoValidacao {
  erros: string[] // bloqueiam a geração
  avisos: string[] // só alertam
}

export function validarReport(report: Report): ResultadoValidacao {
  const erros: string[] = []
  const avisos: string[] = []

  // ---------- Erros ----------
  if (!report.titulo.trim()) {
    erros.push('Informe o título do report.')
  }

  if (report.totalCenarios <= 0) {
    erros.push('Informe o Total de Cenários (maior que zero).')
  } else {
    const soma = somaStatus(report)
    if (soma !== report.totalCenarios) {
      erros.push(
        `A soma dos status (${soma}) é diferente do Total de Cenários ` +
          `(${report.totalCenarios}). Pendente + Sucesso + Falha + ` +
          `Bloqueado + N/A deve ser igual ao total.`,
      )
    }
  }

  if (report.burnup.some((dia) => !dia.data)) {
    erros.push('Há um dia do Burnup sem data.')
  }
  const diasComData = report.burnup.filter((dia) => dia.data)

  // Datas repetidas no Burnup
  const contagem = new Map<string, number>()
  for (const dia of diasComData) {
    contagem.set(dia.data, (contagem.get(dia.data) ?? 0) + 1)
  }
  const repetidas = [...contagem.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [data, vezes] of repetidas) {
    if (vezes > 1) {
      erros.push(`A data ${formatarData(data)} aparece ${vezes} vezes no Burnup.`)
    }
  }

  // ---------- Avisos ----------
  const ordenados = [...diasComData].sort((a, b) => a.data.localeCompare(b.data))
  for (const dia of ordenados) {
    const data = formatarData(dia.data)
    if (dia.executado > dia.planejado) {
      avisos.push(
        `Em ${data}, o Executado (${dia.executado}) é maior que o ` +
          `Planejado (${dia.planejado}).`,
      )
    }
    if (report.totalCenarios > 0 && dia.executado > report.totalCenarios) {
      avisos.push(
        `Em ${data}, o Executado (${dia.executado}) é maior que o ` +
          `Total de Cenários (${report.totalCenarios}).`,
      )
    }
  }

  return { erros, avisos }
}