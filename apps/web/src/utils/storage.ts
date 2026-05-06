import type { JwtUser } from "../types"

const USER_KEY = "auth_user"

// Sécurité: on ne stocke plus le JWT côté navigateur (cookie HttpOnly côté serveur).
export function saveUser(user: JwtUser): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): JwtUser | null {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as JwtUser
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

export function removeUser(): void {
  sessionStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}
