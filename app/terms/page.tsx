"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
              <Scale className="size-5" />
            </div>
            <span className="text-sm font-semibold tracking-wider uppercase text-primary">Terms of Service</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last Updated: June 2026
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed text-base">
            <section className="space-y-3">
              <p>
                Welcome to Volt. By running, deploying, or creating an account on this platform, you agree to these simple terms. Since Volt is currently structured as a personal workspace and portfolio project, these terms are kept lightweight and transparent.
              </p>
            </section>

            <hr className="border-border/60" />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary/80" />
                1. Usage & Self-Hosting
              </h2>
              <p>
                Volt is designed to be self-hosted or run locally. You are granted the right to customize, clone, and run instances of Volt for your personal knowledge management and educational purposes. Modification of the source code is permitted and encouraged under its open-source license.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-5 text-primary/80" />
                2. Account & Infrastructure Responsibility
              </h2>
              <p>
                If you host Volt or run it as a local workspace:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are entirely responsible for securing your MongoDB databases, API keys, and environment files (`.env`).</li>
                <li>You are responsible for safeguarding your login credentials (emails and passwords managed by Better Auth).</li>
                <li>Volt does not impose storage limits or monitor your upload bandwidth, as all operational costs and limits depend on your own database hosting.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                3. Content Guidelines
              </h2>
              <p>
                Because Volt is fully user-owned, we do not inspect or moderate the links, notes, watchlists, or categories you store. You retain full copyright and ownership of the information you curate. You represent that you have the right to store any resources uploaded or saved to your personal database.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                4. Disclaimer of Warranty
              </h2>
              <p>
                Volt is provided **"as is"**, without warranty of any kind, express or implied. Under no circumstances shall the creators or contributors be liable for any data loss, database corruption, API disruptions, or service interruptions that arise from self-hosting, updating, or modifying the application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                5. Evolving Service Terms
              </h2>
              <p>
                If and when Volt transitions into a commercial multi-user SaaS product, these terms will be updated to reflect subscription billing, server uptimes, service level agreements, and data hosting compliance.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Built with care as a digital second brain.
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
