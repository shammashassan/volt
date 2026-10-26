import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an account on Volt",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full max-w-md items-center justify-center rounded-xl bg-background/60 backdrop-blur-xl border border-border/40 shadow-2xl">
          <div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
