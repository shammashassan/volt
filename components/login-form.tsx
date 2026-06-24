"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") || "/explore"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (isSignUp) {
      await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/pending-approval"
      }, {
        onSuccess: () => {
          toast.success("Signup successful! Please wait for admin approval.")
          router.push("/pending-approval")
          router.refresh()
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Signup failed")
          setIsLoading(false)
        }
      })
    } else {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackURL
      }, {
        onSuccess: (ctx) => {
          const user = ctx.data.user as { isApproved?: boolean; role?: string }
          if (!user.isApproved && user.role !== "admin") {
            toast.info("Your account is pending approval.")
            router.push("/pending-approval")
          } else {
            toast.success("Login successful")
            router.push(callbackURL)
            router.refresh()
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Login failed")
          setIsLoading(false)
        }
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none shadow-2xl bg-background/60 backdrop-blur-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-12 flex flex-col justify-center">
            <FieldGroup className="gap-8">
              <div className="flex flex-col items-start gap-2 text-left">
                <h1 className="text-3xl font-bold tracking-tight">
                  {isSignUp ? "Create an account" : "Welcome back"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isSignUp ? "Enter your details to get started" : "Enter your credentials to access your account"}
                </p>
              </div>
              <div className="grid gap-6">
                {isSignUp && (
                  <Field className="grid gap-2">
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                      className="h-11"
                    />
                  </Field>
                )}
                <Field className="grid gap-2">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    className="h-11"
                  />
                </Field>
                <Field className="grid gap-2">
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </Field>
                <Button type="submit" className="h-11 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Sign Up" : "Login"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary font-semibold hover:underline"
                  >
                    {isSignUp ? "Login" : "Sign Up"}
                  </button>
                </div>
              </div>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-black md:block overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"
              alt="Login aesthetic image"
              fill
              sizes="(max-width: 768px) 0vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
