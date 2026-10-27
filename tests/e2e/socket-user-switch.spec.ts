import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

// Troca de usuário na MESMA aba (sem reload) com o Socket.IO ativo: a identidade da subscription no
// servidor tem de acompanhar o token, e eventos privados de um usuário não podem alcançar o outro.

interface SocketClient { id: number; userId: string | null }
const socketClients = (page: Page) =>
  page.evaluate(async () => ((await (await fetch('/api/__mock/socket/clients')).json()) as { clients: SocketClient[] }).clients)
const subscribedUsers = async (page: Page) => (await socketClients(page)).map((c) => c.userId)
const post = (page: Page, url: string) => page.evaluate(async (u) => (await fetch(u, { method: 'POST' })).status, url)

async function loginAs(page: Page, email: string, password: string) {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

async function submitHeldOrderAsAna(page: Page) {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-held' })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  return new URL(page.url()).pathname.split('/').pop()!
}

test.beforeEach(async ({ page }) => {
  await resetAs(page)
  // O mock só semeia os usuários na 1ª chamada REST de conta; o `subscribe` do socket não semeia (resolveUser usa leitura síncrona).
  // Semeamos antes de recarregar para isolar a troca de usuário desse artefato de partida a frio.
  await api(page, 'GET', '/session')
})

test('logout zera o userId da subscription e o login de outro usuário o troca, sem reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  await expect.poll(() => subscribedUsers(page)).toEqual(['u-ana'])
  await page.evaluate(() => ((window as unknown as { __sameDocument: boolean }).__sameDocument = true)) // some em reload

  await page.getByTestId('logout').click()
  await expect(page).toHaveURL(/\/login/)
  await expect.poll(() => subscribedUsers(page), { message: 'após logout o servidor não pode manter userId de ana' }).toEqual([null])

  await loginAs(page, 'bruno@example.test', 'bruno-demo')
  await expect(page.getByTestId('nav-user')).toHaveText('Bruno Demo')
  await expect.poll(() => subscribedUsers(page), { message: 'após login o userId deve ser o de bruno' }).toEqual(['u-bruno'])
  expect(await page.evaluate(() => (window as unknown as { __sameDocument?: boolean }).__sameDocument)).toBe(true)
})

test('order.updated de ana não afeta bruno logado na mesma aba', async ({ page }) => {
  const id = await submitHeldOrderAsAna(page)
  await expect.poll(() => subscribedUsers(page)).toEqual(['u-ana'])

  await page.getByTestId('logout').click()
  await expect(page).toHaveURL(/\/login/)
  await loginAs(page, 'bruno@example.test', 'bruno-demo')
  await expect(page.getByTestId('nav-user')).toHaveText('Bruno Demo')
  await expect.poll(() => subscribedUsers(page)).toEqual(['u-bruno'])

  // bruno abre (navegação do cliente, sem reload) a URL do pedido de ana: 403 -> "não encontrado"
  await page.evaluate((p) => {
    history.pushState({}, '', p)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, `/orders/${id}`)
  await expect(page.getByTestId('order-not-found')).toBeVisible()

  const refetches: string[] = []
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/orders')) refetches.push(r.url())
  })
  expect(await post(page, `/api/__mock/orders/${id}/confirm`)).toBeLessThan(300)
  await page.waitForTimeout(1000) // janela para um evento indevido chegar e disparar refetch

  expect(refetches, 'o evento de ana não pode invalidar queries de bruno').toEqual([])
  await expect(page.getByTestId('order-not-found')).toBeVisible()
  await expect(page.getByTestId('order-confirmed')).toHaveCount(0)
  expect(await subscribedUsers(page)).toEqual(['u-bruno'])
  expect((await api(page, 'GET', '/orders')).json).toEqual([]) // bruno não enxerga pedidos de ana
})
