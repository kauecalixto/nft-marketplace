import { useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { apiErrors, type User } from './session'

export const AVATAR_MAX_BYTES = 1024 * 1024

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })

/** Upload de avatar (imagem até 1 MB), enviado como data URL via PATCH /api/profile. */
export function AvatarUpload() {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const m = useMutation({
    mutationFn: async (avatar: string) => (await api.patch<User>('/profile', { avatar })).data,
    onSuccess: (u) => {
      setError(null)
      setPreview(null)
      qc.setQueryData(['session'], u)
    },
    onError: (e) => setError(apiErrors(e).fields.avatar ?? apiErrors(e).message ?? 'Falha ao enviar o avatar'),
  })

  async function onFile(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    setPreview(null)
    if (!file) return setError(null)
    if (!file.type.startsWith('image/')) return setError('Envie um arquivo de imagem')
    if (file.size > AVATAR_MAX_BYTES) return setError('A imagem deve ter no máximo 1 MB')
    setError(null)
    try {
      setPreview(await readAsDataUrl(file))
    } catch {
      setError('Não foi possível ler o arquivo')
    }
  }

  return (
    <section aria-labelledby="avatar-upload-title" className="space-y-3">
      <h2 id="avatar-upload-title" className="text-base font-bold">Foto do perfil</h2>
      <label htmlFor="avatar-file" className="block text-sm">Enviar imagem (até 1 MB)</label>
      <input
        id="avatar-file"
        data-testid="avatar-file"
        type="file"
        accept="image/*"
        onChange={onFile}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'avatar-file-error' : undefined}
        className="block w-full min-w-0 max-w-full rounded-control border border-input bg-background p-2 text-sm file:mr-3 file:rounded-control file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-bold file:text-primary-foreground"
      />
      {error && <p id="avatar-file-error" role="alert" data-testid="avatar-error" className="text-sm font-medium text-destructive">{error}</p>}
      {preview && (
        <div className="space-y-2">
          <img src={preview} alt="Pré-visualização do novo avatar" data-testid="avatar-preview" className="size-16 rounded-full object-cover" />
          <button type="button" data-testid="avatar-save" disabled={m.isPending} onClick={() => m.mutate(preview)} className="inline-flex h-10 items-center rounded-control bg-primary px-4 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50">
            Salvar avatar
          </button>
        </div>
      )}
      {m.isSuccess && !preview && <p role="status" data-testid="avatar-saved" className="text-sm font-semibold text-success">Avatar atualizado</p>}
    </section>
  )
}
