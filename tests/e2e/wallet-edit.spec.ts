import { test, expect } from '@playwright/test'

const ADDRESS = '0x' + 'a1'.repeat(20)
const OTHER = '0x' + 'b2'.repeat(20)

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    return fetch('/api/__mock/reset', { method: 'POST' })
  })
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('ana@example.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  await page.goto('/wallets')
  await page.getByLabel('Apelido').fill('Principal')
  await page.getByLabel('Endereço').fill(ADDRESS)
  await page.getByRole('button', { name: 'Adicionar carteira' }).click()
  await expect(page.getByTestId('wallet-item')).toHaveCount(1)
})

test('edita apelido e endereço da carteira', async ({ page }) => {
  await page.getByRole('button', { name: 'Editar Principal' }).click()
  const item = page.getByTestId('wallet-item')
  await item.getByLabel('Apelido').fill('Renomeada')
  await item.getByLabel('Endereço').fill(OTHER)
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(item).toContainText('Renomeada')
  await expect(item).toContainText(OTHER)
})

test('mostra erros de validação associados aos campos', async ({ page }) => {
  await page.getByRole('button', { name: 'Editar Principal' }).click()
  const item = page.getByTestId('wallet-item')
  await item.getByLabel('Apelido').fill('')
  await item.getByLabel('Endereço').fill('0x123')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(item.getByLabel('Apelido')).toHaveAttribute('aria-invalid', 'true')
  await expect(item.getByLabel('Endereço')).toHaveAttribute('aria-describedby', /address-.*-error/)
  await expect(item).toContainText('Informe um apelido')
  await expect(item).toContainText('Endereço inválido')
})
