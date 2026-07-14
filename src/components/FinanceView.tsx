import { useState } from 'react'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
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
import type { FinanceData } from '~/lib/loadFinance'

type Mode = 'receber' | 'pagar'

interface FinanceViewProps {
  mode: Mode
}

export function FinanceView({ mode }: FinanceViewProps) {
  const navigate = useNavigate()
  const data = useLoaderData({ from: mode === 'receber' ? '/receber' : '/pagar' }) as FinanceData

  const [q, setQ] = useState('')

  const rows = (data?.[mode] ?? []).filter((r) =>
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
        { label: 'Cliente', renderCell: (r: any) => r.cliente },
        { label: 'Vencimento', renderCell: (r: any) => r.vencimento },
        { label: 'Dias vencida', renderCell: (r: any) => r.dias },
        { label: 'Valor', renderCell: (r: any) => money(r.valor) },
        { label: 'Status', renderCell: (r: any) => r.status },
      ]
    : [
        { label: 'Descrição', renderCell: (r: any) => r.descricao },
        { label: 'Fornecedor', renderCell: (r: any) => r.fornecedor },
        { label: 'Categoria', renderCell: (r: any) => r.categoria },
        { label: 'Vencimento', renderCell: (r: any) => r.vencimento },
        { label: 'Valor', renderCell: (r: any) => money(r.valor) },
        { label: 'Status', renderCell: (r: any) => r.status },
      ]

  const total = rows.reduce((a, r) => a + (r.valor || 0), 0)
  const emAberto = rows.filter((r) => r.status === 'EM ABERTO').length
  const vencidas = rows.filter((r) => r.status === 'VENCIDA' || r.status === 'VENCIDO').length

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">B</div>
          <div>
            <b>bosso</b>
            <span>OPERATIONS</span>
          </div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <div className="side-nav">
          <a onClick={() => navigate({ to: '/' })}>← Estoque</a>
        </div>
        <div className="sidebar-bottom">
          <small>BEERSALES CONNECTOR</small>
          <strong>
            <em />
            Dados de 13 JUL 2026
          </strong>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <div className="eyebrow">FINANCEIRO / DADOS BRUTOS</div>
            <h1>{title}</h1>
            <p>{rows.length} registros carregados do relatório BeerSales, sem paginação.</p>
          </div>
          <Button variant="outline" leftSection={<ArrowLeft size={16} />} onClick={() => navigate({ to: '/' })}>
            Voltar
          </Button>
        </header>
        <section className="cards">
          <div className="card accent">
            <span>VALOR DOS REGISTROS</span>
            <b>{money(total)}</b>
            <small>campo Valor</small>
          </div>
          <div className="card">
            <span>REGISTROS</span>
            <b>{rows.length}</b>
            <small>após busca</small>
          </div>
          <div className="card">
            <span>EM ABERTO</span>
            <b>{emAberto}</b>
            <small>status literal do relatório</small>
          </div>
          <div className="card warning">
            <span>VENCIDOS</span>
            <b>{vencidas}</b>
            <small>status literal do relatório</small>
          </div>
        </section>
        <section className="panel table-panel">
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
              {() => (
                <>
                  <Header>
                    <HeaderRow>
                      {cols.map((c) => (
                        <HeaderCell key={c.label}>{c.label}</HeaderCell>
                      ))}
                    </HeaderRow>
                  </Header>
                  <Body>
                    {rows.map((item) => (
                      <Row key={item.id ?? JSON.stringify(item)} item={item}>
                        {cols.map((c) => (
                          <Cell key={c.label}>{c.renderCell(item)}</Cell>
                        ))}
                      </Row>
                    ))}
                  </Body>
                </>
              )}
            </Table>
          </div>
        </section>
        <footer>
          BEERSALES / {receber ? 'CONTAS A RECEBER' : 'CONTAS A PAGAR'}
          <span>
            Última leitura: 13/07/2026 às 15:15 · <b>● Sistema conectado</b>
          </span>
        </footer>
      </main>
    </div>
  )
}
