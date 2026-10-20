import type { Data, Layout } from "plotly.js";
import type { Report } from "../types/report";
import { FONTE, ROXO, porPonto, type FiguraPlotly } from "./estilo";

// Barras roxas com a quantidade de incidentes por categoria
export function criarGraficoIncidentes(
  report: Report,
  largura: number,
  altura: number,
): FiguraPlotly {
  const nomes = ["Novo", "Em andamento", "Resolvido", "Improcedente"];
  const quantidades = [
    report.incNovo,
    report.incAndamento,
    report.incResolvido,
    report.incImprocedente,
  ];
  const maior = Math.max(...quantidades) || 1;

  // Barra com altura: número dentro. Barra zerada ou muito baixa: fora.
  const posicoes = quantidades.map((q) =>
    q > 0 && q >= maior * 0.12 ? ("inside" as const) : ("outside" as const),
  );

  const barras: Data = {
    type: "bar",
    x: nomes,
    y: quantidades,
    width: 0.2,
    marker: { color: ROXO },
    text: quantidades.map((q) => `<b>${q}</b>`),
    textposition: porPonto(posicoes),
    insidetextanchor: "middle",
    textfont: { color: "white", size: 11 }, // texto dentro da barra
    // Propriedades que o Plotly conhece mas o @types/plotly.js não declara:
    // texto fora da barra e texto sempre na horizontal (sem girar nem encolher)
    ...{
      outsidetextfont: { color: ROXO, size: 11 },
      textangle: 0,
      constraintext: "none",
    },
    cliponaxis: false,
    hoverinfo: "skip",
  };

  const layout: Partial<Layout> = {
    width: largura,
    height: altura,
    margin: { l: 10, r: 10, t: 14, b: 28 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    showlegend: false,
    font: { family: FONTE },
    xaxis: {
      showgrid: false,
      linecolor: "#D0D0D0",
      tickfont: { size: 10, color: "#666666" },
    },
    yaxis: { range: [0, maior * 1.12], visible: false },
  };

  return { data: [barras], layout };
}
