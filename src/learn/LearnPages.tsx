import { Link, useParams } from '@tanstack/react-router'
import { buttonVariants } from '../components/ui/button'
import { POSTS, postBySlug } from './posts'

export function LearnPage() {
  return (
    <section aria-labelledby="learn-title" className="space-y-8">
      <header className="space-y-2">
        <h1 id="learn-title" className="text-2xl font-bold uppercase md:text-[32px]">Aprenda</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Diário da Cunhagem: guias curtos para colecionadores sobre propriedade digital, raridade e segurança.</p>
      </header>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {POSTS.map((p) => (
          <li key={p.slug} data-testid="post-card" className="card min-w-0 overflow-hidden">
            <img src={p.img} alt="" width={640} height={640} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top" />
            <div className="space-y-2 p-4">
              <p className="text-xs text-muted-foreground">{p.date} &nbsp;|&nbsp; Leitura de {p.read} min</p>
              <h2 className="text-base font-bold leading-6 text-foreground">{p.title}</h2>
              <p className="text-xs leading-5 text-muted-foreground">{p.summary}</p>
              <Link to="/aprenda/$slug" params={{ slug: p.slug }} aria-label={`Ler artigo: ${p.title}`} className="inline-block text-xs font-bold text-primary underline-offset-4 hover:underline">Ler mais →</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ArticlePage() {
  const { slug } = useParams({ from: '/aprenda/$slug' })
  const post = postBySlug(slug)
  if (!post) {
    return (
      <section className="card mx-auto max-w-lg space-y-4 border-b-8 border-primary p-8 text-center">
        <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
        <p className="text-muted-foreground">Não existe um artigo com este endereço.</p>
        <Link to="/aprenda" className={buttonVariants({})}>Voltar para Aprenda</Link>
      </section>
    )
  }
  return (
    <article aria-labelledby="article-title" className="mx-auto max-w-2xl space-y-6">
      <Link to="/aprenda" className="inline-flex h-10 items-center text-sm font-bold text-primary no-underline hover:underline">← Voltar para Aprenda</Link>
      <img src={post.img} alt="" width={640} height={640} decoding="async" className="aspect-[16/9] w-full rounded-2xl object-cover object-top" />
      <header className="space-y-2">
        <p className="text-xs text-muted-foreground">{post.date} &nbsp;|&nbsp; Leitura de {post.read} min</p>
        <h1 id="article-title" className="text-2xl font-bold leading-snug md:text-[32px]">{post.title}</h1>
      </header>
      <div className="space-y-4 text-sm leading-7 text-foreground">
        {post.body.map((t, i) => <p key={i}>{t}</p>)}
      </div>
    </article>
  )
}
