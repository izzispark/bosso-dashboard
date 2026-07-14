import { faker } from '@faker-js/faker/locale/pt_BR'

export interface EstoqueRow {
  code: string
  name: string
  qty: number
  cost: number
  unit: string
  value: number
}

export function makeEstoqueRow(overrides?: Partial<EstoqueRow>): EstoqueRow {
  const base: EstoqueRow = {
    code: faker.string.alphanumeric(6).toUpperCase(),
    name: faker.commerce.productName(),
    qty: faker.number.int({ min: 1, max: 50000 }),
    cost: parseFloat(faker.commerce.price({ min: 0.5, max: 500 })),
    unit: faker.helpers.arrayElement(['UN', 'KG', 'CX', 'LT', 'PC']),
    value: 0, // will be overridden if provided
  }
  return { ...base, ...overrides }
}

export function makeEstoqueCsv(rows: EstoqueRow[]): string {
  const header = 'code,name,qty,cost,unit'
  const lines = rows.map(
    (r) => `${r.code},${r.name},${r.qty},${r.cost},${r.unit}`
  )
  return [header, ...lines].join('\n')
}
