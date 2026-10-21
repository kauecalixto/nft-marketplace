import type { InputHTMLAttributes } from 'react'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function Field({ id, label, error, ...rest }: { id: string; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-red-700 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
