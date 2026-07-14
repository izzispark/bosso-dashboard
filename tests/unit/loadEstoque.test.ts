import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { makeEstoqueRow, makeEstoqueCsv } from '../fixtures/estoque.fixture'

describe('loadEstoque', () => {
  it('parses valid CSV into EstoqueRow[] with computed value=cost', async () => {
    const rows = [
      makeEstoqueRow({ code: 'PROD01', name: 'Produto A', qty: 100, cost: 25.5, unit: 'UN' }),
      makeEstoqueRow({ code: 'PROD02', name: 'Produto B', qty: 50, cost: 10.0, unit: 'KG' }),
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
    expect(result[0].value).toBe(25.5) // value = cost
    expect(result[1].code).toBe('PROD02')
  })

  it('throws on missing file', async () => {
    const { loadEstoque } = await import('~/lib/loadEstoque')
    await expect(loadEstoque('/tmp/nonexistent-file-xyz.csv')).rejects.toThrow()
  })

  it('parses rows with negative qty normally', async () => {
    // Should still parse and include negative qty rows (no filtering)
    const rows = [
      makeEstoqueRow({ code: 'NEG01', name: 'Negative Qty', qty: -5, cost: 10, unit: 'UN' }),
      makeEstoqueRow({ code: 'POS01', name: 'Positive Qty', qty: 100, cost: 20, unit: 'UN' }),
    ]
    const csv = makeEstoqueCsv(rows)
    const dir = mkdtempSync(join(tmpdir(), 'loadEstoque-test-'))
    const filePath = join(dir, 'estoque.csv')
    writeFileSync(filePath, csv, 'utf-8')

    const { loadEstoque } = await import('~/lib/loadEstoque')
    const result = await loadEstoque(filePath)

    expect(result).toHaveLength(2)
    // Both rows preserved
    const negRow = result.find((r: { code: string }) => r.code === 'NEG01')
    expect(negRow).toBeDefined()
    expect(negRow!.qty).toBe(-5)
    const posRow = result.find((r: { code: string }) => r.code === 'POS01')
    expect(posRow).toBeDefined()
    expect(posRow!.qty).toBe(100)
  })
})
