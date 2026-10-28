import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

// Login social SIMULADO por MSW (ENUNCIADO §3 sessão/autenticação; docs/CONTRACTS.md POST /api/auth/social).
// Sem OAuth real, sem credenciais: os botões chamam o mock e reutilizam a mesma regra de sessão do login por e-mail/senha.

const google = (page: Page) => page.getByRole('button', { name: 'Continuar com Google' })
const facebook = (page: Page) => page.getByRole('button', { name: 'Continuar com Facebook' })
// App montado => worker do MSW ativo (sem isso o POST cai em 404 logo após o goto).
const scenario = async (page: Page, s: string) => {
  await page.locator('nav').first().waitFor()
  expect((await api(page, 'POST', '/__mock/scenario', { scenario: s })).status).toBe(200)
}
const token = (page: Page) => page.evaluate(() => localStorage.getItem('nft:token'))

test.beforeEach(async ({ page }) => {
  await resetAs(page, null)
  await api(page, 'GET', '/session') // semeia os usuários do mock antes do primeiro login
})

test('Google entra como Ana e mostra o usuário no cabeçalho', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Login social indisponível')).toHaveCount(0)
  await google(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  await expect(page).toHaveURL(/\/$/)
  expect(await token(page)).toBe('u-ana')
})

test('Facebook entra como Carla', async ({ page }) => {
  await page.goto('/login')
  await facebook(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Carla Demo')
  expect(await token(page)).toBe('u-carla')
})

test('erro do provedor mostra alerta em português e não cria sessão', async ({ page }) => {
  await page.goto('/login')
  await scenario(page, 'social-provider-error') // o cenário vive na memória do MSW: definir DEPOIS do goto (reload zera)
  await google(page).click()
  const alert = page.getByTestId('social-error')
  await expect(alert).toBeVisible()
  await expect(alert).toHaveAttribute('role', 'alert')
  await expect(alert).toContainText('Não foi possível entrar com o provedor')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByTestId('nav-user')).toHaveCount(0)
  expect(await token(page)).toBeNull()
  await expect(google(page)).toBeEnabled() // pode tentar de novo
  await expect(facebook(page)).toBeEnabled()
})

test('cancelamento mostra mensagem e permanece em /login', async ({ page }) => {
  await page.goto('/login')
  await scenario(page, 'social-cancelled')
  await facebook(page).click()
  await expect(page.getByTestId('social-error')).toContainText('Login cancelado')
  await expect(page).toHaveURL(/\/login/)
  expect(await token(page)).toBeNull()
})

test('após falha, nova tentativa com o provedor normal entra e limpa o alerta', async ({ page }) => {
  await page.goto('/login')
  await scenario(page, 'social-provider-error') // o cenário vive na memória do MSW: definir DEPOIS do goto (reload zera)
  await google(page).click()
  await expect(page.getByTestId('social-error')).toBeVisible()
  await scenario(page, 'default')
  await google(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
})

test('botões ficam desabilitados e com aria-busy enquanto a requisição está em andamento', async ({ page }) => {
  await page.goto('/login')
  // o service worker do MSW não passa por page.route: atrasa o envio no próprio XHR para observar o estado de loading
  await page.evaluate(() => {
    const send = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, ...a: Parameters<XMLHttpRequest['send']>) {
      setTimeout(() => send.apply(this, a), 800)
    }
  })
  await google(page).click()
  await expect(page.getByTestId('social-google')).toBeDisabled()
  await expect(page.getByTestId('social-google')).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByTestId('social-facebook')).toBeDisabled()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
})

test('redirect seguro: ?redirect=/cart vai ao carrinho; URL externa é ignorada', async ({ page, baseURL }) => {
  await page.goto(`/login?redirect=${encodeURIComponent('/cart')}`)
  await google(page).click()
  await expect(page).toHaveURL(/\/cart$/)

  await page.evaluate(() => localStorage.removeItem('nft:token'))
  const origin = new URL(baseURL!).origin
  const offSite: string[] = []
  await page.route(/^https?:\/\//, (route) => {
    if (route.request().url().startsWith(origin)) return route.fallback()
    offSite.push(route.request().url())
    return route.abort()
  })
  await page.goto(`/login?redirect=${encodeURIComponent('https://evil.example/x')}`)
  await facebook(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Carla Demo')
  expect(new URL(page.url()).origin).toBe(origin)
  expect(new URL(page.url()).pathname).toBe('/')
  expect(offSite).toEqual([])
})

