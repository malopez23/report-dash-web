// Diz ao TypeScript que o pacote "plotly.js-basic-dist-min" tem os mesmos
// tipos do plotly.js (esse pacote não traz tipos próprios).
declare module 'plotly.js-basic-dist-min' {
  import type * as PlotlyTipos from 'plotly.js'
  const Plotly: typeof PlotlyTipos
  export default Plotly
}