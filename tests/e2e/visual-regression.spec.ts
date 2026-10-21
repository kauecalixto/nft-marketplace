import { test, expect } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]
const opts = { maxDiffPixelRatio: 0.002, animations: 'disabled' as const, caret: 'hide' as const, fullPage: true }

for (const vp of VIEWPORTS) {
  test(`@visual telas principais ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize(vp)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await resetAs(page)
    await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
    await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })

    await page.goto('/')
    await expect(page.getByText('Aurora Genesis').first()).toBeVisible()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`inicio-${vp.width}.png`, opts)

    await page.goto('/nfts/nft-1')
    await expect(page.getByRole('heading', { name: 'Aurora Genesis' })).toBeVisible()
    await expect(page.getByTestId('skeleton-detail')).toHaveCount(0)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`detalhe-${vp.width}.png`, opts)

    await page.goto('/cart')
    await expect(page.getByTestId('cart-item-nft-2')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`carrinho-${vp.width}.png`, opts)

    await fillCheckout(page)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`pagamento-${vp.width}.png`, opts)
  })
}
