import { http, HttpResponse } from 'msw'
import type { SocialProvider } from '../api'
import { signInSocialUser } from './account'

// Login com Google/Facebook SIMULADO na camada MSW (ENUNCIADO §3 sessão/autenticação; proíbe serviços reais).
// Nenhum client ID, token de provedor ou chamada externa: `credential` é opaca e nunca é validada nem armazenada.
export const SOCIAL_PROVIDERS: readonly SocialProvider[] = ['google', 'facebook']

// Usuários de fixture determinísticos por provedor (google reutiliza o demo do seed de conta).
const DEMO: Record<SocialProvider, { id: string; email: string; name: string }> = {
  google: { id: 'u-ana', email: 'ana@example.test', name: 'Ana Demo' },
  facebook: { id: 'u-carla', email: 'carla@example.test', name: 'Carla Demo' },
}

// Cenários forçáveis via POST /api/__mock/scenario { scenario }.
export const SOCIAL_SCENARIOS = ['social-provider-error', 'social-cancelled'] as const
export type SocialScenario = (typeof SOCIAL_SCENARIOS)[number]
let scenario: SocialScenario | 'default' = 'default'

export const isSocialScenario = (s: string): s is SocialScenario => (SOCIAL_SCENARIOS as readonly string[]).includes(s)
export function setSocialScenario(s: SocialScenario | 'default') {
  scenario = s
}
export function resetSocialAuth() {
  scenario = 'default'
}

const MESSAGES = {
  failure: 'Não foi possível entrar com o provedor. Tente novamente.',
  cancelled: 'Login cancelado. Nenhuma conta foi conectada.',
}

export const socialAuthHandlers = [
  http.post('/api/auth/social', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { provider?: unknown; credential?: unknown }
    if (typeof body.provider !== 'string' || !SOCIAL_PROVIDERS.includes(body.provider as SocialProvider))
      return HttpResponse.json({ code: 'INVALID_PROVIDER', message: 'Provedor inválido. Use google ou facebook.' }, { status: 400 })
    if (scenario === 'social-provider-error' || body.credential === 'mock:error')
      return HttpResponse.json({ code: 'PROVIDER_FAILURE', message: MESSAGES.failure }, { status: 401 })
    if (scenario === 'social-cancelled' || body.credential === 'mock:cancel')
      return HttpResponse.json({ code: 'PROVIDER_CANCELLED', message: MESSAGES.cancelled }, { status: 401 })
    return HttpResponse.json(await signInSocialUser(DEMO[body.provider as SocialProvider]))
  }),
]
