import { useSyncExternalStore } from 'react'

/** Reage a uma media query (ex.: `useMediaQuery('(max-width: 767px)')`). Falso fora do navegador. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Abaixo do breakpoint `md` do Tailwind (768 px): layout mobile do Figma. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
