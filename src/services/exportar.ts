import { toBlob } from 'html-to-image'
import type { Report } from '../types/report'

const LARGURA_SLIDE = 1280
const ESCALA = 2 // 2x: imagem nítida em telas grandes e em apresentações

// Na tela o slide está escalado e centralizado por CSS (position absolute +
// transform). Na imagem ele precisa sair em tamanho real, no canto superior
// esquerdo. "position: static" faz a cópia ignorar left/top/inset (o navegador
// também copia as versões "lógicas" dessas propriedades, que venceriam um
// simples "left: 0").
function opcoes(slide: HTMLElement) {
  return {
    width: LARGURA_SLIDE,
    height: slide.offsetHeight,
    pixelRatio: ESCALA,
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: { position: 'static', transform: 'none', boxShadow: 'none' },
  }
}

async function gerarPng(slide: HTMLElement): Promise<Blob> {
  const blob = await toBlob(slide, opcoes(slide))
  if (!blob) throw new Error('Não foi possível gerar a imagem.')
  return blob
}

// "[QD Ecommerce] - Status Report | Fase 1" -> "QD-Ecommerce-Status-Report-Fase-1"
export function nomeArquivo(report: Report, extensao: string): string {
  const base = report.titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // tira os acentos
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'Report'}-${report.dataStatus}.${extensao}`
}

export function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function lerComoDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(leitor.error)
    leitor.readAsDataURL(blob)
  })
}

export async function baixarPng(slide: HTMLElement, report: Report) {
  baixar(await gerarPng(slide), nomeArquivo(report, 'png'))
}

export async function baixarPdf(slide: HTMLElement, report: Report) {
  const imagem = await lerComoDataUrl(await gerarPng(slide))
  const altura = slide.offsetHeight

  // O jsPDF é grande: só é carregado quando alguém pede o PDF
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: altura > LARGURA_SLIDE ? 'portrait' : 'landscape',
    unit: 'px',
    format: [LARGURA_SLIDE, altura],
    hotfixes: ['px_scaling'],
  })
  // 'FAST' comprime a imagem (sem isso o PDF passa de 10 MB)
  pdf.addImage(imagem, 'PNG', 0, 0, LARGURA_SLIDE, altura, undefined, 'FAST')
  pdf.save(nomeArquivo(report, 'pdf'))
}

export async function copiarImagem(slide: HTMLElement) {
  const blob = await gerarPng(slide)
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}