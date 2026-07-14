import type { EstoqueRow } from './loadEstoque'

const QUARANTINE = new Set(['QSQ.CP.11', '60.31.0085'])

export type Kpi = {
  totalQty: number
  totalCost: number
  zeroCost: EstoqueRow[]
  alerts: EstoqueRow[]
  topValue: EstoqueRow | null
  operational: EstoqueRow[]
  quarantine: EstoqueRow[]
  top10ByCost: { name: string; value: number }[]
}

export function computeKpi(rows: EstoqueRow[]): Kpi {
  const quarantine = rows.filter(r => QUARANTINE.has(r.code))
  const operational = rows.filter(r => !QUARANTINE.has(r.code))
  const totalQty = operational.reduce((a, r) => a + r.qty, 0)
  const totalCost = operational.reduce((a, r) => a + r.cost, 0)
  const zeroCost = operational.filter(r => r.qty > 0 && r.cost === 0)
  const alerts = operational.filter(r => r.alert)
  const topValue = operational.reduce<EstoqueRow | null>(
    (acc, r) => (acc === null || r.cost > acc.cost ? r : acc),
    null,
  )
  const top10ByCost = operational
    .filter(r => r.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)
    .map(r => ({ name: r.name.replace('EMPÓRIO', '').slice(0, 18), value: r.cost }))
  return { totalQty, totalCost, zeroCost, alerts, topValue, operational, quarantine, top10ByCost }
}
