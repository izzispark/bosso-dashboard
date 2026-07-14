import { createFileRoute } from '@tanstack/react-router'
import { fetchFinance } from '~/server/finance'
import { FinanceView } from '~/components/FinanceView'

export const Route = createFileRoute('/pagar')({
  loader: () => fetchFinance(),
  component: () => <FinanceView mode="pagar" />,
})
