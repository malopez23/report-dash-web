export interface ItemPonto {
  texto: string
  subitens: string[]
}

// Linhas que começam com "-" viram subitens do ponto anterior.
// Se não houver ponto anterior, viram um ponto normal.
export function agruparPontos(pontos: string[]): ItemPonto[] {
  const itens: ItemPonto[] = []

  for (const bruto of pontos) {
    let texto = bruto.trim()
    const ehSubitem = texto.startsWith('-')
    if (ehSubitem) texto = texto.replace(/^-+/, '').trim()
    if (!texto) continue

    const ultimo = itens[itens.length - 1]
    if (ehSubitem && ultimo) {
      ultimo.subitens.push(texto)
    } else {
      itens.push({ texto, subitens: [] })
    }
  }

  return itens
}