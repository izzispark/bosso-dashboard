import { createServerFn } from '@tanstack/react-start'
import { loadFinance } from '~/lib/loadFinance'
import { resolve } from 'node:path'

const DATA_DIR = process.env.DATA_DIR || '/root/projects/estoque-dashboard/src'

export const fetchFinance = createServerFn({ method: 'GET' }).handler(async () => {
  return loadFinance(resolve(DATA_DIR, 'finance.json'))
})
