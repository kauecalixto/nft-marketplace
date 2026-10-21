import { test, expect } from '@playwright/test'

test('rota inexistente mostra 404 com link para o início', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  await page.getByRole('link', { name: 'Voltar ao início' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('nft-card').first()).toBeVisible()
})
