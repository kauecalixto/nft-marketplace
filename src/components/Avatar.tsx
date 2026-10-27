import { initials } from '../lib/initials'
import { cn } from '../lib/utils'

/** Avatar decorativo: imagem (alt vazio) ou iniciais. O nome da pessoa e anunciado pelo texto vizinho. */
export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-primary-2 text-xs font-bold text-white', className)}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  )
}
