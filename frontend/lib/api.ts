let secret = ''

export function setSecret(s: string) {
  secret = s
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dashboard_secret', s)
  }
}

export function getSecret(): string {
  if (!secret && typeof window !== 'undefined') {
    secret = sessionStorage.getItem('dashboard_secret') ?? ''
  }
  return secret
}

export function clearSecret() {
  secret = ''
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dashboard_secret')
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'x-dashboard-secret': getSecret(),
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

export function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}
