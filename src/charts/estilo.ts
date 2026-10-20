import type { Data, Layout } from 'plotly.js'

export const ROXO = '#5B0A91'
export const ROSA = '#E8467C'
export const TEXTO = '#3A3A3A'
export const FONTE = 'Montserrat, Segoe UI, Arial, sans-serif'

// O que cada gráfico devolve: os dados e o layout que o Plotly precisa
export interface FiguraPlotly {
  data: Data[]
  layout: Partial<Layout>
}

// O Plotly aceita uma lista em "textposition" (uma posição para cada ponto),
// mas os tipos do @types/plotly.js só declaram um valor único. Este auxiliar
// avisa o TypeScript de que a lista é válida.
export function porPonto<T extends string>(posicoes: T[]): T {
  return posicoes as unknown as T
}