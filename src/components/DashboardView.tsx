import { useRef, useState } from 'react'
import { baixarPdf, baixarPng, copiarImagem } from '../services/exportar'
import type { Report } from '../types/report'
import Dashboard from './Dashboard'

interface Props {
  report: Report
  onVoltar: () => void
}

const botaoContorno =
  'rounded-lg border border-white/60 px-4 py-1.5 text-sm font-semibold hover:bg-white/15 ' +
  'disabled:cursor-wait disabled:opacity-50'

export default function DashboardView({ report, onVoltar }: Props) {
  const slideRef = useRef<HTMLDivElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function executar(acao: (slide: HTMLElement) => Promise<void>, sucesso: string) {
    const slide = slideRef.current
    if (!slide) return
    setOcupado(true)
    setMensagem('Gerando…')
    try {
      await acao(slide)
      setMensagem(sucesso)
    } catch (erro) {
      console.error(erro)
      setMensagem('Não foi possível exportar. Tente de novo.')
    } finally {
      setOcupado(false)
      setTimeout(() => setMensagem(''), 4000)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b-4 border-spread-laranja bg-linear-to-r from-spread-roxo-escuro to-spread-roxo px-4 py-3 text-white shadow">
        <button type="button" onClick={onVoltar} className={botaoContorno}>
          ← Voltar ao formulário
        </button>

        <span role="status" className="text-sm text-white/80">
          {mensagem}
        </span>

        <div className="ml-auto flex gap-3">
          <button
            type="button"
            disabled={ocupado}
            onClick={() => executar((s) => copiarImagem(s), 'Imagem copiada!')}
            className={botaoContorno}
          >
            Copiar imagem
          </button>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => executar((s) => baixarPdf(s, report), 'PDF baixado!')}
            className={botaoContorno}
          >
            Baixar PDF
          </button>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => executar((s) => baixarPng(s, report), 'PNG baixado!')}
            className="rounded-lg bg-spread-laranja px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
          >
            Baixar PNG
          </button>
        </div>
      </div>
      <Dashboard report={report} slideRef={slideRef} />
    </div>
  )
}