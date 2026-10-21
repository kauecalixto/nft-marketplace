import { test, expect, type Page } from '@playwright/test'

const scenario = (page: Page, s: string) =>
  page.evaluate((sc) => fetch('/api/__mock/scenario', { method: 'POST', body: JSON.stringify({ scenario: sc }) }), s)
const names = (page: Page) => page.getByTestId('nft-card').locator('h2').allTextContents()

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/__mock/reset', { method: 'POST' }))
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(6)
})

test('lista 6 por página e pagina pela URL', async ({ page }) => {
  await expect(page.getByTestId('page-indicator')).toHaveText('Página 1 de 2')
  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByTestId('page-indicator')).toHaveText('Página 2 de 2')
  await expect(page.getByTestId('nft-card')).toHaveCount(6)
})

test('filtros combinados vivem na URL e voltam com reload e histórico', async ({ page }) => {
  await page.getByLabel('Preço mín. (ETH)').fill('0.10')
  await page.getByLabel('Preço mín. (ETH)').blur()
  await page.getByLabel('Preço máx. (ETH)').fill('3.333')
  await page.getByLabel('Preço máx. (ETH)').blur()
  await page.getByLabel('Somente disponíveis').check()
  await page.getByLabel('Ordenar por').selectOption('price-desc')
  await expect(page).toHaveURL(/min=(%22)?0\.10/)
  await expect(page).toHaveURL(/max=(%22)?3\.333/)
  await expect(page).toHaveURL(/available=true/)
  await expect(page).toHaveURL(/sort=price-desc/)
  // 0.15..3.333 disponíveis, preço decrescente (7 itens: 6 na página 1)
  await expect.poll(() => names(page)).toEqual(['Void Walker', 'Glass Garden', 'Blue Orbit', 'Aurora Genesis', 'Neon Dunes', 'Solo Limit'])
  await page.getByLabel('Buscar NFT').fill('o')
  const byPriceDesc = ['Void Walker', 'Blue Orbit', 'Aurora Genesis', 'Neon Dunes', 'Solo Limit', 'Paper Moon']
  await expect.poll(() => names(page)).toEqual(byPriceDesc)

  const url = page.url()
  await page.reload()
  await expect(page).toHaveURL(url)
  await expect(page.getByLabel('Preço mín. (ETH)')).toHaveValue('0.10')
  await expect(page.getByLabel('Somente disponíveis')).toBeChecked()
  await expect(page.getByLabel('Ordenar por')).toHaveValue('price-desc')
  await expect.poll(() => names(page)).toEqual(byPriceDesc)

  await page.getByLabel('Ordenar por').selectOption('name')
  await expect.poll(() => names(page)).toEqual(['Aurora Genesis', 'Blue Orbit', 'Neon Dunes', 'Paper Moon', 'Solo Limit', 'Void Walker'])
  await page.goBack()
  await expect(page).toHaveURL(/sort=price-desc/)
  await expect(page.getByLabel('Ordenar por')).toHaveValue('price-desc')
  await expect.poll(() => names(page)).toEqual(byPriceDesc)
})

test('mudar filtro reinicia a paginação e a página sobrevive a reload', async ({ page }) => {
  await page.getByLabel('Ordenar por').selectOption('price-asc')
  await expect.poll(async () => (await names(page))[0]).toBe('Pixel Pals')
  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page).toHaveURL(/page=2/)
  await page.reload()
  await expect(page.getByTestId('page-indicator')).toHaveText('Página 2 de 2')
  await page.getByLabel('Somente disponíveis').check()
  await expect(page).not.toHaveURL(/page=/)
  await expect(page.getByTestId('page-indicator')).toHaveText('Página 1 de 2')
})

test('resposta fora de ordem não sobrescreve a última página clicada', async ({ page }) => {
  await page.getByLabel('Ordenar por').selectOption('name')
  await expect.poll(async () => (await names(page))[0]).toBe('Aurora Genesis')
  await scenario(page, 'variable-latency')
  await page.getByLabel('Ordenar por').selectOption('price-asc') // página 1: 900 ms (lenta)
  await page.getByRole('button', { name: 'Próxima' }).click() // página 2: 100 ms (chega antes)
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByTestId('page-indicator')).toHaveText('Página 2 de 2')
  await expect.poll(async () => (await names(page))[0]).toBe('Sold Out Sun')
  await page.waitForTimeout(1200) // a resposta lenta da página 1 chega depois e deve ser descartada
  await expect(page.getByTestId('page-indicator')).toHaveText('Página 2 de 2')
  await expect(page).toHaveURL(/sort=price-asc/)
  expect((await names(page))[0]).toBe('Sold Out Sun')
})

test('resultado vazio mostra mensagem', async ({ page }) => {
  await page.getByLabel('Buscar NFT').fill('zzzz-inexistente')
  await expect(page.getByTestId('catalog-empty')).toHaveText('Nenhum NFT encontrado')
  await expect(page.getByTestId('nft-card')).toHaveCount(0)
})

test('preço inválido mostra erro e não consulta a API', async ({ page }) => {
  await page.getByLabel('Preço mín. (ETH)').fill('abc')
  await page.getByLabel('Preço mín. (ETH)').blur()
  await expect(page.getByRole('alert')).toContainText('preços decimais válidos')
  await expect(page).not.toHaveURL(/min=/)
})

test('erro de rede no catálogo, cenário default e Tentar novamente recupera', async ({ page }) => {
  await scenario(page, 'network-error')
  await page.getByLabel('Somente disponíveis').check()
  await expect(page.getByTestId('catalog-error')).toContainText('Erro ao carregar NFTs')
  await scenario(page, 'default')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByTestId('catalog-error')).toHaveCount(0)
  await expect(page.getByTestId('nft-card')).toHaveCount(6)
})

for (const path of ['/', '/nfts/nft-1']) {
  test(`sem overflow horizontal em 390px: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    await expect(page.locator('h1, h2').first()).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
