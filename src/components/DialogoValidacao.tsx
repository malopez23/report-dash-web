import type { ResultadoValidacao } from '../services/validation'

interface Props {
  resultado: ResultadoValidacao
  onGerarMesmoAssim: () => void
  onFechar: () => void
}

export default function DialogoValidacao({ resultado, onGerarMesmoAssim, onFechar }: Props) {
  const temErros = resultado.erros.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <h2
          className={`px-5 py-4 text-lg font-bold text-white ${
            temErros ? 'bg-red-600' : 'bg-spread-laranja'
          }`}
        >
          {temErros ? 'Corrija antes de gerar' : 'Atenção'}
        </h2>

        <div className="space-y-4 p-5">
          {temErros && (
            <div>
              <p className="mb-2 text-sm font-semibold text-red-700">Erros</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {resultado.erros.map((erro, i) => (
                  <li key={i}>{erro}</li>
                ))}
              </ul>
            </div>
          )}

          {resultado.avisos.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-spread-laranja">Avisos</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {resultado.avisos.map((aviso, i) => (
                  <li key={i}>{aviso}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-spread-roxo px-4 py-2 text-sm font-semibold text-spread-roxo hover:bg-spread-roxo/10"
          >
            Voltar e corrigir
          </button>
          {!temErros && (
            <button
              type="button"
              onClick={onGerarMesmoAssim}
              className="rounded-lg bg-spread-laranja px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Gerar mesmo assim
            </button>
          )}
        </div>
      </div>
    </div>
  )
}