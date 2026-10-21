import { redirect } from '@tanstack/react-router'
import { getToken } from '../api'
import { queryClient } from '../queryClient'
import { sessionQuery } from './session'

/** beforeLoad das rotas privadas: sem sessão válida, vai ao login preservando o destino. */
export async function requireAuth({ location }: { location: { href: string } }) {
  const toLogin = () => redirect({ to: '/login', search: { redirect: location.href } })
  if (!getToken()) throw toLogin()
  try {
    await queryClient.ensureQueryData(sessionQuery)
  } catch {
    throw toLogin()
  }
}
