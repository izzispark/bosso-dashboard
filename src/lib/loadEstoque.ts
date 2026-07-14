import { readFile } from 'node:fs/promises'

export interface EstoqueRow {
  code: string          // coluna "Código"
  name: string          // coluna "Produto"
  qty: number           // coluna "Qtde."
  unit: string          // coluna "Un." (ex: "UN", "KG", "CX")
  cost: number          // coluna "Custo"
  unitCost: number      // coluna "Custo Médio"
  value: number         // computed: == cost
  alert: boolean        // computed: qty<0 || qty>100000
}

const EXPECTED_HEADER_FRAGMENT = 'Código'

export async function loadEstoque(path: string): Promise<EstoqueRow[]> {
  const raw = await readFile(path, 'utf-8')
  const lines = raw.trim().split('\n')

  // BeerSales export: 10 colunas, primeira coluna = Empresa, 2ª = Código (code), etc.
  // Toleramos variações de contagem de colunas (CSV tem linhas iniciais de título/blank).
  // Heurística: linha de dado tem >= 10 colunas, 2ª coluna não-vazia, 4ª (Qtde.) é número, 9ª (Custo) é número.
  const isDataLine = (line: string): boolean => {
    const cols = line.split(',')
    if (cols.length < 10) return false
    const code = cols[1]?.trim() ?? ''
    const name = cols[2]?.trim() ?? ''
    if (code === '' || name === '') return false
    // Header: "Empresa,Código,Produto,..." — nome é "Código" (sem acento, lowercase comparação)
    if (name === 'Produto' || code === 'Código') return false
    if (isNaN(Number(cols[3]))) return false  // Qtde. deve ser número
    if (isNaN(Number(cols[8]))) return false  // Custo deve ser número
    return true
  }

  const dataLines = lines.filter(isDataLine)
  const rows: EstoqueRow[] = []
  for (const line of dataLines) {
    const cols = line.split(',')
    const code = cols[1].trim()
    const name = cols[2].trim()
    const qty = Number(cols[3])
    const unit = (cols[4] ?? '').trim()
    const cost = Number(cols[8])
    const unitCost = Number(cols[9] ?? '0')
    rows.push({
      code,
      name,
      qty,
      unit,
      cost,
      unitCost,
      value: cost,
      alert: qty < 0 || qty > 100000,
    })
  }
  return rows
}
