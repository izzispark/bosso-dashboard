import { describe, it, expect } from 'vitest'
import type { EstoqueRow } from '~/lib/loadEstoque'

function rows(): EstoqueRow[] {
  return [
    { code: 'A', name: 'Agua', qty: 10, unit: 'UN', cost: 5, unitCost: 0.5, value: 5, alert: false },
    { code: 'B', name: 'Bolo', qty: -1, unit: 'UN', cost: 20, unitCost: 20, value: 20, alert: true },
    { code: 'C', name: 'Carvão', qty: 50, unit: 'KG', cost: 0, unitCost: 0, value: 0, alert: false },
  ]
}

describe('filterEstoque', () => {
  it('filters by query (name or code, case-insensitive)', async () => {
    const { filterEstoque } = await import('~/lib/filterEstoque')
    const r = filterEstoque(rows(), { query: 'bol' })
    expect(r).toHaveLength(1)
    expect(r[0].code).toBe('B')
  })

  it('filters onlyAlerts', async () => {
    const { filterEstoque } = await import('~/lib/filterEstoque')
    const r = filterEstoque(rows(), { onlyAlerts: true })
    expect(r).toHaveLength(1)
    expect(r[0].code).toBe('B')
  })

  it('filters cost range (minCost and maxCost)', async () => {
    const { filterEstoque } = await import('~/lib/filterEstoque')
    const r = filterEstoque(rows(), { minCost: 10 })
    expect(r.every((x: EstoqueRow) => x.cost >= 10)).toBe(true)
  })

  it('sorts by cost desc', async () => {
    const { filterEstoque } = await import('~/lib/filterEstoque')
    const r = filterEstoque(rows(), { sort: 'cost', direction: 'desc' })
    expect(r[0].code).toBe('B') // cost 20
  })

  it('sorts by name asc', async () => {
    const { filterEstoque } = await import('~/lib/filterEstoque')
    const r = filterEstoque(rows(), { sort: 'name', direction: 'asc' })
    expect(r[0].code).toBe('A') // Agua
  })

  it('filters costStatus=zero', async () => {
    const { filterEstoque } = await import('~/lib/filterEstoque')
    const r = filterEstoque(rows(), { costStatus: 'zero' })
    expect(r).toHaveLength(1)
    expect(r[0].code).toBe('C')
  })
})
