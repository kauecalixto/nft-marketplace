import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api, getToken } from '../api'
import { useSession } from './session'
import { HeartIcon } from '../components/icons'

export function FavoriteButton({ nftId }: { nftId: string }) {
  const { data: user } = useSession()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const key = ['favorites', user?.id]
  const { data: favorites } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async ({ signal }) => (await api.get<string[]>('/favorites', { signal })).data,
  })
  const isFav = favorites?.includes(nftId) ?? false
  const toggle = useMutation({
    mutationFn: async (add: boolean) =>
      add ? api.post('/favorites', { nftId }) : api.delete(`/favorites/${encodeURIComponent(nftId)}`),
    onMutate: async (add) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<string[]>(key)
      qc.setQueryData<string[]>(key, (old = []) => (add ? [...old.filter((x) => x !== nftId), nftId] : old.filter((x) => x !== nftId)))
      return { prev }
    },
    onError: (_e, _add, ctx) => qc.setQueryData(key, ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
  return (
    <div>
      <button
        data-testid="favorite-toggle"
        aria-pressed={isFav}
        disabled={toggle.isPending}
        onClick={() => {
          if (!getToken()) {
            void navigate({ to: '/login', search: { redirect: window.location.pathname } })
            return
          }
          toggle.mutate(!isFav)
        }}
        className={`inline-flex h-10 items-center gap-2 rounded-control border px-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 ${isFav ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-input bg-surface text-foreground hover:bg-accent'}`}
      >
        <HeartIcon filled={isFav} className="size-5" />
        {isFav ? 'Remover dos favoritos' : 'Favoritar'}
      </button>
      {toggle.isError && <p role="alert" className="mt-1 text-sm font-medium text-destructive">Não foi possível atualizar os favoritos</p>}
    </div>
  )
}
