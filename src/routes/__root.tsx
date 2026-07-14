/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { theme } from '~/styles/mantine-theme'
import '@mantine/core/styles.css'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Bosso Operations — Estoque & Financeiro' },
      { name: 'description', content: 'Dashboard operacional Bosso Produções' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootLayout,
})

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        <MantineProvider theme={theme} forceColorScheme="light">
          {children}
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  )
}
