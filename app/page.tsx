import React from 'react'
import { HeroHeader } from '@/components/header'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureGrid } from '@/components/landing/feature-grid'
import {
  CheckCircle,
  Rocket
} from 'lucide-react'
import { categories } from '@/lib/data'
import { ICON_MAP } from '@/lib/icons'
import Link from 'next/link'
import { LenisProvider } from '@/components/lenis-provider'

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-background selection:bg-primary/30">
        <HeroHeader />

        <HeroSection />

        <FeatureGrid />

        {/* Why Section */}
        <section className="bg-muted/30 py-24 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-8">
                <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  Curation over quantity
                </h2>
                <p className="text-xl leading-relaxed text-muted-foreground">
                  There are thousands of component libraries out there. We focus on the high-fidelity primitives that actually make it into production. From 21st.dev to Aceternity, we find the gems so you don't have to.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Verified production-ready",
                    "Visual toolsets for CSS",
                    "Advanced motion patterns",
                    "AI agent skill libraries",
                    "Geospatial UI primitives",
                    "Sound engineering tools"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="size-6 text-primary" />
                      <span className="text-lg font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-auto lg:aspect-square rounded-[2.5rem] border bg-background p-6 shadow-2xl lg:p-10 overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent" />
                <div className="relative flex flex-col justify-center gap-4 sm:gap-6 z-10 lg:h-full">
                  {categories.slice(0, 4).map((cat) => {
                    const Icon = ICON_MAP[cat.icon]
                    return (
                      <div key={cat.id} className="flex items-center gap-4 rounded-2xl border bg-muted/40 p-4 sm:p-5 transition-[background-color,transform] hover:bg-muted/80 hover:translate-x-2">
                        <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm ring-1 ring-border">
                          {Icon && <Icon className="size-6" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-lg font-bold">{cat.title}</h4>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{cat.description.split('.')[0]}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-[3rem] border bg-card p-12 lg:p-24 text-center">
              <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 to-transparent" />
              <h2 className="mb-6 text-4xl font-bold sm:text-7xl">
                Level up your workflow.
              </h2>
              <h3 className="sr-only tracking-tight">Volt - The ultimate workspace for design engineers</h3>
              <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
                Join thousands of design engineers using Volt to stay ahead of the UI curve. Curated weekly.
              </p>
              <Link
                href="/explore"
                className="inline-flex h-16 items-center justify-center rounded-full bg-primary px-12 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-[transform,shadow,background-color] hover:scale-105"
              >
                Access the Library
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-20 bg-muted/10">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Rocket className="size-6" />
                </div>
                <span className="text-2xl font-bold tracking-tighter">Volt</span>
              </div>
              <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                {['Explore', 'Components', 'Patterns', 'Docs', 'GitHub', 'Twitter'].map((item) => (
                  <Link key={item} href="#" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                ))}
              </nav>
              <div className="h-px w-full max-w-xs bg-border" />
              <p className="text-base text-muted-foreground">
                © 2026 Volt. Built for the design engineering community.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </LenisProvider>
  )
}
