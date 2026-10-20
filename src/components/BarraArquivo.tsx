import { useRef, useState } from 'react'
import { ehVazio, lerArquivo, salvarArquivo } from '../services/armazenamento'
import type { Report } from '../types/report'

interface Props {
  report: Report
  onCarregar: (novo: Report) => void
  onLimpar: () => void
  mensagemInicial?: string
}

const botao =
  'rounded-lg border border-spread-roxo px-4 py-2 text-sm font-semibold text-spread-roxo ' +
  'hover:bg-spread-roxo/10'

export default function BarraArquivo({ report, onCarregar, onLimpar, mensagemInicial = '' }: Props) {
  const entradaArquivo = useRef<HTMLInputElement>(null)
  const [mensagem, setMensagem] = useState({ texto: mensagemInicial, erro: false })

  function confirmarSubstituicao(): boolean {
    return ehVazio(report) || window.confirm('Isto vai substituir o que está no formulário. Continuar?')
  }

  function abrir() {
    if (confirmarSubstituicao()) entradaArquivo.current?.click()
  }

  async function aoEscolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = '' // permite escolher o mesmo arquivo outra vez
    if (!arquivo) return
    try {
      onCarregar(lerArquivo(await arquivo.text()))
      setMensagem({ texto: `Report “${arquivo.name}” aberto.`, erro: false })
    } catch (erro) {
      const texto = erro instanceof Error ? erro.message : 'Não foi possível abrir o arquivo.'
      setMensagem({ texto, erro: true })
    }
  }

  function limpar() {
    if (ehVazio(report)) return
    if (window.confirm('Apagar tudo o que foi preenchido?')) {
      onLimpar()
      setMensagem({ texto: 'Formulário limpo.', erro: false })
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <span
        role="status"
        className={`text-sm ${mensagem.erro ? 'font-medium text-red-600' : 'text-slate-600'}`}
      >
        {mensagem.texto}
      </span>

      <div className="ml-auto flex gap-3">
        <button type="button" onClick={abrir} className={botao}>
          Abrir report
        </button>
        <button
          type="button"
          onClick={() => {
            salvarArquivo(report)
            setMensagem({ texto: 'Report salvo no seu computador.', erro: false })
          }}
          className={botao}
        >
          Salvar report
        </button>
        <button type="button" onClick={limpar} className={botao}>
          Limpar
        </button>
      </div>

      <input
        ref={entradaArquivo}
        type="file"
        accept=".json,application/json"
        onChange={aoEscolherArquivo}
        className="hidden"
      />
    </div>
  )
}