import { useMemo, useState } from 'react'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Table,
  Header,
  Body,
  HeaderRow,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table'
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Download,
  Filter,
  Search,
  ShieldAlert,
  TrendingUp,
  Package,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  TextInput,
  NumberInput,
  Select,
  NavLink,
  Stack,
} from '@mantine/core'
import { money } from '~/lib/format'
import { computeKpi } from '~/lib/computeKpi'
import { filterEstoque } from '~/lib/filterEstoque'
import type { EstoqueRow } from '~/lib/loadEstoque'

const COLUMNS = [
  {
    label: 'Produto',
    renderCell: (p: EstoqueRow) => <b>{p.name}</b>,
  },
  {
    label: 'Código',
    renderCell: (p: EstoqueRow) => <span className="muted">{p.code}</span>,
  },
  {
    label: 'Qtd.',
    renderCell: (p: EstoqueRow) => (
      <span className={p.alert ? 'number danger' : 'number'}>
        {p.qty.toLocaleString('pt-BR')}
      </span>
    ),
  },
  {
    label: 'Custo unitário',
    renderCell: (p: EstoqueRow) => money(p.unitCost),
  },
  {
    label: 'Custo total',
    renderCell: (p: EstoqueRow) => money(p.cost),
  },
  {
    label: 'Status',
    renderCell: (p: EstoqueRow) =>
      p.qty < 0 ? (
        <span className="status danger-bg">Negativo</span>
      ) : (
        <span className="status ok-bg">Normal</span>
      ),
  },
]

