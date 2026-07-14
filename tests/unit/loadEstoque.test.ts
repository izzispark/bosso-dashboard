import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { makeEstoqueRow, makeEstoqueCsv } from '../fixtures/estoque.fixture'

describe('loadEstoque', () => {
  it('parses valid CSV into EstoqueRow[] with computed value=cost', async () => {
    const rows = [
      makeEstoqueRow({ code: 'PROD01', name: 'Produto A', qty: 100, cost: 25.5, unit: 'UN', unitCost: 0.255 }),
      makeEstoqueRow({ code: 'PROD02', name: 'Produto B', qty: 50, cost: 10.0, unit: 'KG', unitCost: 0.2 }),
    ]
    const csv = makeEstoqueCsv(rows)
    const dir = mkdtempSync(join(tmpdir(), 'loadEstoque-test-'))
    const filePath = join(dir, 'estoque.csv')
    writeFileSync(filePath, csv, 'utf-8')

    const { loadEstoque } = await import('~/lib/loadEstoque')
    const result = await loadEstoque(filePath)

    expect(result).toHaveLength(2)
    expect(result[0].code).toBe('PROD01')
    expect(result[0].name).toBe('Produto A')
    expect(result[0].qty).toBe(100)
    expect(result[0].cost).toBe(25.5)
    expect(result[0].unit).toBe('UN')
    expect(result[0].unitCost).toBe(0.255)
    expect(result[0].value).toBe(25.5) // value = cost
    expect(result[1].code).toBe('PROD02')
  })

  it('throws on missing file', async () => {
    const { loadEstoque } = await import('~/lib/loadEstoque')
    await expect(loadEstoque('/tmp/nonexistent-file-xyz.csv')).rejects.toThrow()
  })

  it('handles real-world CSV with title + blank lines before data', async () => {
    // Real CSV starts with "ESTOQUE_PRODUTOS_15-15-21,,,,,,,,,Gerado em 13/07/2026"
    // followed by 2 blank lines, then data rows. Parser must skip noise.
    const csv = [
      'ESTOQUE_PRODUTOS_15-15-21,,,,,,,,,Gerado em 13/07/2026 15:15:21',
      '',
      '',
      ...makeEstoqueCsv([
        makeEstoqueRow({ code: 'AGUA01', name: 'AGUA SEM GAS 510ML', qty: 117, cost: 211.68, unitCost: 1.80923 }),
      ]).split('\n'),
    ].join('\n')

    const dir = mkdtempSync(join(tmpdir(), 'loadEstoque-real-'))
    const filePath = join(dir, 'estoque.csv')
    writeFileSync(filePath, csv, 'utf-8')

    const { loadEstoque } = await import('~/lib/loadEstoque')
    const result = await loadEstoque(filePath)

    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('AGUA01')
  })

  it('flags alerts for qty<0 OR qty>100000', async () => {
    const rows = [
      makeEstoqueRow({ code: 'NEG01', name: 'Negativo', qty: -5, cost: 10 }),
      makeEstoqueRow({ code: 'BIG01', name: 'Grande', qty: 250000, cost: 10 }),
      makeEstoqueRow({ code: 'OK01', name: 'OK', qty: 100, cost: 10 }),
    ]
    const csv = makeEstoqueCsv(rows)
    const dir = mkdtempSync(join(tmpdir(), 'loadEstoque-alert-'))
    const filePath = join(dir, 'estoque.csv')
    writeFileSync(filePath, csv, 'utf-8')

    const { loadEstoque } = await import('~/lib/loadEstoque')
    const result = await loadEstoque(filePath)

    const alerts = result.filter(r => r.alert)
    expect(alerts).toHaveLength(2)
    expect(alerts.map(a => a.code).sort()).toEqual(['BIG01', 'NEG01'])
  })

  it('parses the actual BeerSales export from src/estoque.csv', async () => {
    const { loadEstoque } = await import('~/lib/loadEstoque')
    const result = await loadEstoque('./src/estoque.csv')
    expect(result.length).toBeGreaterThan(50)  // 71 produtos reais
    const agua = result.find(r => r.code === '7898381810164')
    expect(agua).toBeDefined()
    expect(agua?.name).toContain('AGUA')
    expect(agua?.qty).toBe(117)
  })
})
