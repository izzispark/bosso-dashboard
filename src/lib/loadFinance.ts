import { readFile } from 'node:fs/promises'

export type FinanceRecord = {
  id?: string | number
  cliente?: string
  descricao?: string
  fornecedor?: string
  categoria?: string
  vencimento: string
  valor: number
  dias?: number
  status: 'EM ABERTO' | 'PAGO' | 'VENCIDA' | 'VENCIDO' | string
  pago?: number
  forma?: string
}

export type FinanceData = {
  receber: FinanceRecord[]
  pagar: FinanceRecord[]
}

export async function loadFinance(path: string): Promise<FinanceData> {
  const raw = await readFile(path, 'utf-8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed.receber) || !Array.isArray(parsed.pagar)) {
    throw new Error('Invalid finance data: must contain receber and pagar arrays')
  }

  return {
    receber: parsed.receber as FinanceRecord[],
    pagar: parsed.pagar as FinanceRecord[],
  }
}
