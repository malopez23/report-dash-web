import { useState } from 'react'
import type { DiaBurnup, Report } from '../types/report'
import { somaStatus, totalIncidentes } from '../services/calculations'
import { hojeISO, somarDias } from '../services/datas'
import {
  CampoData,
  CampoNumero,
  CampoTexto,
  InputNumero,
  Secao,
  estiloInput,
} from './ui'

interface Props {
  report: Report
  onChange: (novo: Report) => void
  onGerar: () => void
}

const botaoSecundario =
  'rounded-lg border border-spread-roxo px-4 py-2 text-sm font-semibold text-spread-roxo ' +
  'hover:bg-spread-roxo/10 disabled:cursor-not-allowed disabled:opacity-40'

export default function FormularioReport({ report, onChange, onGerar }: Props) {
  const [novoPonto, setNovoPonto] = useState('')

  // Atualiza UM campo do report. <K extends keyof Report> é como um generic
  // do Java: K só pode ser o nome de um campo e o valor tem o tipo desse campo.
  function set<K extends keyof Report>(campo: K, valor: Report[K]) {
    onChange({ ...report, [campo]: valor })
  }

  // ----- Burnup -----
  function adicionarDia() {
    const ultimo = report.burnup[report.burnup.length - 1]
    const novo: DiaBurnup = ultimo
      ? { data: somarDias(ultimo.data, 1), planejado: ultimo.planejado, executado: 0 }
      : { data: hojeISO(), planejado: 0, executado: 0 }
    set('burnup', [...report.burnup, novo])
  }

  function alterarDia(indice: number, parcial: Partial<DiaBurnup>) {
    set(
      'burnup',
      report.burnup.map((dia, i) => (i === indice ? { ...dia, ...parcial } : dia)),
    )
  }

  function removerUltimoDia() {
    set('burnup', report.burnup.slice(0, -1))
  }

  // ----- Pontos principais -----
  function adicionarPonto() {
    const texto = novoPonto.trim()
    if (!texto) return
    set('pontos', [...report.pontos, texto])
    setNovoPonto('')
  }

  function alterarPonto(indice: number, texto: string) {
    set(
      'pontos',
      report.pontos.map((p, i) => (i === indice ? texto : p)),
    )
  }

  function removerPonto(indice: number) {
    set(
      'pontos',
      report.pontos.filter((_, i) => i !== indice),
    )
  }

  const soma = somaStatus(report)
  const somaConfere = soma === report.totalCenarios

  return (
    <div className="space-y-6">
      {/* Informações do Report */}
      <Secao titulo="Informações do Report">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <CampoTexto
              rotulo="Título do Report"
              valor={report.titulo}
              onChange={(v) => set('titulo', v)}
              placeholder="Ex: [QD Ecommerce] - Status Report | Projeto - Fase 1"
            />
          </div>
          <CampoData
            rotulo="Data do Status"
            valor={report.dataStatus}
            onChange={(v) => set('dataStatus', v)}
          />
        </div>
      </Secao>

      {/* Status dos Cenários */}
      <Secao titulo="Status dos Cenários">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CampoNumero rotulo="Total de Cenários" valor={report.totalCenarios} onChange={(v) => set('totalCenarios', v)} />
          <CampoNumero rotulo="Pendente" valor={report.pendente} onChange={(v) => set('pendente', v)} />
          <CampoNumero rotulo="Sucesso" valor={report.sucesso} onChange={(v) => set('sucesso', v)} />
          <CampoNumero rotulo="Falha" valor={report.falha} onChange={(v) => set('falha', v)} />
          <CampoNumero rotulo="Bloqueado" valor={report.bloqueado} onChange={(v) => set('bloqueado', v)} />
          <CampoNumero rotulo="N/A" valor={report.na} onChange={(v) => set('na', v)} />
        </div>
        <p
          className={`mt-4 text-sm font-medium ${somaConfere ? 'text-emerald-600' : 'text-spread-laranja'}`}
        >
          Soma dos status: {soma} de {report.totalCenarios} cenários
        </p>
      </Secao>

      {/* Incidentes e Impeditivos */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Secao titulo="Incidentes">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoNumero rotulo="Novo" valor={report.incNovo} onChange={(v) => set('incNovo', v)} />
              <CampoNumero rotulo="Em andamento" valor={report.incAndamento} onChange={(v) => set('incAndamento', v)} />
              <CampoNumero rotulo="Resolvido" valor={report.incResolvido} onChange={(v) => set('incResolvido', v)} />
              <CampoNumero rotulo="Improcedente" valor={report.incImprocedente} onChange={(v) => set('incImprocedente', v)} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              Total de incidentes: {totalIncidentes(report)}
            </p>
          </Secao>
        </div>
        <Secao titulo="Impeditivos">
          <CampoNumero
            rotulo="Total de Impeditivos"
            valor={report.impeditivos}
            onChange={(v) => set('impeditivos', v)}
          />
        </Secao>
      </div>

      {/* Burnup */}
      <Secao titulo="Burnup">
        {report.burnup.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum dia adicionado ainda.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm font-medium text-slate-700">
              <span>Data</span>
              <span>Planejado</span>
              <span>Executado</span>
            </div>
            {report.burnup.map((dia, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <input
                  type="date"
                  aria-label={`Data do dia ${i + 1}`}
                  value={dia.data}
                  onChange={(e) => alterarDia(i, { data: e.target.value })}
                  className={estiloInput}
                />
                <InputNumero
                  rotulo={`Planejado do dia ${i + 1}`}
                  valor={dia.planejado}
                  onChange={(v) => alterarDia(i, { planejado: v })}
                />
                <InputNumero
                  rotulo={`Executado do dia ${i + 1}`}
                  valor={dia.executado}
                  onChange={(v) => alterarDia(i, { executado: v })}
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={adicionarDia} className={botaoSecundario}>
            + Adicionar Dia
          </button>
          <button
            type="button"
            onClick={removerUltimoDia}
            disabled={report.burnup.length === 0}
            className={botaoSecundario}
          >
            - Remover Último Dia
          </button>
        </div>
      </Secao>

      {/* Pontos Principais */}
      <Secao titulo="Pontos Principais">
        <div className="flex gap-3">
          <input
            type="text"
            value={novoPonto}
            onChange={(e) => setNovoPonto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') adicionarPonto()
            }}
            placeholder="Digite uma observação e aperte Enter"
            className={estiloInput}
          />
          <button type="button" onClick={adicionarPonto} className={botaoSecundario + ' whitespace-nowrap'}>
            + Adicionar
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Dica: comece a linha com “-” para criar um subitem.
        </p>

        <ul className="mt-4 space-y-2">
          {report.pontos.map((ponto, i) => (
            <li
              key={i}
              className={`flex gap-2 ${ponto.trimStart().startsWith('-') ? 'ml-8' : ''}`}
            >
              <input
                type="text"
                value={ponto}
                onChange={(e) => alterarPonto(i, e.target.value)}
                className={estiloInput}
              />
              <button
                type="button"
                onClick={() => removerPonto(i)}
                aria-label={`Remover ponto ${i + 1}`}
                className="rounded-lg px-3 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </Secao>

      <button
        type="button"
        onClick={onGerar}
        className="w-full rounded-xl bg-spread-laranja py-3 text-lg font-bold text-white shadow hover:opacity-90"
      >
        Gerar Report
      </button>
    </div>
  )
}