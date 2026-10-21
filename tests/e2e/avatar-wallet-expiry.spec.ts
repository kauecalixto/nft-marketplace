import { test, expect, type Page } from '@playwright/test'
import { ADDRESS, api, resetAs } from './helpers-extra'

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

async function setupCheckout(page: Page) {
  expect((await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })).status).toBe(201)
  expect((await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })).status).toBe(201)
  await page.goto('/checkout')
  await page.getByTestId('field-name').fill('Ana Colecionadora')
  await page.getByTestId('field-email').fill('ana@example.test')
  await page.getByTestId('field-document').fill('12345678901')
  await page.getByTestId('field-wallet').selectOption({ index: 1 })
}

test.describe('avatar', () => {
  test.beforeEach(async ({ page }) => resetAs(page))

  test('imagem válida mostra preview e persiste como data URL', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByTestId('avatar-file')).toHaveAttribute('accept', 'image/*')
    await page.getByTestId('avatar-file').setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: PNG })
    await expect(page.getByTestId('avatar-preview')).toBeVisible()
    await page.getByTestId('avatar-save').click()
    await expect(page.getByTestId('avatar-saved')).toBeVisible()
    const profile = await api(page, 'GET', '/profile')
    expect(profile.json.avatar).toMatch(/^data:image\/png;base64,/)
    await page.reload()
    await expect(page.getByRole('img', { name: 'Avatar', exact: true })).toBeVisible()
  })

  test('arquivo acima de 1 MB ou não imagem mostra erro e não envia', async ({ page }) => {
    await page.goto('/profile')
    await page.getByTestId('avatar-file').setInputFiles({ name: 'big.png', mimeType: 'image/png', buffer: Buffer.alloc(1024 * 1024 + 1) })
    await expect(page.getByTestId('avatar-error')).toHaveText('A imagem deve ter no máximo 1 MB')
    await expect(page.getByTestId('avatar-preview')).toHaveCount(0)
    await page.getByTestId('avatar-file').setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('x') })
    await expect(page.getByTestId('avatar-error')).toHaveText('Envie um arquivo de imagem')
    expect((await api(page, 'GET', '/profile')).json.avatar).toBe('')
  })
})

test.describe('carteira no checkout', () => {
  test.beforeEach(async ({ page }) => resetAs(page))

  test('desconectar bloqueia a revisão e conectar libera', async ({ page }) => {
    await setupCheckout(page)
    await expect(page.getByTestId('wallet-status')).toHaveText('Conectada')
    await page.getByTestId('disconnect-wallet').click()
    await expect(page.getByTestId('wallet-status')).toHaveText('Desconectada')
    await page.getByTestId('review-order').click()
    await expect(page.getByTestId('error-walletId')).toHaveText('Conecte a carteira para continuar')
    await expect(page.getByTestId('review-dialog')).toHaveCount(0)
    await page.getByTestId('connect-wallet').click()
    await expect(page.getByTestId('wallet-status')).toHaveText('Conectada')
    await page.getByTestId('review-order').click()
    await expect(page.getByTestId('review-dialog')).toBeVisible()
  })

  test('wallet-rejected devolve 409 e exibe erro acessível', async ({ page }) => {
    await setupCheckout(page)
    await api(page, 'POST', '/__mock/scenario', { scenario: 'wallet-rejected' })
    await page.getByTestId('disconnect-wallet').click()
    await expect(page.getByTestId('wallet-status')).toHaveText('Desconectada')
    await page.getByTestId('connect-wallet').click()
    await expect(page.getByRole('alert').filter({ hasText: 'recusou a conexão' })).toBeVisible()
    await expect(page.getByTestId('wallet-status')).toHaveText('Desconectada')
    const wallet = (await api(page, 'GET', '/wallets')).json[0]
    const r = await api(page, 'POST', `/wallets/${wallet.id}/connect`)
    expect(r.status).toBe(409)
    expect(r.json.code).toBe('WALLET_REJECTED')
  })
})

test('sessão expirada no checkout preserva o formulário e não duplica o pedido', async ({ page }) => {
  await resetAs(page, null)
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('ana@example.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByTestId('nav-user')).toBeVisible()
  await setupCheckout(page)
  const keys: string[] = []
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().endsWith('/api/orders')) keys.push(req.headers()['idempotency-key'] ?? '')
  })
  await page.getByTestId('review-order').click()
  await expect(page.getByTestId('review-dialog')).toBeVisible()
  await page.evaluate(() => fetch('/api/__mock/session/expire', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('nft:token')}` } }))
  await page.getByTestId('confirm-order').click()
  await expect(page).toHaveURL(/\/login\?.*expired=true/)
  await page.getByLabel('E-mail').fill('ana@example.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByTestId('draft-restored')).toBeVisible()
  await expect(page.getByTestId('field-name')).toHaveValue('Ana Colecionadora')
  await expect(page.getByTestId('field-document')).toHaveValue('12345678901')
  await expect(page.getByTestId('review-dialog')).toBeVisible()
  await page.getByTestId('confirm-order').click()
  await expect(page).toHaveURL(/\/orders\/ord-1$/)
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(1)
  expect(keys.length).toBeGreaterThanOrEqual(1)
})

test('imagens do carrinho têm alt com o nome do NFT', async ({ page }) => {
  await resetAs(page)
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  const name = (await api(page, 'GET', '/cart')).json[0].name as string
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item-nft-2').getByRole('img', { name, exact: true })).toBeVisible()
})
