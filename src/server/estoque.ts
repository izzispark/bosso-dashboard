import { createServerFn } from '@tanstack/react-start'
import { loadEstoque } from '~/lib/loadEstoque'
import { resolve } from 'node:path'

const DATA_DIR = process.env.DATA_DIR || '/root/projects/estoque-dashboard/src'

export const fetchEstoque = createServerFn({ method: 'GET' }).handler(async () => {
  return loadEstoque(resolve(DATA_DIR, 'estoque.csv'))
})
