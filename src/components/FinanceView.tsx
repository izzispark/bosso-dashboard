import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Table,
  Header,
  Body,
  HeaderRow,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table'
import { Search, ArrowLeft } from 'lucide-react'
import { Button, TextInput } from '@mantine/core'
import { money } from '~/lib/format'
import type { FinanceData, FinanceRecord } from '~/lib/loadFinance'

interface FinanceViewProps {
  mode: 'receber' | 'pagar'
  data: FinanceData
}

export function FinanceView({ mode, data }: FinanceViewProps) {
  const navigate = useNavigate()

  const [q, setQ] = useState('')

  const rows = data[mode].filter((r) =>
    Object.values(r)
      .join(' ')
      .toLowerCase()
      .includes(q.toLowerCase()),
  )

  const receber = mode === 'receber'
  const title = receber
    ? 'Contas a Receber — Cobranças'
    : 'Contas a Pagar — Saida_Analitica'

  const cols = receber
    ? [
        { label: 'Cliente', renderCell: (r: FinanceRecord) => r.cliente },
        { label: 'Vencimento', renderCell: (r: FinanceRecord) => r.vencimento },
        { label: 'Dias vencida', renderCell: (r: FinanceRecord) => r.dias },
        { label: 'Valor', renderCell: (r: FinanceRecord) => money(r.valor) },
        { label: 'Status', renderCell: (r: FinanceRecord) => r.status },
      ]
    : [
        { label: 'Descrição', renderCell: (r: FinanceRecord) => r.descricao },
        { label: 'Fornecedor', renderCell: (r: FinanceRecord) => r.fornecedor },
        { label: 'Categoria', renderCell: (r: FinanceRecord) => r.categoria },
        { label: 'Vencimento', renderCell: (r: FinanceRecord) => r.vencimento },
        { label: 'Valor', renderCell: (r: FinanceRecord) => money(r.valor) },
        { label: 'Status', renderCell: (r: FinanceRecord) => r.status },
      ]

  return (
    <main className="finance-view">
      <Button
        variant="outline"
        onClick={() => navigate({ to: '/' })}
        leftSection={<ArrowLeft size={14} />}
      >
        Estoque
      </Button>
      <div className="eyebrow">FINANCEIRO / DADOS BRUTOS</div>
      <h1>{title}</h1>
      <p>
        {rows.length} registros carregados do relatório BeerSales, sem
        paginação.
      </p>
      <div className="cards">
        <div className="card accent">
          <span>VALOR DOS REGISTROS</span>
          <b>{money(rows.reduce((a, r) => a + r.valor, 0))}</b>
          <small>campo Valor</small>
        </div>
        <div className="card">
          <span>REGISTROS</span>
          <b>{rows.length}</b>
          <small>após busca</small>
        </div>
        <div className="card">
          <span>EM ABERTO</span>
          <b>{rows.filter((r) => r.status === 'EM ABERTO').length}</b>
          <small>status literal do relatório</small>
        </div>
        <div className="card warning">
          <span>VENCIDOS</span>
          <b>{rows.filter((r) => r.status === 'VENCIDA').length}</b>
          <small>status literal do relatório</small>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="controls">
          <TextInput
            label="Buscar nos dados"
            placeholder="Cliente, fornecedor, descrição ou status"
            leftSection={<Search size={15} />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
        </div>
        <div className="table-wrap">
          <Table data={{ nodes: rows }}>
            {(nodes: FinanceRecord[]) => (
              <>
                <Header>
                  <HeaderRow>
                    {cols.map((c) => (
                      <HeaderCell key={c.label}>{c.label}</HeaderCell>
                    ))}
                  </HeaderRow>
                </Header>
                <Body>
                  {nodes.map((row, i) => (
                    <Row key={row.id ?? i} item={row}>
                      {cols.map((c) => (
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
          {rows.length} registros · busca textual sem paginação
        </div>
      </div>
    </main>
  )
}
