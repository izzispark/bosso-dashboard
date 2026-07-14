import { faker } from '@faker-js/faker/locale/pt_BR'

export interface FinanceRecord {
  cliente?: string
  descricao?: string
  fornecedor?: string
  categoria?: string
  vencimento: string
  valor: number
  dias?: number
  status: 'EM ABERTO' | 'PAGO' | 'VENCIDA'
}

export function makeFinance(overrides?: Partial<FinanceRecord>): FinanceRecord {
  const isReceber = overrides?.cliente !== undefined || overrides?.fornecedor === undefined
  return {
    cliente: isReceber ? faker.company.name() : undefined,
    descricao: faker.lorem.sentence(3),
    fornecedor: isReceber ? undefined : faker.company.name(),
    categoria: faker.helpers.arrayElement(['Mercadorias', 'Serviços', 'Impostos', 'Aluguel', 'Salários']),
    vencimento: faker.date.future().toISOString().split('T')[0],
    valor: parseFloat(faker.commerce.price({ min: 100, max: 50000 })),
    dias: faker.number.int({ min: 1, max: 90 }),
    status: faker.helpers.arrayElement(['EM ABERTO', 'PAGO', 'VENCIDA']),
    ...overrides,
  }
}

export function makeFinanceJson(
  receber: FinanceRecord[],
  pagar: FinanceRecord[]
): string {
  return JSON.stringify({ receber, pagar }, null, 2)
}
