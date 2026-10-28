import { Link } from '@tanstack/react-router'
import { ChevronLeftIcon } from './icons'

/** Botão circular "voltar" das telas mobile do Figma (carrinho, pagamento). Só existe abaixo de md. */
export function BackButton({ to, label = 'Voltar' }: { to: '/' | '/cart'; label?: string }) {
  return (
    <Link to={to} aria-label={label} className="absolute left-0 top-0 inline-flex size-10 items-center justify-center rounded-full bg-surface text-primary no-underline md:hidden">
      <ChevronLeftIcon className="size-5" />
    </Link>
  )
}

/** Título centralizado no mobile (com o botão voltar à esquerda); a partir de md vira o título de seção normal. */
export const mobileTitle = 'max-md:border-0 max-md:pb-0 max-md:text-center max-md:text-xl max-md:text-foreground max-md:leading-10'
