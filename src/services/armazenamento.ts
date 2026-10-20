import { criarReportVazio, type DiaBurnup, type Report } from '../types/report'
import { hojeISO } from './datas'
import { baixar, nomeArquivo } from './exportar'

const CHAVE_RASCUNHO = 'report-dash:rascunho'
const VERSAO_ARQUIVO = 1
const MSG_INVALIDO = 'O arquivo não parece ser um report do Report Dash.'

// ---------- Limpeza dos dados ----------
// Tudo o que vem de fora (arquivo ou rascunho) passa por aqui, então um
// arquivo antigo, incompleto ou editado à mão nunca quebra o formulário.

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function comoTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor : ''
}

function comoInteiro(valor: unknown): number {
  if (typeof valor !== 'number' && typeof valor !== 'string') return 0
  const n = Number(valor)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 999999) : 0
}

function comoData(valor: unknown): string {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor : ''
}

export function normalizarReport(bruto: unknown): Report {
  if (!ehObjeto(bruto)) throw new Error(MSG_INVALIDO)

  // Aceita o arquivo completo { versao, report: {...} } ou só o report
  const dados = ehObjeto(bruto.report) ? bruto.report : bruto
  if (!('titulo' in dados) && !('totalCenarios' in dados)) throw new Error(MSG_INVALIDO)

  const burnup: DiaBurnup[] = Array.isArray(dados.burnup)
    ? dados.burnup.filter(ehObjeto).map((dia) => ({
        data: comoData(dia.data),
        planejado: comoInteiro(dia.planejado),
        executado: comoInteiro(dia.executado),
      }))
    : []

  const pontos: string[] = Array.isArray(dados.pontos)
    ? dados.pontos.filter((p): p is string => typeof p === 'string')
    : []

  return {
    titulo: comoTexto(dados.titulo),
    dataStatus: comoData(dados.dataStatus) || hojeISO(),
    totalCenarios: comoInteiro(dados.totalCenarios),
    pendente: comoInteiro(dados.pendente),
    sucesso: comoInteiro(dados.sucesso),
    falha: comoInteiro(dados.falha),
    bloqueado: comoInteiro(dados.bloqueado),
    na: comoInteiro(dados.na),
    incNovo: comoInteiro(dados.incNovo),
    incAndamento: comoInteiro(dados.incAndamento),
    incResolvido: comoInteiro(dados.incResolvido),
    incImprocedente: comoInteiro(dados.incImprocedente),
    impeditivos: comoInteiro(dados.impeditivos),
    burnup,
    pontos,
  }
}

// Formulário que ainda está como recém-criado (a data de hoje não conta)
export function ehVazio(report: Report): boolean {
  const semData = (r: Report) => JSON.stringify({ ...r, dataStatus: '' })
  return semData(report) === semData(criarReportVazio())
}

// ---------- Rascunho automático (no navegador) ----------
// Tudo dentro de try/catch: em janela anônima ou com o armazenamento cheio
// ou bloqueado o app continua funcionando, só sem rascunho.

export function lerRascunho(): Report | null {
  try {
    const guardado = localStorage.getItem(CHAVE_RASCUNHO)
    return guardado ? normalizarReport(JSON.parse(guardado)) : null
  } catch {
    return null
  }
}

export function salvarRascunho(report: Report): void {
  try {
    if (ehVazio(report)) localStorage.removeItem(CHAVE_RASCUNHO)
    else localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(report))
  } catch {
    // sem armazenamento disponível: ignora
  }
}

// ---------- Arquivo .json ----------

export function salvarArquivo(report: Report): void {
  const conteudo = JSON.stringify({ app: 'report-dash', versao: VERSAO_ARQUIVO, report }, null, 2)
  baixar(new Blob([conteudo], { type: 'application/json' }), nomeArquivo(report, 'json'))
}

export function lerArquivo(conteudo: string): Report {
  let bruto: unknown
  try {
    bruto = JSON.parse(conteudo)
  } catch {
    throw new Error('O arquivo não é um JSON válido.')
  }
  return normalizarReport(bruto)
}