import { faker } from '@faker-js/faker/locale/pt_BR'

export interface EstoqueRow {
  code: string
  name: string
  qty: number
  unit: string
  cost: number
  unitCost: number
  value: number
  alert: boolean
}

// Formato REAL do CSV exportado pelo BeerSales:
// Empresa,Código,Produto,Qtde.,Un.,Qtde. Entrega,Un. Entrega,Estoque Mínimo,Custo,Custo Médio
const HEADER = 'Empresa,Código,Produto,Qtde.,Un.,Qtde. Entrega,Un. Entrega,Estoque Mínimo,Custo,Custo Médio'

export function makeEstoqueRow(overrides?: Partial<EstoqueRow>): EstoqueRow {
  const code = overrides?.code ?? faker.string.alphanumeric(6).toUpperCase()
  const name = overrides?.name ?? faker.commerce.productName()
  const qty = overrides?.qty ?? faker.number.int({ min: 1, max: 50000 })
  const unit = overrides?.unit ?? faker.helpers.arrayElement(['UN', 'KG', 'CX', 'LT', 'PC'])
  const cost = overrides?.cost ?? parseFloat(faker.commerce.price({ min: 0.5, max: 500 }))
  const unitCost = overrides?.unitCost ?? cost / Math.max(qty, 1)
  const value = overrides?.value ?? cost
  return { code, name, qty, unit, cost, unitCost, value, alert: false, ...overrides }
}

export function makeEstoqueCsv(rows: EstoqueRow[]): string {
  // Formato: Empresa,Código,Produto,Qtde.,Un.,Qtde. Entrega,Un. Entrega,Estoque Mínimo,Custo,Custo Médio
  const dataRows = rows.map(r =>
    `EMPÓRIO GERMANIA VINHEDO,${r.code},${r.name},${r.qty},${r.unit},,,0,${r.cost},${r.unitCost}`
  )
  return [HEADER, ...dataRows].join('\n')
}
