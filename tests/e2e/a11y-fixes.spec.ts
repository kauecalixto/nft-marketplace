import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

const post = (page: Page, url: string) => page.evaluate((u) => fetch(u, { method: 'POST' }).then((r) => r.json()), url)

test.beforeEach(async ({ page }) => {
  await resetAs(page)
})

test('skip link é o primeiro foco e leva o foco ao conteúdo; nav rotulado e h1 na home', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Ir para o conteúdo' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})

test('título do documento por rota e foco no conteúdo ao navegar', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Catálogo - NFT Marketplace')
  await expect(page.locator('#main')).not.toBeFocused() // carga inicial não rouba o foco
  await page.getByRole('link', { name: 'Carrinho' }).click()
  await expect(page).toHaveTitle('Carrinho - NFT Marketplace')
  await expect(page.locator('#main')).toBeFocused()
  await page.goto('/rota-que-nao-existe')
  await expect(page).toHaveTitle('Página não encontrada - NFT Marketplace')
})

test('home: erro de preço associado aos campos por aria-describedby', async ({ page }) => {
  await page.goto('/')
  const min = page.getByLabel('Preço mín. (ETH)')
  await expect(min).not.toHaveAttribute('aria-describedby', /.+/)
  await min.fill('abc')
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('preços decimais válidos')
  await expect(min).toHaveAttribute('aria-invalid', 'true')
  const id = await alert.getAttribute('id')
  expect(id).toBeTruthy()
  await expect(min).toHaveAttribute('aria-describedby', id!)
  await expect(page.getByLabel('Preço máx. (ETH)')).toHaveAttribute('aria-describedby', id!)
})

test('carrinho: cupom inválido com aria-invalid/describedby; Remover nomeado; falha ao remover é anunciada', async ({ page }) => {
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await page.goto('/cart')
  const input = page.getByTestId('coupon-input')
  await expect(input).toHaveAttribute('aria-invalid', 'false')
  await input.fill('NOPE')
  await page.getByTestId('coupon-apply').click()
  const err = page.getByTestId('coupon-error')
  await expect(err).toHaveText('Cupom inválido')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(input).toHaveAttribute('aria-describedby', (await err.getAttribute('id'))!)

  const remove = page.getByTestId('remove-nft-2')
  await expect(remove).toHaveAccessibleName(/^Remover .+/)
  // Força falha de rede só no DELETE (o MSW responde pelo service worker, então redireciona o XHR para um host inalcançável).
  await page.evaluate(() => {
    const open = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
      const target = method.toUpperCase() === 'DELETE' ? 'http://127.0.0.1:1/x' : url
      return (open as (...a: unknown[]) => void).call(this, method, target, ...rest)
    } as typeof open
  })
  await remove.click()
  await expect(page.getByTestId('cart-notice')).toHaveText('Não foi possível remover o item.')
  await expect(page.getByTestId('cart-item-nft-2')).toBeVisible() // item restaurado após o erro
})

test('checkout: erro da carteira associado ao select por aria-describedby', async ({ page }) => {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await page.goto('/checkout')
  await page.getByTestId('review-order').click()
  const err = page.getByTestId('error-walletId')
  await expect(err).toHaveText('Selecione uma carteira')
  const select = page.getByTestId('field-wallet')
  await expect(select).toHaveAttribute('aria-invalid', 'true')
  await expect(select).toHaveAttribute('aria-describedby', (await err.getAttribute('id'))!)
})

test('pedido: região viva persistente anuncia a confirmação (pendente → confirmado)', async ({ page }) => {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-held' })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  const id = new URL(page.url()).pathname.split('/').pop()!
  const live = page.getByTestId('order-live')
  await expect(live).toHaveAttribute('aria-live', 'polite')
  await expect(live).toHaveText('')
  await page.evaluate(() => ((window as unknown as { __live: Element }).__live = document.querySelector('[data-testid=order-live]')!))
  await post(page, `/api/__mock/orders/${id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible({ timeout: 15000 })
  await expect(live).toHaveText('Pedido confirmado.')
  // o mesmo nó sobreviveu à troca de estado (senão o leitor de tela não anunciaria)
  expect(await page.evaluate(() => (window as unknown as { __live: Element }).__live.isConnected)).toBe(true)
})
