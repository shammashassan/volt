import { createAuthClient } from "better-auth/react"
import {
  usernameClient,
  magicLinkClient,
  twoFactorClient,
  adminClient,
  organizationClient,
} from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { ac, roles } from "@/lib/access"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    usernameClient(),
    magicLinkClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/2fa"
      },
    }),
    passkeyClient(),
    adminClient({ ac, roles }),
    organizationClient(),
  ],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
