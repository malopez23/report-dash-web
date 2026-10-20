import { useEffect, useState } from 'react'
import BarraArquivo from './components/BarraArquivo'
import DashboardView from './components/DashboardView'
import DialogoValidacao from './components/DialogoValidacao'
import FormularioReport from './components/FormularioReport'
import { lerRascunho, salvarRascunho } from './services/armazenamento'
import { validarReport, type ResultadoValidacao } from './services/validation'
import { criarReportVazio, type Report } from './types/report'

export default function App() {
  // Se havia um rascunho guardado no navegador, o formulário já começa com ele
  const [rascunho] = useState(lerRascunho)
  const [report, setReport] = useState<Report>(() => rascunho ?? criarReportVazio())
  const [resultado, setResultado] = useState<ResultadoValidacao | null>(null)
  const [reportGerado, setReportGerado] = useState<Report | null>(null)

  // Rascunho automático: guarda o formulário pouco depois da última alteração
  useEffect(() => {
    const espera = setTimeout(() => salvarRascunho(report), 400)
    return () => clearTimeout(espera)
  }, [report])

  function gerar() {
    setResultado(null)
    setReportGerado(report) // guarda uma "foto" do formulário e mostra o dashboard
  }

  function tentarGerar() {
    const r = validarReport(report)
    if (r.erros.length > 0 || r.avisos.length > 0) {
      setResultado(r)
    } else {
      gerar()
    }
  }

  // Dashboard no lugar do formulário. O formulário continua guardado no
  // estado, então ao voltar tudo o que foi digitado ainda está lá.
  if (reportGerado) {
    return <DashboardView report={reportGerado} onVoltar={() => setReportGerado(null)} />
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <header className="border-b-4 border-spread-laranja bg-linear-to-r from-spread-roxo-escuro to-spread-roxo py-6 text-white shadow">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-2xl font-bold">Report Dash</h1>
          <p className="text-sm text-white/80">Gerador de Status Report de testes</p>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-4xl px-4">
        <BarraArquivo
          report={report}
          onCarregar={setReport}
          onLimpar={() => setReport(criarReportVazio())}
          mensagemInicial={rascunho ? 'Rascunho anterior restaurado.' : ''}
        />
        <FormularioReport report={report} onChange={setReport} onGerar={tentarGerar} />
      </main>

      {resultado && (
        <DialogoValidacao
          resultado={resultado}
          onGerarMesmoAssim={gerar}
          onFechar={() => setResultado(null)}
        />
      )}
    </div>
  )
}