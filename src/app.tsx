import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Link, Outlet, RouterProvider, createRootRoute, createRoute, createRouter, useRouterState } from '@tanstack/react-router'
import { HomePage, validateCatalogSearch } from './catalog/HomePage'
import { NftDetailPage } from './catalog/NftDetailPage'
import { CartPage } from './purchase/CartPage'
import { CheckoutPage } from './purchase/CheckoutPage'
import { OrderPage } from './purchase/OrderPage'
import { AccountNav, navActive, navLink } from './account/session'
import { buttonVariants } from './components/ui/button'
import { CartIcon, HomeIcon, LogoMark } from './components/icons'
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
      <CartIcon className="size-5" />
      <span className="sr-only sm:not-sr-only">Carrinho</span>
      {count > 0 && (
        <span data-testid="cart-count" className="num inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold leading-5 text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 rounded-control py-1 font-bold tracking-tight text-foreground no-underline">
          <LogoMark />
          <span className="text-lg">NFT <span className="bg-linear-to-r from-primary to-primary-2 bg-clip-text text-transparent">Marketplace</span></span>
        </Link>
        <nav aria-label="Principal" className="flex w-full flex-wrap items-center justify-between gap-1 sm:w-auto sm:justify-end">
          <Link to="/" className={navLink} activeOptions={{ exact: true }} activeProps={navActive}>
            <HomeIcon className="size-5" />
            <span className="sr-only sm:not-sr-only">Início</span>
          </Link>
          <CartLink />
          <AccountNav />
        </nav>
      </div>
    </header>
  )
}

const rootRoute = createRootRoute({
  notFoundComponent: () => (
    <section className="card mx-auto max-w-lg space-y-4 p-8 text-center">
      <p aria-hidden="true" className="bg-linear-to-r from-primary to-primary-2 bg-clip-text text-6xl font-extrabold text-transparent">404</p>
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
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8"><Outlet /></main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>NFT Marketplace · ambiente de demonstração</p>
      </footer>
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
const accountRoutes = [loginRoute, registerRoute, profileRoute, walletsRoute]
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, nftRoute, cartRoute, ...purchaseRoutes, ...accountRoutes]) })
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
