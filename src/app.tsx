import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Link, Outlet, RouterProvider, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { HomePage, validateCatalogSearch } from './catalog/HomePage'
import { NftDetailPage } from './catalog/NftDetailPage'
import { CartPage } from './purchase/CartPage'
import { CheckoutPage } from './purchase/CheckoutPage'
import { OrderPage } from './purchase/OrderPage'
import { AccountNav } from './account/session'
import { LoginPage, RegisterPage } from './account/AuthPages'
import { ProfilePage, WalletsPage } from './account/PrivatePages'
import { requireAuth } from './account/guard'
import { queryClient } from './queryClient'
import { RealtimeBridge } from './realtime/RealtimeBridge'

const rootRoute = createRootRoute({
  notFoundComponent: () => (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <Link to="/" className="underline">Voltar ao início</Link>
    </section>
  ),
  component: () => (
    <div className="max-w-5xl mx-auto p-4">
      <nav className="flex gap-4 mb-4">
        <Link to="/">Início</Link>
        <Link to="/cart">Carrinho</Link>
        <AccountNav />
      </nav>
      <RealtimeBridge />
      <main id="main"><Outlet /></main>
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
