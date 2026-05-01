import { LoginForm } from "@/components/login-form"
import { FlickeringGrid } from "@/components/ui/flickering-grid"

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
        <LoginForm />
      </div>
    </div>
  )
}