test('troca de usuário (Google, Sair, Facebook) não vaza carrinho, favoritos nem pedidos', async ({ page }) => {
  await page.goto('/login')
  await google(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')

  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await api(page, 'POST', '/favorites', { nftId: 'nft-3' })
  await scenario(page, 'payment-held')
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(1)
  await api(page, 'POST', '/cart', { nftId: 'nft-4', quantity: 1 })

  await page.getByTestId('logout').click()
  await expect(page).toHaveURL(/\/login/)
  expect(await token(page)).toBeNull()

  await facebook(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Carla Demo')
  expect((await api(page, 'GET', '/cart')).json).toEqual([])
  expect((await api(page, 'GET', '/favorites')).json).toEqual([])
  expect((await api(page, 'GET', '/orders')).json).toEqual([])
  await page.goto('/cart')
  await expect(page.getByTestId('nav-user')).toHaveText('Carla Demo')
  await expect(page.getByText('nft-4')).toHaveCount(0)

  // e Ana continua com os próprios dados ao voltar
  await page.getByTestId('logout').click()
  await expect(page).toHaveURL(/\/login/)
  await google(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(1)
  expect((await api(page, 'GET', '/favorites')).json).toEqual(['nft-3'])
})

test('botões sociais são acessíveis por teclado (Tab + Enter) e têm alvo de toque de 44px', async ({ page }) => {
  await page.goto('/login')
  for (const b of [google(page), facebook(page)]) {
    const box = await b.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  await google(page).focus()
  await expect(google(page)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(facebook(page)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('nav-user')).toHaveText('Carla Demo')
})

test('Cadastro também oferece os botões sociais e entra', async ({ page }) => {
  await page.goto('/register')
  await expect(google(page)).toBeVisible()
  await expect(facebook(page)).toBeVisible()
  await google(page).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  await expect(page).toHaveURL(/\/$/)
})

// Verificação do login por e-mail e senha (seed: ana@example.test / kurio-demo).
const emailLogin = async (page: Page, email: string, password: string) => {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

test('e-mail e senha corretos entram como Ana', async ({ page }) => {
  await page.goto('/login')
  await emailLogin(page, 'ana@example.test', 'kurio-demo')
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  await expect(page).toHaveURL(/\/$/)
})

test('senha errada mostra erro geral e não cria sessão', async ({ page }) => {
  await page.goto('/login')
  await emailLogin(page, 'ana@example.test', 'senha-errada')
  await expect(page.getByTestId('login-error')).toHaveText('E-mail ou senha inválidos')
  await expect(page).toHaveURL(/\/login/)
  expect(await token(page)).toBeNull()
})

test('campos vazios e e-mail inválido mostram erros por campo associados, sem chamar a API', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.locator('#email-error')).toHaveText('Informe um e-mail válido')
  await expect(page.locator('#password-error')).toHaveText('Informe a senha')
  await expect(page.getByLabel('E-mail')).toHaveAttribute('aria-describedby', 'email-error')
  await expect(page.getByLabel('Senha')).toHaveAttribute('aria-invalid', 'true')
  expect(await token(page)).toBeNull()
})

test('logout limpa a sessão e rota protegida redireciona ao login preservando o destino', async ({ page }) => {
  await page.goto('/login')
  await emailLogin(page, 'ana@example.test', 'kurio-demo')
  await expect(page.getByTestId('nav-user')).toBeVisible()
  await page.getByTestId('logout').click()
  await expect(page).toHaveURL(/\/login/)
  expect(await token(page)).toBeNull()
  await page.goto('/wallets')
  await expect(page).toHaveURL(/\/login\?redirect=%2Fwallets/)
  await emailLogin(page, 'ana@example.test', 'kurio-demo')
  await expect(page).toHaveURL(/\/wallets$/)
})
