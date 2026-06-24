"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/30 py-16 px-6 sm:px-12 flex flex-col items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-35 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div 
          className="absolute left-1/2 top-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="w-full max-w-3xl">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Card Container */}
        <article className="relative overflow-hidden rounded-[2.5rem] border bg-card/40 backdrop-blur-md p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <span className="text-sm font-semibold tracking-wider uppercase text-primary">Privacy Policy</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last Updated: June 2026
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed text-base">
            <section className="space-y-3">
              <p>
                Volt is designed as a **personal knowledge operating system** built to give you full control over your digital second brain. We believe your knowledge, notes, saved resources, and relationships should remain private.
              </p>
            </section>

            <hr className="border-border/60" />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Database className="size-5 text-primary/80" />
                1. Data Ownership & Storage
              </h2>
              <p>
                Your data is stored securely in your MongoDB database instance. Unlike corporate bookmark managers or notes apps, we do not read, parse, sell, or monetize your saved resources, notes, projects, or watchlists. The content you import or curate is 100% owned and controlled by you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lock className="size-5 text-primary/80" />
                2. Information We Collect
              </h2>
              <p>
                To provide user accounts and workspace sync, Volt securely handles:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Credentials:</strong> Email addresses and cryptographically hashed passwords when you create a local account.</li>
                <li><strong>OAuth Sync:</strong> Basic profile identifiers (like names or avatars) if you log in via third-party providers (e.g., GitHub).</li>
              </ul>
              <p>
                All user authentication is powered by <strong>Better Auth</strong>, maintaining industry-standard encryption and security protocols.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                3. Integrations & Third-Party APIs
              </h2>
              <p>
                When searching for movies or anime to add to your Learning & Media watchlist, Volt communicates with public search registries (such as TMDb and AniList). These queries are used strictly to retrieve catalog results, and no personal search identifiers are tracked or associated with your profile.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                4. Cookies & Local Storage
              </h2>
              <p>
                Volt uses essential browser cookies and local storage items strictly to maintain your active login session and remember client-side preferences (such as dark mode settings or bypassing the page preloader). We do not use advertising or tracking cookies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                5. Changes to this Policy
              </h2>
              <p>
                As Volt continues to evolve from a portfolio/personal workspace to a self-hosted or early SaaS workspace, we will update this policy. We will notify users of any substantial changes by posting the updated policy directly to this route.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Questions? Host your own instance on GitHub.
            </p>
            <Button asChild variant="outline" className="rounded-full px-6 cursor-pointer">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}
