import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS } from './helpers-extra'

// Smoke de interatividade: nenhum botão/link visível e habilitado pode ficar sem efeito observável, e nenhum link usa href="#".
// "Efeito" = mudança de URL, DOM, estado local (localStorage), rolagem, foco, diálogo, request /api ou nova aba.
// Controles que já estão no estado pedido (aria-pressed="true", aria-current) e links para a própria rota são idempotentes por definição.

const ACTIONABLE = 'button:not(:disabled):not([aria-disabled="true"]), a[href]'

// `chrome`: testa também cabeçalho/rodapé (repetidos em todas as rotas, então só em algumas).
const ROUTES: { name: string; path: string; ana: boolean; viewports: number[]; chrome?: boolean }[] = [
  { name: 'início', path: '/', ana: false, viewports: [1440, 390], chrome: true },
  { name: 'início logado', path: '/', ana: true, viewports: [1440] },
  { name: 'detalhe', path: '/nfts/nft-1', ana: true, viewports: [1440, 390] },
  { name: 'carrinho', path: '/cart', ana: true, viewports: [1440, 390], chrome: true },
  { name: 'pagamento', path: '/checkout', ana: true, viewports: [1440] },
  { name: 'login', path: '/login', ana: false, viewports: [1440, 390], chrome: true },
  { name: 'cadastro', path: '/register', ana: false, viewports: [1440] },
  { name: 'perfil', path: '/profile', ana: true, viewports: [1440] },
  { name: 'carteiras', path: '/wallets', ana: true, viewports: [1440] },
  { name: 'criadores', path: '/criadores', ana: true, viewports: [1440] },
  { name: 'aprenda', path: '/aprenda', ana: true, viewports: [1440] },
  { name: 'artigo', path: '/aprenda/como-funciona-a-propriedade-de-nfts', ana: true, viewports: [1440] },
  { name: '404', path: '/rota-inexistente', ana: true, viewports: [1440] },
]

const SIGNATURE = () => {
  const h = (s: string) => {
    let x = 5381
    for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0
    return x
  }
  const a = document.activeElement
  return {
    url: location.href,
    html: document.body.innerHTML.length + ':' + h(document.body.innerHTML),
    ls: h(JSON.stringify(localStorage)),
    scroll: Math.round(scrollY),
    dialog: !!document.querySelector('[role=dialog],[role=alertdialog]'),
    focus: a && a !== document.body ? `${a.tagName}|${a.id}|${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30)}` : '',
  }
}

async function prepare(page: Page, ana: boolean, path: string) {
  await resetAs(page, ana ? 'u-ana' : null)
  if (ana) {
    await api(page, 'GET', '/session') // semeia os usuários do mock
    await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
    await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  }
  return page.evaluate(() => Object.fromEntries(Object.entries(localStorage))).then(async (snap) => {
    const load = async () => {
      await page.evaluate((s) => {
        localStorage.clear()
        for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v)
      }, snap)
      await page.goto(path)
      await page.locator('nav').first().waitFor()
      await page.waitForLoadState('networkidle')
    }
    return load
  })
}

