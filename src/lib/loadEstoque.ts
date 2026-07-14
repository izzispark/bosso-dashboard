import { readFile } from 'node:fs/promises'

export interface EstoqueRow {
  code: string
  name: string
  qty: number
  cost: number
  unit: string
  value: number
  alert: boolean
}

export async function loadEstoque(path: string): Promise<EstoqueRow[]> {
  const raw = await readFile(path, 'utf-8')
  const lines = raw.trim().split('\n')
  // skip header (index 0)
  const rows: EstoqueRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    const code = cols[0] ?? ''
    const name = cols[1] ?? ''
    const qty = parseFloat(cols[2] ?? '0')
    const cost = parseFloat(cols[3] ?? '0')
    const unit = cols[4] ?? ''
    rows.push({
      code,
      name,
      qty,
      cost,
      unit,
      value: cost,
      alert: qty < 0 || qty > 100000,
    })
  }
  return rows
}
