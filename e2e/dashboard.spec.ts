import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Estoque Dashboard', () => {
  test('homepage loads with Estoque title and KPIs', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Bosso Operations/i)
    // Verifica que algum KPI card aparece (sem depender de nome exato)
    await expect(page.getByText(/VALOR EM ESTOQUE/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('navigates to /receber and shows accounts list', async ({ page }) => {
    await page.goto('/receber')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Contas a Receber/i)
    await expect(page.getByText(/registros carregados/i)).toBeVisible({ timeout: 10000 })
  })

  test('navigates to /pagar and shows accounts list', async ({ page }) => {
    await page.goto('/pagar')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Contas a Pagar/i)
  })

  test('search filter narrows product table on /', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Aguarda a tabela carregar
    await page.waitForSelector('input[placeholder*="Buscar" i]', { timeout: 10000 })
    const input = page.locator('input[placeholder*="Buscar" i]').first()
    await input.fill('AGUA')
    // Espera filtro aplicar
    await page.waitForTimeout(500)
    // Verifica que linhas da tabela contêm AGUA
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    const firstRowText = await rows.first().innerText()
    expect(firstRowText).toContain('AGUA')
  })

  test('renders correctly on mobile (Pixel 5)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    // Sem scroll horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
