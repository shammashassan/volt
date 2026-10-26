import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and acceptable use guidelines for Volt - The personal knowledge operating system.',
}

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
                Welcome to Volt. By accessing or using our personal knowledge operating system, you agree to comply with and be bound by the following Terms of Service.
              </p>
            </section>

            <hr className="border-border/60" />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary/80" />
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, saving resources, linking entities, or connecting external media registries, you acknowledge that you have read, understood, and agree to these terms. If you do not agree, you should discontinue use of the platform immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-5 text-primary/80" />
                2. Acceptable Use
              </h2>
              <p>
                Volt is built for personal productivity, knowledge tracking, and developer inspiration. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attempt to bypass session security, authentication boundaries, or multi-tenant database isolation.</li>
                <li>Conduct automated scraping or denial-of-service loops against our API endpoints.</li>
                <li>Store illegal material or malicious scripts in your personal notes or entity documents.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                3. Self-Hosted & Local Storage Disclaimer
              </h2>
              <p>
                Volt provides software for organizing data stored in your configured MongoDB instance. You are responsible for maintaining backups, managing your database credentials, and ensuring your database access strings are kept secret.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                4. Third-Party Services
              </h2>
              <p>
                Our platform interfaces with third-party APIs such as TMDb, AniList, and Google OAuth. We do not control or assume responsibility for any third-party services, changes in their terms, or disruptions in their availability.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                5. Termination
              </h2>
              <p>
                You may delete your account and personal data at any time through the Account Settings portal. We reserve the right to suspend or restrict access to any account that violates acceptable use policies or compromises system stability.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Questions? Host your own instance on GitHub.
            </p>
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full px-6 cursor-pointer"
            >
              Back to Home
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}
