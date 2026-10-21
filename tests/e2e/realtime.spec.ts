import { test, expect, type Page } from '@playwright/test'

const post = (page: Page, url: string, body?: unknown) =>
  page.evaluate(
    async ([u, b]) => (await fetch(u as string, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b ?? {}) })).json(),
    [url, body] as const,
  )
const clients = (page: Page) => page.evaluate(async () => (await fetch('/api/__mock/socket/clients')).json() as Promise<{ count: number }>)

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/__mock/reset', { method: 'POST' }))
  await page.goto('/nfts/nft-1')
  await expect(page.getByRole('heading', { name: 'Aurora Genesis' })).toBeVisible()
  await expect.poll(async () => (await clients(page)).count).toBe(1) // socket.io-client conectado ao mock
})

test('nft.updated atualiza o preço e avisa em live region', async ({ page }) => {
  await expect(page.getByText('0.50 ETH')).toBeVisible()
  await expect(page.getByTestId('nft-updated-notice')).toHaveText('')
  await post(page, '/api/__mock/nfts/nft-1/update')
  await expect(page.getByText('0.125 ETH')).toBeVisible()
  const notice = page.getByTestId('nft-updated-notice')
  await expect(notice).toHaveText('Preço ou disponibilidade atualizado')
  await expect(notice).toHaveAttribute('role', 'status')
})

test('evento duplicado e evento antigo não disparam novo refetch', async ({ page }) => {
  let gets = 0
  page.on('request', (r) => { if (r.method() === 'GET' && r.url().endsWith('/api/nfts/nft-1')) gets++ })
  const evt = await post(page, '/api/__mock/nfts/nft-1/update') // versão 1
  await expect(page.getByText('0.125 ETH')).toBeVisible()
  await expect.poll(() => gets).toBe(1)
  await post(page, '/api/__mock/nfts/nft-1/event', { eventId: evt.eventId, version: 1 }) // duplicata
  await post(page, '/api/__mock/nfts/nft-1/event', { version: 0 }) // antigo, eventId novo
  await page.waitForTimeout(700)
  expect(gets).toBe(1)
  await post(page, '/api/__mock/nfts/nft-1/event', { version: 5 }) // controle positivo
  await expect.poll(() => gets).toBe(2)
})

test('desconexão: atualização perdida é reconciliada com o REST ao reconectar', async ({ page }) => {
  await post(page, '/api/__mock/socket/disconnect')
  expect((await clients(page)).count).toBe(0)
  await post(page, '/api/__mock/nfts/nft-1/update') // ninguém recebe o evento
  await expect(page.getByText('0.50 ETH')).toBeVisible()
  await expect.poll(async () => (await clients(page)).count, { timeout: 10000 }).toBe(1)
  await expect(page.getByText('0.125 ETH')).toBeVisible()
})
