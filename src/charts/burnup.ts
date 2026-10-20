import type { Data, Layout } from 'plotly.js'
import { formatarData } from '../services/datas'
import type { Report } from '../types/report'
import { FONTE, ROSA, TEXTO, porPonto, type FiguraPlotly } from './estilo'

const ROXO_BURNUP = '#4A0080'
const MAX_DATAS_NA_HORIZONTAL = 9

// Duas linhas (Planejado e Executado) só nos dias que foram preenchidos.
// Dias sem teste (como fins de semana) simplesmente não entram no gráfico.
export function criarGraficoBurnup(
  report: Report,
  largura: number,
  altura: number,
): FiguraPlotly {
  // As datas são texto "aaaa-mm-dd": ordenar como texto já ordena por data
  const dias = report.burnup
    .filter((d) => d.data)
    .sort((a, b) => a.data.localeCompare(b.data))

  const base: Partial<Layout> = {
    width: largura,
    height: altura,
    margin: { l: 10, r: 10, t: 26, b: 44 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: FONTE },
  }

  if (dias.length === 0) {
    return {
      data: [],
      layout: {
        ...base,
        showlegend: false,
        xaxis: { visible: false },
        yaxis: { visible: false },
        annotations: [
          {
            text: 'Sem dados de Burnup',
            showarrow: false,
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 0.5,
            font: { size: 13, color: '#999999' },
          },
        ],
      },
    }
  }

  // Eixo por categorias: cada data preenchida é uma posição, sem "buracos"
  const datas = dias.map((d) => formatarData(d.data)) // "16/10/2026"
  const planejados = dias.map((d) => d.planejado)
  const executados = dias.map((d) => d.executado)

  // Rótulo do maior valor em cima e do menor embaixo (evita sobreposição)
  const posPlanejado = dias.map((d) =>
    d.planejado >= d.executado ? ('top center' as const) : ('bottom center' as const),
  )
  const posExecutado = dias.map((d) =>
    d.planejado >= d.executado ? ('bottom center' as const) : ('top center' as const),
  )

  const linhaPlanejado: Data = {
    type: 'scatter',
    mode: 'text+lines+markers',
    name: 'Planejado',
    x: datas,
    y: planejados,
    line: { color: ROXO_BURNUP, width: 2.5 },
    marker: { color: ROXO_BURNUP, size: 6 },
    text: planejados.map(String),
    textposition: porPonto(posPlanejado),
    textfont: { color: TEXTO, size: 10 },
    hoverinfo: 'skip',
  }

  const linhaExecutado: Data = {
    type: 'scatter',
    mode: 'text+lines+markers',
    name: 'Executado',
    x: datas,
    y: executados,
    line: { color: ROSA, width: 2.5 },
    marker: { color: ROSA, size: 6 },
    text: executados.map(String),
    textposition: porPonto(posExecutado),
    textfont: { color: TEXTO, size: 10 },
    hoverinfo: 'skip',
  }

  const maior = Math.max(...planejados, ...executados) || 1

  const layout: Partial<Layout> = {
    ...base,
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 1,
      xanchor: 'right',
      y: 1.0,
      yanchor: 'bottom',
      font: { size: 10, color: '#444444' },
    },
    xaxis: {
      type: 'category',
      categoryorder: 'array',
      categoryarray: [...new Set(datas)],
      tickangle: datas.length <= MAX_DATAS_NA_HORIZONTAL ? 0 : -45,
      tickfont: { size: 9, color: '#666666' },
      showgrid: false,
      linecolor: '#D0D0D0',
    },
    yaxis: { range: [-maior * 0.08, maior * 1.25], visible: false },
  }

  return { data: [linhaPlanejado, linhaExecutado], layout }
}