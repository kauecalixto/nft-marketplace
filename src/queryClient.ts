import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Política de cache/retry (ver ARCHITECTURE.md): dados frescos por 30 s, descartados após 5 min sem uso,
// refetch ao focar a janela; consultas repetem uma vez apenas em erro de rede ou HTTP 5xx (nunca 4xx);
// mutations nunca repetem (evita duplicar operações).
export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (failureCount >= 1) return false
  if (axios.isCancel(error)) return false
  if (axios.isAxiosError(error)) {
    if (!error.response) return true
    return error.response.status >= 500
  }
  return false
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: shouldRetryQuery,
      retryDelay: 400,
    },
    mutations: { retry: 0 },
  },
})
