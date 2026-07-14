import { describe, it, expect } from 'vitest'
import type { EstoqueRow } from '~/lib/loadEstoque'

function makeRow(overrides?: Partial<EstoqueRow>): EstoqueRow {
  return {
    code: overrides?.code ?? 'TEST',
    name: overrides?.name ?? 'Test Product',
    qty: overrides?.qty ?? 100,
    unit: overrides?.unit ?? 'UN',
    cost: overrides?.cost ?? 500,
    unitCost: overrides?.unitCost ?? 5,
    value: overrides?.value ?? 500,
    alert: overrides?.alert ?? false,
  }
}

describe('computeKpi', () => {
  it('returns zeroes for empty list', async () => {
    const { computeKpi } = await import('~/lib/computeKpi')
    const result = computeKpi([])

    expect(result.totalQty).toBe(0)
    expect(result.totalCost).toBe(0)
    expect(result.alerts).toEqual([])
    expect(result.topValue).toBeNull()
    expect(result.operational).toEqual([])
    expect(result.quarantine).toEqual([])
  })

  it('excludes quarantine codes from totals', async () => {
    const { computeKpi } = await import('~/lib/computeKpi')
    const rows: EstoqueRow[] = [
      makeRow({ code: 'QSQ.CP.11', name: 'Quarantine Item', qty: 1000, cost: 99999 }),
      makeRow({ code: '60.31.0085', name: 'Another Quarantine', qty: 500, cost: 50000 }),
      makeRow({ code: 'NORMAL01', name: 'Normal Item', qty: 100, cost: 2000 }),
    ]
    const result = computeKpi(rows)

    // Quarantine items should be in quarantine array
    expect(result.quarantine).toHaveLength(2)
    expect(result.quarantine.map((r: EstoqueRow) => r.code).sort()).toEqual(['60.31.0085', 'QSQ.CP.11'])

    // Totals should only include operational items
    expect(result.totalQty).toBe(100)
    expect(result.totalCost).toBe(2000)

    // Operational should only have non-quarantine items
    expect(result.operational).toHaveLength(1)
    expect(result.operational[0].code).toBe('NORMAL01')
  })

  it('identifies alerts from rows with alert flag', async () => {
    const { computeKpi } = await import('~/lib/computeKpi')
    const rows: EstoqueRow[] = [
      makeRow({ code: 'OK01', name: 'Normal', qty: 100, cost: 200, alert: false }),
      makeRow({ code: 'ALERT01', name: 'Alert Negative', qty: -1, cost: 100, alert: true }),
      makeRow({ code: 'ALERT02', name: 'Alert Excess', qty: 200000, cost: 300, alert: true }),
      makeRow({ code: 'OK02', name: 'Another Normal', qty: 50, cost: 400, alert: false }),
    ]
    const result = computeKpi(rows)

    expect(result.alerts).toHaveLength(2)
    expect(result.alerts.map((a: EstoqueRow) => a.code).sort()).toEqual(['ALERT01', 'ALERT02'])
  })

  it('finds topValue by cost', async () => {
    const { computeKpi } = await import('~/lib/computeKpi')
    const rows: EstoqueRow[] = [
      makeRow({ code: 'LOW01', name: 'Low Value', qty: 10, cost: 100 }),
      makeRow({ code: 'HIGH01', name: 'High Value', qty: 5, cost: 9999 }),
      makeRow({ code: 'MID01', name: 'Medium Value', qty: 3, cost: 500 }),
    ]
    const result = computeKpi(rows)

    expect(result.topValue).not.toBeNull()
    expect(result.topValue!.code).toBe('HIGH01')
    expect(result.topValue!.cost).toBe(9999)
  })
})
