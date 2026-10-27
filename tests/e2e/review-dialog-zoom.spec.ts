import { test, expect } from '@playwright/test'
import { api, resetAs, ADDRESS } from './helpers-extra'

// Reflow (WCAG 1.4.10): 390px a 200% de zoom = 195 x 422 px CSS. O diálogo de revisão não pode cortar conteúdo:
// nada horizontalmente fora da caixa e todo o conteúdo (título ao botão Confirmar) alcançável por rolagem vertical.
test.use({ viewport: { width: 195, height: 422 }, hasTouch: true })

test.beforeEach(async ({ page }) => {
  await resetAs(page)
})

test('Reflow (a11y): diálogo de revisão em 390px com zoom 200% não perde conteúdo', async ({ page }) => {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await page.goto('/checkout')
  await page.getByTestId('field-name').fill('Ana Colecionadora de Arte Digital')
  await page.getByTestId('field-email').fill('ana.colecionadora.de.arte@example.test')
  await page.getByTestId('field-document').fill('12345678901')
  await page.getByTestId('field-wallet').selectOption({ index: 1 })
  await page.getByTestId('review-order').click()

  const dialog = page.getByTestId('review-dialog')
  await expect(dialog).toBeVisible()

  const m = await dialog.evaluate((root) => {
    const box = root.getBoundingClientRect()
    const clippedX: string[] = []
    for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      // Texto só para leitores de tela (sr-only: 1x1 px, recortado de propósito) não conta como conteúdo cortado.
      if (r.width <= 1 && r.height <= 1 && getComputedStyle(el).position === 'absolute') continue
      const label = `${el.tagName.toLowerCase()}${el.dataset.testid ? `[${el.dataset.testid}]` : ''}`
      if (r.left < box.left - 1 || r.right > box.right + 1) clippedX.push(`${label} fora da caixa (${Math.round(r.left)}..${Math.round(r.right)} vs ${Math.round(box.left)}..${Math.round(box.right)})`)
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline') clippedX.push(`${label} scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth}`)
    }
    return {
      clippedX,
      top: box.top,
      bottom: box.bottom,
      vh: window.innerHeight,
      overflowY: getComputedStyle(root).overflowY,
      scrollable: root.scrollHeight > root.clientHeight + 1,
      docOverflowX: document.documentElement.scrollWidth - window.innerWidth,
    }
  })

  expect(m.clippedX, 'conteúdo cortado/estourando na horizontal').toEqual([])
  expect(m.docOverflowX, 'rolagem horizontal na página').toBeLessThanOrEqual(0)
  expect(m.top, 'topo do diálogo acima da viewport').toBeGreaterThanOrEqual(-1)
  expect(m.bottom, 'base do diálogo abaixo da viewport').toBeLessThanOrEqual(m.vh + 1)
  if (m.scrollable) expect(['auto', 'scroll'], 'conteúdo excede a altura e o diálogo não rola').toContain(m.overflowY)

  // Alcança o conteúdo do começo ao fim por rolagem vertical.
  const title = dialog.getByRole('heading', { name: 'Revisar pedido' })
  await title.scrollIntoViewIfNeeded()
  await expect(title).toBeInViewport()
  for (const id of ['confirm-order', 'cancel-review']) {
    const btn = dialog.getByTestId(id)
    await btn.scrollIntoViewIfNeeded()
    await expect(btn).toBeInViewport({ ratio: 1 })
    await expect(btn).toBeEnabled()
  }
})
