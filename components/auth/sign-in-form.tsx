"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { signIn, authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Key, Mail, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/toast"

export function SignInForm() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [magicLinkEmail, setMagicLinkEmail] = useState("")
  const [showMagicForm, setShowMagicForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bannedError, setBannedError] = useState<string | null>(null)

  // Passkey Conditional UI / Autofill Mediation
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      window.PublicKeyCredential.isConditionalMediationAvailable
    ) {
      window.PublicKeyCredential.isConditionalMediationAvailable()
        .then((available) => {
          if (available) {
            void authClient.signIn.passkey({ autoFill: true })
          }
        })
        .catch(() => {
          // Conditional passkey mediation can fail quietly when no credential is available.
        })
    }
  }, [])

  // Handle URL search parameter error callbacks
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")
    if (error) {
      if (error === "BANNED_USER" || error.toLowerCase().includes("banned")) {
        setBannedError("Your account has been suspended by an administrator. Please contact support if you believe this is an error.")
      } else if (error === "account_not_linked") {
        toast.add({
          title: "This email is already associated with another login method. Please sign in with your password.",
          type: "error",
        })
      } else if (error === "access_denied") {
        toast.add({
          title: "Google sign-in was cancelled.",
          type: "error",
        })
      } else {
        toast.add({
          title: `Authentication error: ${error.replace(/_/g, " ")}`,
          type: "error",
        })
      }
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [router])

  const getAuthErrorMessage = (err: unknown, fallback = "An unexpected error occurred") => {
    if (typeof err === "string") return err
    if (!err || typeof err !== "object") return fallback

    const authError = err as {
      error?: string | { message?: unknown; code?: unknown }
      message?: unknown
      code?: unknown
    }
    const nestedMessage = typeof authError.error === "object" ? authError.error?.message : authError.error

    if (typeof nestedMessage === "string") return nestedMessage
    if (typeof authError.message === "string") return authError.message

    return fallback
  }

  const isBannedError = (err: unknown, message = getAuthErrorMessage(err)) => {
    const authError =
      err && typeof err === "object"
        ? (err as { error?: { code?: unknown }; code?: unknown; message?: unknown })
        : null

    return (
      message.toLowerCase().includes("banned") ||
      message.toLowerCase().includes("suspended") ||
      authError?.error?.code === "BANNED_USER" ||
      authError?.code === "BANNED_USER" ||
      authError?.message === "BANNED_USER"
    )
  }

  const handleToastError = (err: unknown, fallback?: string) => {
    const errMsg = getAuthErrorMessage(err, fallback)

    if (isBannedError(err, errMsg)) {
      setBannedError(errMsg)
      return errMsg
    }

    return errMsg
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setBannedError(null)

    const trimmedIdentifier = identifier.trim()
    const isEmail = trimmedIdentifier.includes("@")

    const signInPromise = (async () => {
      let res
      if (isEmail) {
        res = await signIn.email({
          email: trimmedIdentifier,
          password,
          callbackURL: "/dashboard",
        })
      } else {
        res = await signIn.username({
          username: trimmedIdentifier,
          password,
          callbackURL: "/dashboard",
        })
      }

      if (res.error) {
        throw res.error
      }

      if (res.data) {
        router.push("/dashboard")
        router.refresh()
      }
      return res.data
    })().finally(() => {
      setLoading(false)
    })

    try {
      await toast.promise(signInPromise, {
        loading: "Signing in...",
        success: "Signed in successfully",
        error: (err: unknown) => handleToastError(err, "Failed to sign in"),
      })
    } catch (err: unknown) {
      const msg = handleToastError(err, "Failed to sign in")
      isBannedError(err, msg)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const magicLinkPromise = (async () => {
      const { error: resError } = await authClient.signIn.magicLink({
        email: magicLinkEmail.trim(),
        callbackURL: "/dashboard",
      })

      if (resError) {
        throw resError
      }
    })().finally(() => {
      setLoading(false)
    })

    try {
      await toast.promise(magicLinkPromise, {
        loading: "Sending magic link...",
        success: "A magic sign-in link has been sent to your email",
        error: (err: unknown) => handleToastError(err, "Failed to send magic link"),
      })
    } catch {
      // Handled by toast.promise
    }
  }

  const handlePasskeySignIn = async () => {
    setLoading(true)

    const passkeyPromise = (async () => {
      const { data, error: resError } = await authClient.signIn.passkey()

      if (resError) {
        throw resError
      }

      if (data) {
        router.push("/dashboard")
        router.refresh()
      }
    })().finally(() => {
      setLoading(false)
    })

    try {
      await toast.promise(passkeyPromise, {
        loading: "Checking passkey...",
        success: "Signed in with passkey",
        error: (err: unknown) => handleToastError(err, "No passkey was selected or available"),
      })
    } catch {
      // Handled by toast.promise
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const googlePromise = (async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/sign-in",
      })
    })().finally(() => {
      setLoading(false)
    })

    try {
      await toast.promise(googlePromise, {
        loading: "Connecting to Google...",
        success: "Redirecting to Google...",
        error: (err: unknown) => handleToastError(err, "Failed to continue with Google"),
      })
    } catch {
      // Handled by toast.promise
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col text-center">
          <CardTitle>Sign in to Volt</CardTitle>
          <CardDescription>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {bannedError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs tracking-wide uppercase">Account Suspended</span>
                <AlertDescription>
                  {bannedError}{" "}
                  <a
                    href="mailto:support@volt.app"
                    className="underline font-semibold hover:text-foreground inline-block mt-1"
                  >
                    Contact Support
                  </a>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {showMagicForm ? (
            <form onSubmit={handleMagicLinkSignIn} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="magic-email">Email Address</FieldLabel>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full mt-1" disabled={loading || !magicLinkEmail.trim()}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Send Magic Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowMagicForm(false)}
                disabled={loading}
              >
                Sign in with Password instead
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="identifier">Email or Username</FieldLabel>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="name@example.com or username"
                    autoComplete="username email webauthn"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          )}

          <div className="relative my-1 flex items-center justify-center">
            <span className="absolute w-full border-t border-border/40" />
            <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase">
              Or continue with
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="size-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
               
                onClick={handlePasskeySignIn}
                disabled={loading}
              >
                <Key className="size-3.5" />
                Passkey
              </Button>
              <Button
                type="button"
                variant="outline"
               
                onClick={() => setShowMagicForm((prev) => !prev)}
                disabled={loading}
              >
                <Mail className="size-3.5" />
                {showMagicForm ? "Password" : "Magic Link"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
