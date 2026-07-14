import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: BootPage,
})

function BootPage() {
  return (
    <div style={{ padding: 32, fontFamily: 'DM Sans, sans-serif' }}>
      <h1>Bosso Operations</h1>
      <p>Boot OK — TanStack Start rodando.</p>
    </div>
  )
}