for (const r of ROUTES) {
  for (const width of r.viewports) {
    test(`${r.name} (${width}px): todo botão/link visível e habilitado tem efeito; sem href="#"`, async ({ page, context }) => {
      test.setTimeout(240_000)
      await page.setViewportSize({ width, height: width < 800 ? 844 : 900 })
      // Verificação de mutação do próprio teste: QA_MUTATE=1 injeta um botão morto, e o spec tem de reprovar.
      if (process.env.QA_MUTATE) await page.addInitScript(() => window.addEventListener('load', () => setTimeout(() => document.body.insertAdjacentHTML('beforeend', '<button>BOTAO-MORTO</button>'), 300)))
      await page.emulateMedia({ reducedMotion: 'reduce' }) // o carrossel automático não pode mascarar "sem efeito"
      await context.route(/^https?:\/\/(?!localhost)/, (route) => route.abort()) // links externos não saem da máquina
      const load = await prepare(page, r.ana, r.path)
      await load()

      const apiRequests: string[] = []
      const popups: string[] = []
      page.on('request', (req) => {
        if (/\/api\//.test(req.url()) && !/__mock/.test(req.url())) apiRequests.push(req.url())
      })
      context.on('page', (p) => {
        if (p !== page) {
          popups.push(p.url())
          void p.close()
        }
      })
      page.on('dialog', (d) => void d.dismiss())

      // 1) nenhum link vazio / "#"
      const badLinks = await page.evaluate(() =>
        [...document.querySelectorAll('a')].filter((a) => !a.getAttribute('href') || a.getAttribute('href') === '#').map((a) => (a.textContent ?? '').trim().slice(0, 40)),
      )
      expect(badLinks, 'links sem href real').toEqual([])

      // 1b) links externos: não são clicados (abrir abas durante o trace quebra o artefato do Playwright); exige-se https e rel seguro
      const badExternal = await page.evaluate(() =>
        [...document.querySelectorAll('a[href^="http"]')]
          .filter((a) => new URL((a as HTMLAnchorElement).href).origin !== location.origin)
          .filter((a) => !/^https:/.test((a as HTMLAnchorElement).href) || (a.getAttribute('target') === '_blank' && !/noopener/.test(a.getAttribute('rel') ?? '')))
          .map((a) => a.getAttribute('href')),
      )
      expect(badExternal, 'links externos sem https ou sem rel="noopener" em target=_blank').toEqual([])

      // 2) inventário dos acionáveis visíveis (chave + ordinal para reencontrar após recarregar)
      const items = await page.evaluate(([sel, withChrome]) => {
        const keyOf = (e: Element) =>
          [e.tagName, e.getAttribute('href'), e.getAttribute('data-testid'), e.id, (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)].join('|')
        const counts: Record<string, number> = {}
        const out: { key: string; ord: number; label: string; idempotent: boolean }[] = []
        for (const e of document.querySelectorAll(sel)) {
          const key = keyOf(e)
          const ord = (counts[key] = (counts[key] ?? -1) + 1)
          const b = e.getBoundingClientRect()
          const cs = getComputedStyle(e)
          if (!withChrome && e.closest('header, footer')) continue
          if (b.width <= 2 || b.height <= 2 || cs.visibility === 'hidden' || cs.display === 'none' || e.closest('[aria-hidden="true"],[hidden]')) continue
          const href = e.getAttribute('href')
          const own = e.tagName === 'A' && !!href && !href.includes('#') && new URL(href, location.href).pathname === location.pathname && !new URL(href, location.href).search
          const external = e.tagName === 'A' && !!href && /^https?:/.test(href) && new URL(href, location.href).origin !== location.origin
          const active = external || e.getAttribute('aria-pressed') === 'true' || !!e.getAttribute('aria-current')
          out.push({ key, ord, label: key.split('|').slice(1).join(' | '), idempotent: own || active })
        }
        return out
      }, [ACTIONABLE, !!r.chrome] as const)
      if (process.env.QA_DEBUG) console.log('ITEMS', items.map((i) => i.label).join(' ; '))
      expect(items.length, 'a rota não expõe nenhum controle').toBeGreaterThan(0)

      // 3) aciona cada um numa página recarregada e exige efeito
      const noEffect: string[] = []
      for (const it of items) {
        if (it.idempotent) continue
        await load()
        const handle = await page.evaluateHandle(
          ([sel, key, ord]) => {
            const keyOf = (e: Element) =>
              [e.tagName, e.getAttribute('href'), e.getAttribute('data-testid'), e.id, (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)].join('|')
            return [...document.querySelectorAll(sel as string)].filter((e) => keyOf(e) === key)[ord as number] as HTMLElement
          },
          [ACTIONABLE, it.key, it.ord] as const,
        )
        const el = handle.asElement()
        if (!el) {
          noEffect.push(`${it.label} (não reaparece após recarregar)`)
          continue
        }
        await el.scrollIntoViewIfNeeded().catch(() => {}) // a rolagem do próprio clique não conta como efeito
        await page.waitForTimeout(400) // deixa o DOM assentar: a assinatura "antes" não pode pegar render tardio
        const before = await page.evaluate(SIGNATURE)
        apiRequests.length = 0
        popups.length = 0
        const selfFocus = await el.evaluate((e) => `${e.tagName}|${e.id}|${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}`)
        try {
          await el.click({ timeout: 4000 })
        } catch (e) {
          noEffect.push(`${it.label} (não clicável: ${String((e as Error).message).split('\n')[0].slice(0, 80)})`)
          continue
        }
        await page.waitForTimeout(450)
        const after = await page.evaluate(SIGNATURE).catch(() => ({ ...before, url: 'navegou' }))
        const changed =
          after.url !== before.url || after.html !== before.html || after.ls !== before.ls || after.scroll !== before.scroll ||
          after.dialog !== before.dialog || (!!after.focus && after.focus !== before.focus && after.focus !== selfFocus) ||
          apiRequests.length > 0 || popups.length > 0
        if (process.env.QA_DEBUG && /MORTO/.test(it.label)) console.log('DBG', JSON.stringify({ before, after, selfFocus, apiRequests, popups }))
        if (!changed) noEffect.push(it.label)
      }
      expect(noEffect, 'controles visíveis e habilitados sem efeito observável').toEqual([])
    })
  }
}
