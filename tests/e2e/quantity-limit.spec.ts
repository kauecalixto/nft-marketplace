import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // O estado do mock vive no navegador (MSW), então o reset roda no contexto da página.
  await page.goto('/')
  await page.evaluate(() => fetch('/api/__mock/reset', { method: 'POST' }))
})

test('usuário aumenta a quantidade até o limite da edição e o + é desabilitado com mensagem', async ({ page }) => {
  await page.goto('/nfts/nft-1') // min(disponível 10, limite por carteira 3) = 3
  const input = page.getByTestId('quantity-input')
  const inc = page.getByTestId('quantity-increase')
  await expect(input).toHaveValue('1')
  await inc.click()
  await inc.click()
  await expect(input).toHaveValue('3')
  await expect(inc).toBeDisabled()
  await expect(page.getByTestId('quantity-limit-message')).toHaveText('Limite de quantidade atingido')
})

test('edição indisponível desabilita Adicionar ao carrinho', async ({ page }) => {
  await page.goto('/nfts/nft-5') // available = 0
  await expect(page.getByTestId('edition-unavailable')).toHaveText('Edição indisponível')
  await expect(page.getByTestId('add-to-cart')).toBeDisabled()
})

test('NFT inexistente mostra NFT não encontrado', async ({ page }) => {
  await page.goto('/nfts/nao-existe')
  await expect(page.getByTestId('nft-not-found')).toHaveText('NFT não encontrado')
})
