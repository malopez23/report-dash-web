import { useEffect, useRef } from "react";
import Plotly from "plotly.js-basic-dist-min";
import type { FiguraPlotly } from "../charts/estilo";

// Sem barra de ferramentas e sem interação: o gráfico é só uma "imagem"
const CONFIG = { staticPlot: true, displayModeBar: false };

// Garante que a Montserrat já carregou antes de desenhar o gráfico,
// senão o Plotly mede o texto com a fonte errada e desalinha os rótulos.
const FONTES_PRONTAS = Promise.all(
  [400, 500, 600, 700].map((peso) =>
    document.fonts.load(`${peso} 12px Montserrat`).catch(() => []),
  ),
);

export default function Grafico({ figura }: { figura: FiguraPlotly }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ativo = true;
    void FONTES_PRONTAS.then(() => {
      if (ativo) void Plotly.react(el, figura.data, figura.layout, CONFIG);
    });
    return () => {
      ativo = false;
      Plotly.purge(el);
    };
  }, [figura]);

  return (
    <div
      ref={ref}
      style={{ width: figura.layout.width, height: figura.layout.height }}
    />
  );
}
