import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { cache } from "react"

/**
 * Returns the current authenticated session user, caching within the request.
 * Throws an Error if unauthorized.
 */
export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session.user
})

/**
 * Ensures the session user exists and is approved (or admin).
 * Throws an Error if unauthorized or unapproved.
 */
export async function checkApprovedUser() {
  const user = await getSessionUser()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyUser = user as any
  if (!anyUser.isApproved && !anyUser.approved && anyUser.role !== "admin") {
    throw new Error("Forbidden: User is not approved")
  }
  return user
}

/**
 * Ensures the session user exists, is approved, and has the 'admin' role.
 * Throws an Error if not admin.
 */
export async function checkAdminUser() {
  const user = await checkApprovedUser()
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
  return user
}

/**
 * Page & Layout Guard: Redirects unauthenticated visitors to /sign-in.
 */
export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")
  return session
}

/**
 * Page & Layout Guard: Redirects unauthenticated to /sign-in,
 * and unapproved users to /pending-approval.
 */
export async function requireApprovedUser() {
  const session = await requireAuth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any
  if (!user.isApproved && !user.approved && user.role !== "admin") {
    redirect("/pending-approval")
  }
  return session
}

/**
 * Page & Layout Guard: Ensures user is admin, otherwise redirects to /explore.
 */
export async function requireAdmin() {
  const session = await requireApprovedUser()
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
