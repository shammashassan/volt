import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { cache } from "react"

/**
 * Cached session retriever for the current request.
 * Deduplicates Better Auth session lookups across layout, page, and components.
 */
export const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  })
})

/**
 * Returns the current authenticated session user, caching within the request.
 * Throws an Error if unauthorized.
 */
export const getSessionUser = cache(async () => {
  const session = await getCachedSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session.user
})

/**
 * Ensures the session user exists.
 * Throws an Error if unauthorized.
 */
export async function checkApprovedUser() {
  return await getSessionUser()
}

/**
 * Ensures the session user exists and has the 'admin' role.
 * Throws an Error if not admin.
 */
export async function checkAdminUser() {
  const user = await getSessionUser()
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
  return user
}

/**
 * Page & Layout Guard: Redirects unauthenticated visitors to /sign-in.
 */
export const requireAuth = cache(async () => {
  const session = await getCachedSession()
  if (!session) redirect("/sign-in")
  return session
})

/**
 * Page & Layout Guard: Ensures user is authenticated.
 */
export async function requireApprovedUser() {
  return await requireAuth()
}

/**
 * Page & Layout Guard: Ensures user is admin, otherwise redirects to /explore.
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "admin") {
    redirect("/explore")
  }
  return session
}

/**
 * Formats unknown error objects into human-readable strings.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
