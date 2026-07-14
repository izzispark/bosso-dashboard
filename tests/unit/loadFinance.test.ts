import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { makeFinance, makeFinanceJson } from '../fixtures/finance.fixture'

describe('loadFinance', () => {
  it('parses both receber and pagar arrays', async () => {
    const receber = [makeFinance({ cliente: 'Cliente ABC', valor: 1000, status: 'EM ABERTO' })]
    const pagar = [makeFinance({ fornecedor: 'Fornecedor XYZ', valor: 500, status: 'PAGO' })]
    const json = makeFinanceJson(receber, pagar)
    const dir = mkdtempSync(join(tmpdir(), 'loadFinance-test-'))
    const filePath = join(dir, 'finance.json')
    writeFileSync(filePath, json, 'utf-8')

    const { loadFinance } = await import('~/lib/loadFinance')
    const result = await loadFinance(filePath)

    expect(result).toHaveProperty('receber')
    expect(result).toHaveProperty('pagar')
    expect(result.receber).toHaveLength(1)
    expect(result.receber[0].cliente).toBe('Cliente ABC')
    expect(result.receber[0].valor).toBe(1000)
    expect(result.pagar).toHaveLength(1)
    expect(result.pagar[0].fornecedor).toBe('Fornecedor XYZ')
    expect(result.pagar[0].valor).toBe(500)
  })

  it('throws on missing file', async () => {
    const { loadFinance } = await import('~/lib/loadFinance')
    await expect(loadFinance('/tmp/nonexistent-finance-file.json')).rejects.toThrow()
  })

  it('throws on malformed JSON', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'loadFinance-test-'))
    const filePath = join(dir, 'malformed.json')
    writeFileSync(filePath, 'not valid json', 'utf-8')

    const { loadFinance } = await import('~/lib/loadFinance')
    await expect(loadFinance(filePath)).rejects.toThrow()
  })
})
