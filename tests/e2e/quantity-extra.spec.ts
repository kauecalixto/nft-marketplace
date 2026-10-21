import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/__mock/reset', { method: 'POST' }))
})

test('diminuir mantém o mínimo 1', async ({ page }) => {
  await page.goto('/nfts/nft-1')
  const input = page.getByTestId('quantity-input')
  await expect(page.getByTestId('quantity-decrease')).toBeDisabled()
  await page.getByTestId('quantity-increase').click()
  await expect(input).toHaveValue('2')
  await page.getByTestId('quantity-decrease').click()
  await expect(input).toHaveValue('1')
  await expect(page.getByTestId('quantity-decrease')).toBeDisabled()
})

test('digitação fora da faixa é ajustada e o campo pode ser apagado', async ({ page }) => {
  await page.goto('/nfts/nft-1') // máx 3
  const input = page.getByTestId('quantity-input')
  await input.fill('99')
  await expect(input).toHaveValue('3')
  await input.fill('')
  await expect(input).toHaveValue('')
  await input.fill('0')
  await expect(input).toHaveValue('1')
  await input.fill('-4')
  await expect(input).toHaveValue('1')
})

test('NFT inexistente não exibe seletor de quantidade', async ({ page }) => {
  await page.goto('/nfts/nao-existe')
  await expect(page.getByTestId('nft-not-found')).toBeVisible()
  await expect(page.getByTestId('quantity-input')).toHaveCount(0)
})

test('indisponível não mostra seletor de quantidade com 0', async ({ page }) => {
  await page.goto('/nfts/nft-5')
  await expect(page.getByTestId('edition-unavailable')).toBeVisible()
  await expect(page.getByTestId('quantity-input')).toHaveCount(0)
})
