import { LoginForm } from "@/components/login-form"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10">
      <FlickeringGrid
        className="absolute inset-0 z-0"
        squareSize={4}
        gridGap={6}
        color="#60a5fa"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <Suspense fallback={
          <div className="flex h-40 items-center justify-center rounded-xl bg-background/60 backdrop-blur-xl">
            <div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

