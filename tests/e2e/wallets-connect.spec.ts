import { test, expect } from '@playwright/test'
import { api, resetAs, ADDRESS } from './helpers-extra'

// Carteiras: conectar/desconectar/trocar a principal funcionam na própria página (regra "todo controle funciona").
test.beforeEach(async ({ page }) => {
  await resetAs(page)
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/wallets', { label: 'Reserva', address: '0x2222222222222222222222222222222222222222' })
})

test('desconectar e reconectar uma carteira atualiza o status e o servidor', async ({ page }) => {
  await page.goto('/wallets')
  const row = page.getByTestId('wallet-item').filter({ hasText: 'Reserva' })
  await expect(row.getByTestId('wallet-connection')).toHaveText('Conectada')
  await row.getByRole('button', { name: 'Desconectar Reserva' }).click()
  await expect(row.getByTestId('wallet-connection')).toHaveText('Desconectada')
  expect(((await api(page, 'GET', '/wallets')).json as { label: string; connected: boolean }[]).find((w) => w.label === 'Reserva')!.connected).toBe(false)
  await row.getByRole('button', { name: 'Conectar Reserva' }).click()
  await expect(row.getByTestId('wallet-connection')).toHaveText('Conectada')
})

test('carteira que recusa a conexão mostra alerta e continua desconectada', async ({ page }) => {
  await page.goto('/wallets')
  const row = page.getByTestId('wallet-item').filter({ hasText: 'Reserva' })
  await row.getByRole('button', { name: 'Desconectar Reserva' }).click()
  await expect(row.getByTestId('wallet-connection')).toHaveText('Desconectada')
  expect((await api(page, 'POST', '/__mock/scenario', { scenario: 'wallet-rejected' })).status).toBe(200)
  await row.getByRole('button', { name: 'Conectar Reserva' }).click()
  await expect(row.getByTestId('wallet-connect-error')).toHaveText('A carteira recusou a conexão')
  await expect(row.getByTestId('wallet-connection')).toHaveText('Desconectada')
})

test('"Tornar principal" troca a carteira principal', async ({ page }) => {
  await page.goto('/wallets')
  const row = page.getByTestId('wallet-item').filter({ hasText: 'Reserva' })
  await row.getByRole('button', { name: 'Tornar principal' }).click()
  await expect(row).toContainText('(principal)')
  await expect(page.getByTestId('wallet-item').filter({ hasText: 'Principal' }).first()).toContainText('(secundária)')
})
