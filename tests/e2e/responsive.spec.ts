import { test, expect } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout, noOverflow } from './helpers-extra'

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]

for (const vp of VIEWPORTS) {
  test(`sem overflow horizontal em ${vp.width}px: carrinho, checkout, pedido, perfil, carteiras`, async ({ page }) => {
    await page.setViewportSize(vp)
    await resetAs(page)
    await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
    await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
    await page.goto('/cart')
    await expect(page.getByTestId('cart-item-nft-2')).toBeVisible()
    await noOverflow(page)
    await fillCheckout(page)
    await noOverflow(page)
    await page.getByTestId('review-order').click()
    await expect(page.getByTestId('review-dialog')).toBeVisible()
    await noOverflow(page)
    await page.getByTestId('confirm-order').click()
    await expect(page.getByTestId('order-confirmed')).toBeVisible()
    await expect(page).toHaveURL(/\/orders\/.+/)
    await noOverflow(page)
    await page.goto('/profile')
    await expect(page.getByLabel('Nome')).toBeVisible()
    await noOverflow(page)
    await page.goto('/wallets')
    await expect(page.getByTestId('wallet-item')).toBeVisible()
    await noOverflow(page)
  })
}
