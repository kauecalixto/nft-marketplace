import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-control border px-2 py-0.5 text-xs font-bold', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-primary/60 bg-transparent text-primary',
      success: 'border-success/40 bg-success-soft text-success',
      warning: 'border-warning/40 bg-warning-soft text-warning',
      destructive: 'border-destructive/40 bg-destructive-soft text-destructive',
      outline: 'text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
