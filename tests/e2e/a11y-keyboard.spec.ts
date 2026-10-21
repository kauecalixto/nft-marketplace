import { test, expect } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

test.beforeEach(async ({ page }) => {
  await resetAs(page)
})

test('Tab alcança a navegação e os controles principais com foco visível', async ({ page }) => {
  await page.goto('/')
  await page.locator('nav').first().waitFor()
  const seen: string[] = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement
      const cs = getComputedStyle(e)
      return {
        tag: e.tagName,
        text: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30),
        inNav: !!e.closest('nav'),
        inMain: !!e.closest('main'),
        outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
        shadow: cs.boxShadow !== 'none',
      }
    })
    seen.push(`${info.inNav ? 'nav' : info.inMain ? 'main' : 'other'}:${info.text}`)
    expect(info.outline || info.shadow, `foco visível em ${info.tag} ${info.text}`).toBe(true)
  }
  expect(seen.some((s) => s.startsWith('nav:Início'))).toBe(true)
  expect(seen.some((s) => s.startsWith('nav:Carrinho'))).toBe(true)
  expect(seen.some((s) => s.startsWith('main:'))).toBe(true)
})

test('login: labels e erros associados por aria-describedby', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Entrar' }).click()
  for (const [label, id] of [['E-mail', 'email'], ['Senha', 'password']] as const) {
    const input = page.getByLabel(label)
    await expect(input).toHaveAttribute('aria-describedby', `${id}-error`)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator(`#${id}-error`)).toHaveAttribute('role', 'alert')
  }
})

test('cadastro: mensagens de validação por campo', async ({ page }) => {
  await page.goto('/register')
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  for (const id of ['name', 'email', 'password']) {
    await expect(page.locator(`#${id}-error`)).toBeVisible()
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-describedby', `${id}-error`)
  }
})

test('perfil, senha e carteiras: validação com mensagens associadas', async ({ page }) => {
  await page.goto('/profile')
  await page.getByLabel('Nome').fill('')
  await page.getByRole('button', { name: /salvar/i }).first().click()
  await expect(page.locator('#name-error')).toBeVisible()
  await expect(page.getByLabel('Nome')).toHaveAttribute('aria-describedby', 'name-error')
  await page.getByLabel('Nova senha').fill('x')
  await page.getByRole('button', { name: /alterar senha/i }).click()
  await expect(page.locator('#newPassword-error')).toBeVisible()
  await page.goto('/wallets')
  await page.getByLabel('Endereço').fill('0x123')
  await page.getByRole('button', { name: /adicionar|cadastrar|salvar/i }).first().click()
  await expect(page.locator('#label-error')).toBeVisible()
  await expect(page.locator('#address-error')).toBeVisible()
  await expect(page.getByLabel('Endereço')).toHaveAttribute('aria-describedby', 'address-error')
})

test('diálogo de revisão prende o foco, Esc fecha e devolve o foco ao gatilho', async ({ page }) => {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await fillCheckout(page)
  const trigger = page.getByTestId('review-order')
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByTestId('review-dialog')
  await expect(dialog).toBeVisible()
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press(key)
      expect(await page.evaluate(() => !!document.activeElement?.closest('[data-testid="review-dialog"]'))).toBe(true)
    }
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
