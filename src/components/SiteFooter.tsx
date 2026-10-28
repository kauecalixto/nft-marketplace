import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { COLLECTIONS } from '../catalog/taxonomy'

/**
 * Rodapé do Figma (faixa de benefícios + newsletter, faixa de contatos e 4 colunas). Todo link leva a algo real:
 * perfil, carteiras, Criadores, Aprenda (artigos de ajuda), Coleções (filtram o catálogo) e redes sociais (página
 * inicial oficial de cada rede, em nova aba). Itens do Figma sem destino real (Minha coleção, Atividade, Lista de
 * interesse, Política do mercado, Denunciar item) foram removidos (ver docs/qa/known-gaps.md). A newsletter valida
 * o e-mail e confirma localmente: nada é enviado nem armazenado. Os títulos das colunas não são `heading`
 * (evita poluir a hierarquia de títulos).
 */
const BENEFITS = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
]
const SOCIAL = [
  { s: 'f', name: 'Facebook', href: 'https://www.facebook.com/' },
  { s: 'ig', name: 'Instagram', href: 'https://www.instagram.com/' },
  { s: 'x', name: 'X', href: 'https://x.com/' },
  { s: 'in', name: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { s: 'yt', name: 'YouTube', href: 'https://www.youtube.com/' },
]
const linkCls = 'text-foreground no-underline hover:text-primary hover:underline'
const EMAIL = /^[^s@]+@[^s@]+.[^s@]+$/

function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'ok'>('idle')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) return setState('error')
    setState('ok')
    setEmail('')
  }
  return (
    <>
      <form onSubmit={submit} noValidate aria-label="Newsletter" className="flex">
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState('idle') }} aria-label="Assinar newsletter" aria-invalid={state === 'error' || undefined} aria-describedby="newsletter-msg" placeholder="digite seu e-mail..." className="h-10 min-w-0 flex-1 rounded-l-control bg-band px-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <button type="submit" className="h-10 rounded-r-control bg-primary px-4 text-base font-bold text-primary-foreground hover:brightness-110">Enviar</button>
      </form>
      <div id="newsletter-msg">
        {state === 'error' && <p role="alert" className="mt-2 text-sm font-medium text-destructive">Informe um e-mail válido (ex.: nome@exemplo.com)</p>}
        {state === 'ok' && <p role="status" className="mt-2 text-sm font-medium text-success">Inscrição simulada: confirmamos o e-mail, mas nada foi enviado nem armazenado nesta demonstração.</p>}
      </div>
    </>
  )
}

const colTitle = 'mb-2 text-base font-bold text-foreground'

export function SiteFooter() {
  return (
    <footer className="mt-12 pb-6">
      <div className="mx-auto max-w-[1248px] px-4 sm:px-6">
        <div className="bg-surface">
          <div className="grid gap-y-6 px-4 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-[repeat(3,1fr)_1.15fr]">
            {BENEFITS.map((b) => (
              <div key={b.letter} className="flex min-w-0 gap-4 sm:flex-col sm:gap-3 sm:border-r sm:border-primary/70 sm:px-6 sm:first:pl-0">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground sm:size-[74px] sm:text-2xl">{b.letter}</span>
                <div className="min-w-0 space-y-2 sm:space-y-3">
                  <p className="text-base font-bold text-foreground">{b.title}</p>
                  <p className="text-sm leading-[22px] text-muted-foreground">{b.text}</p>
                </div>
              </div>
            ))}
            <div className="min-w-0 sm:px-6">
              <p className="mb-3 text-base font-bold leading-4 text-foreground">Antecipe-se ao próximo lançamento</p>
              <Newsletter />
              <p className="mt-3 text-sm leading-[22px] text-muted-foreground">Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-2 bg-band px-4 py-5 text-sm sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            <p className="font-bold uppercase tracking-[0.12em]">Kurio</p>
            <p>Feito para colecionadores, criadores e cultura</p>
            <p>contato@email.com</p>
            <p>+55 11 4002 8922</p>
          </div>
          <div className="grid gap-x-6 gap-y-8 px-4 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            <div className="min-w-0">
              <p className={colTitle}>Meu perfil</p>
              <ul className="space-y-1.5 text-sm leading-6">
                <li><Link to="/profile" className={linkCls}>Meu perfil</Link></li>
                <li><Link to="/wallets" className={linkCls}>Carteiras</Link></li>
                <li><Link to="/criadores" className={linkCls}>Criadores</Link></li>
                <li><Link to="/aprenda" className={linkCls}>Aprenda</Link></li>
              </ul>
            </div>
            <div className="min-w-0">
              <p className={colTitle}>Central de ajuda</p>
              <ul className="space-y-1.5 text-sm leading-6">
                <li><Link to="/aprenda" className={linkCls}>Central de ajuda</Link></li>
                <li><Link to="/aprenda/$slug" params={{ slug: 'como-funciona-a-propriedade-de-nfts' }} className={linkCls}>Como comprar NFTs</Link></li>
                <li><Link to="/aprenda/$slug" params={{ slug: 'como-proteger-sua-carteira' }} className={linkCls}>Carteira e segurança</Link></li>
              </ul>
            </div>
            <div className="min-w-0">
              <p className={colTitle}>Coleções</p>
              <ul className="space-y-1.5 text-sm leading-6">
                {COLLECTIONS.slice(0, 5).map((c) => <li key={c}><Link to="/" search={{ collection: c }} hash="catalogo" className={linkCls}>{c}</Link></li>)}
              </ul>
            </div>
            <div className="min-w-0">
              <p className={colTitle}>Redes sociais</p>
              <ul className="mb-5 flex flex-wrap gap-2">
                {SOCIAL.map((x) => (
                  <li key={x.s}>
                    <a href={x.href} target="_blank" rel="noopener noreferrer" aria-label={`${x.name} (abre em nova aba)`} className="grid size-8 place-items-center rounded-control border border-primary text-xs font-bold lowercase text-primary no-underline hover:bg-accent">{x.s}</a>
                  </li>
                ))}
              </ul>
              <p className={colTitle}>Carteiras compatíveis</p>
              <p className="inline-block max-w-full rounded-control border border-primary/50 bg-band px-2 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wide text-primary">Metamask • WalletConnect • Coinbase</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-foreground">© 2026 Kurio. Propriedade digital para todos. <span className="text-muted-foreground">Ambiente de demonstração.</span></p>
      </div>
    </footer>
  )
}
