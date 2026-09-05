import { useEffect, useState } from 'react'

export type Route = 'home' | 'plan' | 'checks' | 'theory'

export const ROUTE_META: Record<Route, { hash: string; title: string }> = {
  home: { hash: '#/', title: 'Маршрут: испанский' },
  plan: { hash: '#/plan', title: 'План — Маршрут: испанский' },
  checks: { hash: '#/checks', title: 'Тесты — Маршрут: испанский' },
  theory: { hash: '#/theory', title: 'Умею сказать — Маршрут: испанский' },
}

function parseHash(hash: string): Route {
  if (hash.startsWith(ROUTE_META.plan.hash)) return 'plan'
  if (hash.startsWith(ROUTE_META.checks.hash)) return 'checks'
  if (hash.startsWith(ROUTE_META.theory.hash)) return 'theory'
  return 'home'
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
