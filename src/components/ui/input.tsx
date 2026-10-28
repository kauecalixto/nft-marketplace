import * as React from 'react'
import { cn } from '../../lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full min-w-0 rounded-control border border-input bg-background px-3 py-1 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
