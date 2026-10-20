import type { ReactNode } from 'react'

export const estiloInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ' +
  'placeholder:text-slate-400 focus:border-spread-roxo focus:outline-none ' +
  'focus:ring-2 focus:ring-spread-roxo/30'

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <h2 className="border-l-4 border-spread-laranja bg-spread-roxo/5 px-5 py-3 text-lg font-bold text-spread-roxo">
        {titulo}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  )
}

function Rotulo({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{texto}</span>
      {children}
    </label>
  )
}

// Campo numérico sem rótulo (usado também dentro da tabela do Burnup).
// Vazio vale 0 e só aceita dígitos (até 6).
export function InputNumero({
  valor,
  onChange,
  rotulo,
}: {
  valor: number
  onChange: (n: number) => void
  rotulo?: string
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={rotulo}
      value={valor === 0 ? '' : String(valor)}
      onChange={(e) => {
        const digitos = e.target.value.replace(/\D/g, '').slice(0, 6)
        onChange(digitos === '' ? 0 : Number(digitos))
      }}
      className={estiloInput}
    />
  )
}

export function CampoNumero(props: {
  rotulo: string
  valor: number
  onChange: (n: number) => void
}) {
  return (
    <Rotulo texto={props.rotulo}>
      <InputNumero valor={props.valor} onChange={props.onChange} />
    </Rotulo>
  )
}

export function CampoTexto(props: {
  rotulo: string
  valor: string
  onChange: (t: string) => void
  placeholder?: string
}) {
  return (
    <Rotulo texto={props.rotulo}>
      <input
        type="text"
        value={props.valor}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className={estiloInput}
      />
    </Rotulo>
  )
}

export function CampoData(props: {
  rotulo: string
  valor: string
  onChange: (d: string) => void
}) {
  return (
    <Rotulo texto={props.rotulo}>
      <input
        type="date"
        value={props.valor}
        onChange={(e) => props.onChange(e.target.value)}
        className={estiloInput}
      />
    </Rotulo>
  )
}