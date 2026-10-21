import { test, expect } from '@playwright/test'
import { api, resetAs } from './helpers-extra'

test.beforeEach(async ({ page }) => {
  await resetAs(page, null) // espera o app montar (MSW pronto) antes do reset
})

test('home mostra seção Destaques com 3 cards acima do catálogo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Destaques' })).toBeVisible()
  await expect(page.getByTestId('featured-card')).toHaveCount(3)
  await expect(page.getByTestId('nft-card').first()).toBeVisible()
  const featured = await page.getByTestId('featured-card').first().boundingBox()
  const catalog = await page.getByTestId('nft-card').first().boundingBox()
  expect(featured!.y).toBeLessThan(catalog!.y)
})

test('destaques exibem skeleton enquanto carregam', async ({ page }) => {
  await api(page, 'POST', '/__mock/scenario', { scenario: 'slow' })
  await page.goto('/')
  await expect(page.getByTestId('skeleton-featured')).toBeVisible()
})

test('galeria troca a imagem principal pelas miniaturas, com teclado', async ({ page }) => {
  await page.goto('/nfts/nft-1')
  const main = page.getByTestId('gallery-main')
  await expect(main).toHaveAttribute('alt', /Aurora Genesis - imagem 1 de 3/)
  const first = await main.getAttribute('src')
  await expect(page.getByTestId('gallery-thumb')).toHaveCount(3)
  const thumb = page.getByRole('button', { name: 'Ver imagem 2 de 3' })
  await thumb.focus()
  await page.keyboard.press('Enter')
  await expect(main).toHaveAttribute('alt', /imagem 2 de 3/)
  expect(await main.getAttribute('src')).not.toBe(first)
  await expect(thumb).toHaveAttribute('aria-pressed', 'true')
})
