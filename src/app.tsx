import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Link, Outlet, RouterProvider, createRootRoute, createRoute, createRouter, useRouterState } from '@tanstack/react-router'
import { HomePage, validateCatalogSearch } from './catalog/HomePage'
import { NftDetailPage } from './catalog/NftDetailPage'
import { CartPage } from './purchase/CartPage'
import { CheckoutPage } from './purchase/CheckoutPage'
import { OrderPage } from './purchase/OrderPage'
import { CreatorsPage } from './creators/CreatorsPage'
import { ArticlePage, LearnPage } from './learn/LearnPages'
import { postBySlug } from './learn/posts'
import { AccountNav, navActive, navLink } from './account/session'
import { buttonVariants } from './components/ui/button'
import { CartIcon, SearchIcon } from './components/icons'
import { SiteFooter } from './components/SiteFooter'
import { cn } from './lib/utils'
import { useCart } from './purchase/queries'
import { LoginPage, RegisterPage } from './account/AuthPages'
import { ProfilePage, WalletsPage } from './account/PrivatePages'
import { requireAuth } from './account/guard'
import { queryClient } from './queryClient'
import { RealtimeBridge } from './realtime/RealtimeBridge'


const SITE = 'NFT Marketplace'
const routeTitle = (path: string) => {
  if (path === '/') return 'Catálogo'
  if (path.startsWith('/nfts/')) return 'Detalhe do NFT'
  if (path === '/cart') return 'Carrinho'
  if (path === '/checkout') return 'Pagamento'
  if (path.startsWith('/orders/')) return 'Pedido'
  if (path === '/login') return 'Entrar'
  if (path === '/register') return 'Cadastro'
  if (path === '/profile') return 'Perfil'
  if (path === '/wallets') return 'Carteiras'
  if (path === '/criadores') return 'Criadores'
  if (path === '/aprenda') return 'Aprenda'
  if (path.startsWith('/aprenda/')) return postBySlug(path.slice('/aprenda/'.length))?.title ?? 'Artigo não encontrado'
  return 'Página não encontrada'
}

// Título por rota e foco no conteúdo ao navegar (não na carga inicial, para não roubar o foco da página).
function RouteA11y() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const first = useRef(true)
  useEffect(() => {
    document.title = `${routeTitle(path)} - ${SITE}`
    if (first.current) {
      first.current = false
      return
    }
    document.getElementById('main')?.focus()
  }, [path])
  return null
}

function CartLink() {
  const { data } = useCart()
  const count = data?.reduce((n, i) => n + i.quantity, 0) ?? 0
  return (
    <Link to="/cart" className={`${navLink} relative`} activeProps={navActive}>
      <CartIcon className="size-6" />
      <span className="sr-only">Carrinho</span>
      {count > 0 && (
        <span data-testid="cart-count" className="num -ml-3 -mt-4 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  )
}

// Itens do menu central do Figma. "Início" e "Mercado" apontam para o catálogo (`/`); "Criadores" (/criadores,
// derivada de /api/nfts) e "Aprenda" (/aprenda, conteúdo estático) têm rota própria.
const centerItem = 'inline-flex h-9 items-center border-b-2 border-transparent px-0.5 text-sm font-medium text-foreground no-underline transition-colors hover:text-primary md:h-full'
const centerActive = 'border-primary text-primary'

function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const inMarket = path.startsWith('/nfts/') || path === '/cart' || path === '/checkout' || path.startsWith('/orders/')
  const inOther = path === '/criadores' || path.startsWith('/aprenda')
  const inHome = !inMarket && !inOther
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1248px] px-4 sm:px-6">
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-3 border-b border-border md:grid md:h-[68px] md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <Link to="/" className="order-1 inline-flex h-10 items-center self-center text-sm font-bold uppercase tracking-[0.12em] text-foreground no-underline md:h-auto">
            Kurio
          </Link>
          <ul className="order-3 flex w-full flex-wrap items-stretch justify-between gap-x-3 pb-1 md:order-2 md:w-auto md:justify-center md:gap-10 md:pb-0">
            <li className="flex"><Link to="/" className={cn(centerItem, inHome && centerActive)} aria-current={path === '/' ? 'page' : undefined}>Início</Link></li>
            <li className="flex"><Link to="/" hash="catalogo" className={cn(centerItem, inMarket && centerActive)}>Mercado</Link></li>
            <li className="flex"><Link to="/criadores" className={centerItem} activeProps={{ className: centerActive, 'aria-current': 'page' }}>Criadores</Link></li>
            <li className="flex"><Link to="/aprenda" className={centerItem} activeProps={{ className: centerActive, 'aria-current': 'page' }}>Aprenda</Link></li>
          </ul>
          <div className="order-2 ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1 self-center md:order-3 md:justify-self-end">
            <Link to="/" hash="busca" aria-label="Ir para a busca" onClick={() => window.setTimeout(() => document.getElementById('busca')?.focus(), 200)} className={navLink}>
              <SearchIcon className="size-6" />
            </Link>
            <CartLink />
            <AccountNav />
          </div>
        </nav>
      </div>
    </header>
  )
}

const rootRoute = createRootRoute({
  notFoundComponent: () => (
    <section className="card mx-auto max-w-lg space-y-4 border-b-8 border-primary p-8 text-center">
      <p aria-hidden="true" className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço acessado não existe.</p>
      <Link to="/" className={buttonVariants({})}>Voltar ao início</Link>
    </section>
  ),
  component: () => (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lift">Ir para o conteúdo</a>
      <RouteA11y />
      <SiteHeader />
      <RealtimeBridge />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1248px] flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8"><Outlet /></main>
      <SiteFooter />
    </div>
  ),
})
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  validateSearch: validateCatalogSearch,
})
const nftRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nfts/$id', component: NftDetailPage })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: CartPage })
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: CheckoutPage, beforeLoad: requireAuth })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orders/$id', component: OrderPage, beforeLoad: requireAuth })
const purchaseRoutes = [checkoutRoute, orderRoute]
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>): { redirect?: string; expired?: boolean | string } => ({
    redirect: typeof s.redirect === 'string' && s.redirect ? s.redirect : undefined,
    expired: s.expired === true || s.expired === 'true' ? true : undefined,
  }),
})
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage, beforeLoad: requireAuth })
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', component: WalletsPage, beforeLoad: requireAuth })
const creatorsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/criadores', component: CreatorsPage })
const learnRoute = createRoute({ getParentRoute: () => rootRoute, path: '/aprenda', component: LearnPage })
const articleRoute = createRoute({ getParentRoute: () => rootRoute, path: '/aprenda/$slug', component: ArticlePage })
const accountRoutes = [loginRoute, registerRoute, profileRoute, walletsRoute]
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, nftRoute, cartRoute, ...purchaseRoutes, creatorsRoute, learnRoute, articleRoute, ...accountRoutes]) })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


export function mountApp(el: HTMLElement) {
  createRoot(el).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
