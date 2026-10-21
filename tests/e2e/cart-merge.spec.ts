import { test, expect } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

test('item de visitante continua no carrinho após o login', async ({ page }) => {
  await resetAs(page, null)
  expect((await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })).status).toBe(201)
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item-nft-2')).toBeVisible()
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('ana@example.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item-nft-2')).toBeVisible()
  await expect(page.getByTestId('qty-nft-2')).toHaveText('1')
})

// Nota: o checkout compra o carrinho inteiro (sem compra parcial); "remover só as quantidades compradas" não é aplicável.
test('compra confirmada remove os itens comprados do carrinho', async ({ page }) => {
  await resetAs(page)
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await api(page, 'POST', '/cart', { nftId: 'nft-3', quantity: 1 })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  const cart = await api(page, 'GET', '/cart')
  expect(cart.json).toHaveLength(0)
})
