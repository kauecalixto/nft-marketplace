import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api, getToken } from '../api'
import { useSession } from './session'

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
        className="border px-3 py-1"
      >
        {isFav ? 'Remover dos favoritos' : 'Favoritar'}
      </button>
      {toggle.isError && <p role="alert">Não foi possível atualizar os favoritos</p>}
    </div>
  )
}
