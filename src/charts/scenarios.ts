import type { Data, Layout } from 'plotly.js'
import { formatarPercentual, statusCenarios } from '../services/calculations'
import type { Report } from '../types/report'
import { FONTE, ROSA, ROXO, TEXTO, type FiguraPlotly } from './estilo'

// Barras (quantidade) + linha rosa (percentual), como no modelo
export function criarGraficoStatus(
  report: Report,
  largura: number,
  altura: number,
): FiguraPlotly {
  const itens = statusCenarios(report)
  const nomes = itens.map((i) => i.rotulo)
  const quantidades = itens.map((i) => i.valor)
  const percentuais = itens.map((i) => i.percentual)

  const maiorQtd = Math.max(...quantidades) || 1
  const maiorPct = Math.max(...percentuais) || 100

  // Barra baixa demais não comporta o número dentro (o Plotly giraria o texto
  // ou ele sumiria no fundo branco). Nesses casos a quantidade vai para o
  // rótulo de percentual: "4,65% (30)".
  const cabeDentro = quantidades.map((q) => q > 0 && q >= maiorQtd * 0.12)

  const barras: Data = {
    type: 'bar',
    x: nomes,
    y: quantidades,
    width: 0.32,
    marker: { color: ROXO },
    text: quantidades.map((q, i) => (cabeDentro[i] ? `<b>${q}</b>` : '')),
    textposition: 'inside',
    insidetextanchor: 'middle',
    textfont: { color: 'white', size: 11 },
    // Propriedades que o Plotly conhece mas o @types/plotly.js não declara:
    // texto sempre na horizontal e sem encolher para caber na barra
    ...{ textangle: 0, constraintext: 'none' },
    hoverinfo: 'skip',
  }

  const linha: Data = {
    type: 'scatter',
    mode: 'text+lines+markers',
    x: nomes,
    y: percentuais,
    yaxis: 'y2',
    line: { color: ROSA, width: 2.5 },
    marker: { color: ROSA, size: 6 },
    text: percentuais.map((p, i) => {
      const extra = quantidades[i] > 0 && !cabeDentro[i] ? ` (${quantidades[i]})` : ''
      return `<b>${formatarPercentual(p)}${extra}</b>`
    }),
    textposition: 'top center',
    textfont: { color: TEXTO, size: 10 },
    hoverinfo: 'skip',
  }

  const layout: Partial<Layout> = {
    width: largura,
    height: altura,
    margin: { l: 10, r: 10, t: 10, b: 28 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false,
    font: { family: FONTE },
    xaxis: {
      showgrid: false,
      linecolor: '#D0D0D0',
      tickfont: { size: 10, color: '#666666' },
    },
    yaxis: { range: [0, maiorQtd * 1.3], visible: false },
    yaxis2: {
      range: [0, maiorPct * 1.18],
      visible: false,
      overlaying: 'y',
      side: 'right',
    },
  }

  return { data: [barras, linha], layout }
}