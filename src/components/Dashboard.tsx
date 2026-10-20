import { useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react'
import { criarGraficoBurnup } from '../charts/burnup'
import { criarGraficoIncidentes } from '../charts/incidents'
import { criarGraficoStatus } from '../charts/scenarios'
import {
  formatarDataCurta,
  formatarDoisDigitos,
  totalIncidentes,
} from '../services/calculations'
import { agruparPontos } from '../services/pontos'
import type { Report } from '../types/report'
import './Dashboard.css'
import Grafico from './Grafico'

const LARGURA_SLIDE = 1280
const ALTURA_MINIMA = 720
const TOPO_PONTOS = 520

function Card({ titulo, valor, esquerda }: { titulo: string; valor: string; esquerda: number }) {
  return (
    <>
      <div className="dash-abs dash-card-titulo" style={{ left: esquerda, top: 68 }}>
        {titulo}
      </div>
      <div className="dash-abs dash-card" style={{ left: esquerda, top: 98 }}>
        {valor}
      </div>
    </>
  )
}

interface Props {
  report: Report
  slideRef?: Ref<HTMLDivElement> // usado pela exportação (PNG/PDF)
}

export default function Dashboard({ report, slideRef }: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const pontosRef = useRef<HTMLDivElement>(null)
  const tituloRef = useRef<HTMLDivElement>(null)

  const [area, setArea] = useState({ largura: LARGURA_SLIDE, altura: ALTURA_MINIMA })
  const [alturaPontos, setAlturaPontos] = useState(192)

  // Acompanha o tamanho da área disponível na tela
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const atualizar = () => setArea({ largura: el.clientWidth, altura: el.clientHeight })
    atualizar()
    const observador = new ResizeObserver(atualizar)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  // Acompanha a altura da caixa de Pontos Principais
  useLayoutEffect(() => {
    const el = pontosRef.current
    if (!el) return
    const atualizar = () => setAlturaPontos(el.offsetHeight)
    atualizar()
    const observador = new ResizeObserver(atualizar)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  // Se o título for muito longo, reduz a fonte até caber no cabeçalho
  useLayoutEffect(() => {
    const el = tituloRef.current
    if (!el) return
    let tamanho = 22
    el.style.fontSize = `${tamanho}px`
    while (el.scrollHeight > el.clientHeight + 1 && tamanho > 12) {
      tamanho -= 1
      el.style.fontSize = `${tamanho}px`
    }
  }, [report.titulo])

  // O slide cresce se os pontos não couberem, e depois é escalado para caber na área
  const alturaSlide = Math.max(ALTURA_MINIMA, TOPO_PONTOS + alturaPontos + 8)
  const escala =
    area.largura > 0 && area.altura > 0
      ? Math.min(area.largura / LARGURA_SLIDE, area.altura / alturaSlide)
      : 1

  // Os gráficos só são refeitos quando o report muda (e não a cada redimensionamento)
  const figuraStatus = useMemo(() => criarGraficoStatus(report, 552, 214), [report])
  const figuraIncidentes = useMemo(() => criarGraficoIncidentes(report, 440, 182), [report])
  const figuraBurnup = useMemo(() => criarGraficoBurnup(report, 790, 182), [report])
  const pontos = useMemo(() => agruparPontos(report.pontos), [report.pontos])

  return (
    <div ref={areaRef} className="dash-area">
      <div
        ref={slideRef}
        className="dash-slide"
        style={{
          height: alturaSlide,
          transform: `translate(-50%, -50%) scale(${escala})`,
        }}
      >
        {/* Cabeçalho */}
        <div className="dash-abs dash-cabecalho">
          <div ref={tituloRef} className="dash-abs dash-titulo">
            {report.titulo.trim() || 'Report sem título'}
          </div>
          <div className="dash-abs dash-data-status">
            Data Status: {formatarDataCurta(report.dataStatus)}
          </div>
          <svg className="dash-abs dash-seta" viewBox="0 0 56 46" preserveAspectRatio="none">
            <polygon
              points="0,23 24,0 24,12 56,12 56,34 24,34 24,46"
              fill="rgba(70,15,120,.6)"
            />
          </svg>
        </div>

        {/* Status dos Cenários */}
        <div className="dash-abs dash-secao" style={{ left: 12, top: 60 }}>
          Status dos Cenários
        </div>
        <div className="dash-abs" style={{ left: 8, top: 86 }}>
          <Grafico figura={figuraStatus} />
        </div>

        {/* Cards */}
        <Card
          titulo="Total de Cenários"
          valor={formatarDoisDigitos(report.totalCenarios)}
          esquerda={598}
        />
        <Card
          titulo="Total de Incidentes"
          valor={formatarDoisDigitos(totalIncidentes(report))}
          esquerda={827}
        />
        <Card
          titulo="Total de Impeditivos"
          valor={formatarDoisDigitos(report.impeditivos)}
          esquerda={1056}
        />

        {/* Incidentes */}
        <div className="dash-abs dash-secao" style={{ left: 18, top: 306 }}>
          Incidentes
        </div>
        <div className="dash-abs" style={{ left: 8, top: 334 }}>
          <Grafico figura={figuraIncidentes} />
        </div>

        {/* Burnup */}
        <div className="dash-abs dash-secao" style={{ left: 466, top: 306 }}>
          Burnup
        </div>
        <div className="dash-abs" style={{ left: 466, top: 334 }}>
          <Grafico figura={figuraBurnup} />
        </div>

        {/* Pontos Principais */}
        <div ref={pontosRef} className="dash-pontos">
          <div className="dash-pontos-aba">Pontos Principais</div>
          <div className="dash-pontos-lista">
            {pontos.length === 0 ? (
              <p className="dash-vazio">Nenhuma observação registrada.</p>
            ) : (
              <ul>
                {pontos.map((ponto, i) => (
                  <li key={i}>
                    {ponto.texto}
                    {ponto.subitens.length > 0 && (
                      <ul>
                        {ponto.subitens.map((sub, j) => (
                          <li key={j}>{sub}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}