import type { EstoqueRow } from './loadEstoque'

export type FilterOptions = {
  query?: string
  onlyAlerts?: boolean
  minCost?: number
  maxCost?: number
  costStatus?: 'all' | 'zero' | 'valued'
  sort?: 'cost' | 'unit' | 'qty' | 'name'
  direction?: 'asc' | 'desc'
}

export function filterEstoque(rows: EstoqueRow[], opts: FilterOptions = {}): EstoqueRow[] {
  const {
    query = '',
    onlyAlerts = false,
    minCost = 0,
    maxCost = Infinity,
    costStatus = 'all',
    sort = 'cost',
    direction = 'desc',
  } = opts

  const filtered = rows.filter(r => {
    if (onlyAlerts && !r.alert) return false
    if (query) {
      const q = query.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q)) return false
    }
    if (r.cost < minCost) return false
    if (r.cost > maxCost) return false
    if (costStatus === 'zero' && r.cost !== 0) return false
    if (costStatus === 'valued' && r.cost <= 0) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = sort === 'cost' ? a.cost : sort === 'unit' ? a.unit : sort === 'qty' ? a.qty : a.name
    const bv = sort === 'cost' ? b.cost : sort === 'unit' ? b.unit : sort === 'qty' ? b.qty : b.name
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
    return direction === 'desc' ? -cmp : cmp
  })

  return sorted
}