export function EstoqueView() {
  const rows = useLoaderData({ from: '/' }) as EstoqueRow[]
  const navigate = useNavigate()

  const kpi = useMemo(() => computeKpi(rows), [rows])

  const [query, setQuery] = useState('')
  const [onlyAlerts, setOnlyAlerts] = useState(false)
  const [sort, setSort] = useState<string>('cost')
  const [direction, setDirection] = useState<string>('desc')
  const [minCost, setMinCost] = useState<string>('')
  const [maxCost, setMaxCost] = useState<string>('')
  const [costStatus, setCostStatus] = useState<string>('all')

  const filtered = useMemo(
    () =>
      filterEstoque(kpi.operational, {
        query,
        onlyAlerts,
        minCost: Number(minCost) || 0,
        maxCost: maxCost === '' ? Infinity : Number(maxCost),
        costStatus: costStatus as 'all' | 'zero' | 'valued',
        sort: sort as 'cost' | 'unit' | 'qty' | 'name',
        direction: direction as 'asc' | 'desc',
      }),
    [query, onlyAlerts, sort, direction, minCost, maxCost, costStatus, kpi.operational],
  )

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">B</div>
          <div>
            <b>bosso</b>
            <span>PRODUÇÕES</span>
          </div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <Stack gap={4}>
          <NavLink
            active
            label="Estoque"
            leftSection={<Boxes size={18} />}
          />
          <NavLink
            label="Contas a Receber"
            leftSection={<TrendingUp size={18} />}
            onClick={() => navigate({ to: '/receber' })}
          />
          <NavLink
            label="Contas a Pagar"
            leftSection={<Package size={18} />}
            onClick={() => navigate({ to: '/pagar' })}
          />
        </Stack>
        <div className="side-label">SISTEMA</div>
        <nav>
          <a>
            <RefreshCw size={18} /> Atualizações
          </a>
          <a>
            <ShieldAlert size={18} /> Auditoria <i>1</i>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <small>BEERSALES CONNECTOR</small>
          <strong>
            <em /> Dados de 13 JUL 2026
          </strong>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <div className="eyebrow">DASHBOARD / VISÃO EXECUTIVA</div>
            <h1>
              Dashboard <span>Bosso</span>
            </h1>
            <p>Leitura operacional do relatório BeerSales · 15:15:21</p>
          </div>
          <button className="outline">
            <Download size={16} /> Exportar visão
          </button>
        </header>

        <section className="hero">
          <div>
            <div className="hero-kicker">SINAL PRINCIPAL</div>
            <h2>
              Um estoque saudável começa
              <br />
              com <strong>dados honestos.</strong>
            </h2>
            <p>
              Encontramos <b>{kpi.alerts.length} alertas</b> que merecem
              revisão antes de qualquer decisão de compra.
            </p>
          </div>
          <div className="hero-metric">
            <span>VALOR EM CUSTO</span>
            <b>{money(kpi.totalCost)}</b>
            <small>{kpi.operational.length} SKUs · 1 empresa</small>
          </div>
        </section>

        <section className="cards">
          <div className="card accent">
            <span>VALOR EM ESTOQUE</span>
            <b>{money(kpi.totalCost)}</b>
            <small>custo operacional confiável</small>
          </div>
          <div className="card">
            <span>MAIOR CONCENTRAÇÃO</span>
            <b>{kpi.topValue ? money(kpi.topValue.cost) : '-'}</b>
            <small>
              {kpi.topValue ? kpi.topValue.name.slice(0, 28) : '-'}
            </small>
          </div>
          <div className="card warning">
            <span>SEM VALOR CADASTRADO</span>
            <b>{kpi.zeroCost.length}</b>
            <small>itens com saldo e custo zero</small>
          </div>
          <div className="card">
            <span>SKUs OPERACIONAIS</span>
            <b>{kpi.operational.length}</b>
            <small>excluindo quarentena</small>
          </div>
        </section>

        <div className="quarantine">
          <div>
            <ShieldAlert size={12} />
            <span>QUARENTENA</span>
          </div>
          <div className="quarantine-item-list">
            {kpi.quarantine.map((p) => (
              <div className="quarantine-item" key={p.code}>
                <div>
                  <b>{p.name}</b>
                  <small>{p.code}</small>
                </div>
                <strong>{p.qty}</strong>
                <span>x</span>
              </div>
            ))}
            {kpi.quarantine.length === 0 && (
              <div className="empty">Nenhum item em quarentena</div>
            )}
          </div>
        </div>

        <div className="grid">
          <div className="card chart-card">
            <h3>
              <TrendingUp size={18} /> TOP 10 — MAIOR CUSTO
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={kpi.top10ByCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9eee9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#66706a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#66706a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => money(value)}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e9eee9',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#2e7d59" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card kpi-card">
            <div className="kpi-row">
              <span>Total Itens</span>
              <strong>{kpi.totalQty.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="kpi-row">
              <span>Custo Médio</span>
              <strong>
                {kpi.operational.length > 0
                  ? money(kpi.totalCost / kpi.operational.length)
                  : money(0)}
              </strong>
            </div>
            <div className="kpi-row">
              <span>Alertas</span>
              <strong className="danger">{kpi.alerts.length}</strong>
            </div>
            <div className="kpi-row">
              <span>Zero Custo</span>
              <strong>{kpi.zeroCost.length}</strong>
            </div>
          </div>
        </div>

        <div className="panel table-panel">
          <div className="table-head">
            <div>
              <Filter size={15} />
              <span>Filtros</span>
            </div>
            <div className="active-filters">
              {onlyAlerts && (
                <span className="active-filter">
                  <AlertTriangle size={12} /> Alertas
                </span>
              )}
            </div>
          </div>
          <div className="controls">
            <TextInput
              label="Buscar"
              placeholder="Produto ou código"
              leftSection={<Search size={15} />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <NumberInput
              label="Custo min."
              placeholder="0"
              value={minCost === '' ? '' : Number(minCost)}
              onChange={(v) => setMinCost(v === '' ? '' : String(v))}
            />
            <NumberInput
              label="Custo max."
              placeholder="∞"
              value={maxCost === '' ? '' : Number(maxCost)}
              onChange={(v) => setMaxCost(v === '' ? '' : String(v))}
            />
            <Select
              label="Custo"
              data={[
                { value: 'all', label: 'Todos' },
                { value: 'zero', label: 'Zero' },
                { value: 'valued', label: 'Com valor' },
              ]}
              value={costStatus}
              onChange={(v) => setCostStatus(v ?? 'all')}
            />
            <Select
              label="Ordenar"
              data={[
                { value: 'cost', label: 'Custo total' },
                { value: 'unit', label: 'Custo unitário' },
                { value: 'qty', label: 'Quantidade' },
                { value: 'name', label: 'Nome' },
              ]}
              value={sort}
              onChange={(v) => setSort(v ?? 'cost')}
            />
            <Button
              variant={direction === 'desc' ? 'filled' : 'outline'}
              onClick={() =>
                setDirection((d) => (d === 'desc' ? 'asc' : 'desc'))
              }
            >
              {direction === 'desc' ? '⬇ DESC' : '⬆ ASC'}
            </Button>
            <Button
              variant="light"
              onClick={() => setOnlyAlerts((a) => !a)}
              color={onlyAlerts ? 'red' : undefined}
            >
              <AlertTriangle size={14} /> Alertas
            </Button>
          </div>
          <div className="table-wrap">
            <Table data={{ nodes: filtered }}>
              {(nodes: EstoqueRow[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      {COLUMNS.map((c) => (
                        <HeaderCell key={c.label}>{c.label}</HeaderCell>
                      ))}
                    </HeaderRow>
                  </Header>
                  <Body>
                    {nodes.map((row) => (
                      <Row key={row.code} item={row}>
                        {COLUMNS.map((c) => (
                          <Cell key={c.label}>{c.renderCell(row)}</Cell>
                        ))}
                      </Row>
                    ))}
                  </Body>
                </>
              )}
            </Table>
          </div>
          <div className="table-foot">
            {filtered.length} de {kpi.operational.length} registros
            <span>
              {money(filtered.reduce((a, r) => a + r.cost, 0))} em custos
            </span>
          </div>
        </div>

        <footer>
          <small>
            Bosso Produções · relatório BeerSales ·{' '}
            <ArrowUpRight size={11} />
          </small>
          <span>
            <RefreshCw size={12} /> atualizado em 13 JUL 2026 <b>15:15:21</b>
          </span>
        </footer>
      </main>
    </div>
  )
}
