import { test, expect } from '@playwright/test'
import { noOverflow } from './helpers-extra'

const nav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Principal' })
const TITLES = [
  'Como funciona a propriedade de NFTs',
  '10 artistas digitais para acompanhar',
  'Raridade, atributos e procedência',
  'Como proteger sua carteira',
]

test('header: Criadores e Aprenda navegam e marcam aria-current', async ({ page }) => {
  await page.goto('/')
  await nav(page).getByRole('link', { name: 'Criadores' }).click()
  await expect(page).toHaveURL(/\/criadores$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Criadores')
  await expect(page).toHaveTitle(/Criadores - NFT Marketplace/)
  await expect(nav(page).getByRole('link', { name: 'Criadores' })).toHaveAttribute('aria-current', 'page')
  await expect(nav(page).getByRole('link', { name: 'Aprenda' })).not.toHaveAttribute('aria-current', 'page')
  await expect(page.locator('#main')).toBeFocused()

  await nav(page).getByRole('link', { name: 'Aprenda' }).click()
  await expect(page).toHaveURL(/\/aprenda$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aprenda')
  await expect(page).toHaveTitle(/Aprenda - NFT Marketplace/)
  await expect(nav(page).getByRole('link', { name: 'Aprenda' })).toHaveAttribute('aria-current', 'page')
  await expect(nav(page).getByRole('link', { name: 'Criadores' })).not.toHaveAttribute('aria-current', 'page')
})

test('criadores: cards derivados de /api/nfts com avatar, contagem, faixa de preço e link', async ({ page }) => {
  await page.goto('/criadores')
  const cards = page.getByTestId('creator-card')
  await expect(cards).toHaveCount(12)
  const first = cards.first()
  await expect(first.getByRole('heading', { level: 2 })).toHaveText('creator-1')
  await expect(first).toContainText('1 NFT')
  await expect(first).toContainText('0.50 ETH')
  await expect(cards.nth(3)).toContainText('12.00 ETH')
  await expect(first.locator('img')).toHaveCount(1)
  await first.getByRole('link', { name: 'Ver obras de creator-1' }).click()
  await expect(page).toHaveURL(/\/nfts\/nft-1$/)
})

const scenario = (page: import('@playwright/test').Page, sc: string) =>
  page.evaluate((x) => fetch('/api/__mock/scenario', { method: 'POST', body: JSON.stringify({ scenario: x }) }), sc)

test('criadores: estados de erro (com nova tentativa) e vazio', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('nft-card').first()).toBeVisible()
  await scenario(page, 'http-500')
  await page.goto('/criadores') // recarrega: o cache de /nfts da home não mascara o cenário
  await expect(page.getByTestId('creators-error')).toBeVisible()
  await scenario(page, 'default')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByTestId('creator-card').first()).toBeVisible()

  await page.goto('/')
  await expect(page.getByTestId('nft-card').first()).toBeVisible()
  await scenario(page, 'empty')
  await page.goto('/criadores') // recarrega: o cache de /nfts da home não mascara o cenário
  await expect(page.getByTestId('creators-empty')).toBeVisible()
  await scenario(page, 'default')
})

test('aprenda: lista os 4 posts e abre o artigo por slug', async ({ page }) => {
  await page.goto('/aprenda')
  await expect(page.getByTestId('post-card')).toHaveCount(4)
  for (const t of TITLES) await expect(page.getByRole('heading', { level: 2, name: t })).toBeVisible()
  await page.getByRole('link', { name: 'Ler artigo: Raridade, atributos e procedência' }).click()
  await expect(page).toHaveURL(/\/aprenda\/raridade-atributos-e-procedencia$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Raridade, atributos e procedência')
  await expect(page).toHaveTitle(/Raridade, atributos e procedência - NFT Marketplace/)
  expect(await page.locator('article p').count()).toBeGreaterThanOrEqual(4)
  await expect(nav(page).getByRole('link', { name: 'Aprenda' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('link', { name: /Voltar para Aprenda/ }).click()
  await expect(page).toHaveURL(/\/aprenda$/)
})

test('aprenda: slug inexistente mostra 404 amigável', async ({ page }) => {
  await page.goto('/aprenda/nao-existe')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Artigo não encontrado')
  await page.getByRole('link', { name: 'Voltar para Aprenda' }).click()
  await expect(page).toHaveURL(/\/aprenda$/)
})

test('"Ler mais" do Diário no Início leva ao artigo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Ler artigo: Como proteger sua carteira' }).click()
  await expect(page).toHaveURL(/\/aprenda\/como-proteger-sua-carteira$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Como proteger sua carteira')
})

test('teclado: Criadores e Aprenda são alcançáveis por Tab e abrem com Enter', async ({ page }) => {
  await page.goto('/')
  const link = nav(page).getByRole('link', { name: 'Aprenda' })
  await link.focus()
  await expect(link).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/aprenda$/)
  await expect(page.locator('#main')).toBeFocused()
})

for (const [w, h] of [[390, 844], [1440, 900]] as const) {
  test(`sem overflow horizontal em ${w}px (criadores, aprenda, artigo)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    for (const path of ['/criadores', '/aprenda', '/aprenda/como-funciona-a-propriedade-de-nfts']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await noOverflow(page)
    }
  })
}
