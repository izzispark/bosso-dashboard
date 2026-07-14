import { createFileRoute } from '@tanstack/react-router'
import { fetchEstoque } from '~/server/estoque'
import { EstoqueView } from '~/components/EstoqueView'

export const Route = createFileRoute('/')({
  loader: () => fetchEstoque(),
  component: EstoqueView,
})
