"use client"

import React, { useRef } from 'react'
import { HeroHeader } from '@/components/header'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureGrid } from '@/components/landing/feature-grid'
import {
  CheckCircle,
  Rocket,
  Library,
  Layers,
  FolderOpen,
  Users,
  Film
} from 'lucide-react'
import Link from 'next/link'
import { LenisProvider } from '@/components/lenis-provider'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins
gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Fallback for accessibility
      gsap.set(".why-reveal-item, .entity-card-reveal, .cta-reveal-item", {
        opacity: 1,
        y: 0
      })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Set initial state
      gsap.set(".why-reveal-item", { opacity: 0, y: 30 })
      gsap.set(".entity-card-reveal", { opacity: 0, y: 35 })
      gsap.set(".cta-reveal-item", { opacity: 0, y: 35 })

      // Small delay to let Next.js rendering and page heights completely settle
      const timer = setTimeout(() => {
        // Reveal Why Section text items
        gsap.to(".why-reveal-item", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".why-trigger",
            start: "top 80%",
            once: true
          }
        })

        // Reveal Entity cards
        gsap.to(".entity-card-reveal", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".why-cards-trigger",
            start: "top 85%",
            once: true
          }
        })

        // Reveal CTA Section items
        gsap.to(".cta-reveal-item", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-trigger",
            start: "top 80%",
            once: true
          }
        })

        ScrollTrigger.refresh()
      }, 100)

      return () => clearTimeout(timer)
    })
  }, { scope: pageRef })

  return (
    <LenisProvider>
      <div ref={pageRef} className="relative min-h-screen bg-background selection:bg-primary/30">
        <HeroHeader />

        <HeroSection />

        <FeatureGrid />

        {/* Why Section */}
        <section className="why-trigger bg-muted/30 py-24 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-8">
                <h2 className="why-reveal-item opacity-0 text-4xl font-bold tracking-tight sm:text-6xl">
                  Knowledge over raw data
                </h2>
                <p className="why-reveal-item opacity-0 text-xl leading-relaxed text-muted-foreground">
                  Traditional bookmarking managers collect thousands of unorganized, forgotten URLs. Volt shifts the focus to curation: capturing context, detailing why items matter, and structuring custom entities matching your mental model.
                </p>
                <div className="why-reveal-item opacity-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Bidirectional relationships",
                    "Context-first details",
                    "Command-driven navigation",
                    "Fully customizable structure",
                    "Smart related references",
                    "Activity timelines"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="size-6 text-primary" />
                      <span className="text-lg font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="why-cards-trigger relative aspect-auto lg:aspect-square rounded-[2.5rem] border bg-background p-6 shadow-2xl lg:p-10 overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent" />
                <div className="relative flex flex-col justify-center gap-4 sm:gap-6 z-10 lg:h-full">
                  {[
                    { id: "res", title: "Resources", desc: "Save websites, repositories, podcasts, and articles.", icon: Library },
                    { id: "cat", title: "Categories & Collections", desc: "Build tailored structures and custom groupings.", icon: Layers },
                    { id: "proj", title: "Projects & Notes", desc: "Document insights and associate with workspaces.", icon: FolderOpen },
                    { id: "peop", title: "People", desc: "Link resources to creators, mentors, and authors.", icon: Users },
                    { id: "mw", title: "Media Watchlist", desc: "Track movies, series, and anime with TMDb & AniList.", icon: Film },
                  ].map((entity) => {
                    const Icon = entity.icon
                    return (
                      <div key={entity.id} className="entity-card-reveal opacity-0 flex items-center gap-4 rounded-2xl border bg-muted/40 p-4 sm:p-5 transition-[background-color,transform] duration-300 hover:bg-muted/80 hover:translate-x-2">
                        <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm ring-1 ring-border">
                          <Icon className="size-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-lg font-bold">{entity.title}</h4>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{entity.desc}</p>
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
        <section className="cta-trigger py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-[3rem] border bg-card p-12 lg:p-24 text-center">
              <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 to-transparent" />
              <h2 className="cta-reveal-item opacity-0 mb-6 text-4xl font-bold sm:text-7xl">
                Build your network.
              </h2>
              <h3 className="sr-only tracking-tight">Volt - The personal knowledge operating system</h3>
              <p className="cta-reveal-item opacity-0 mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
                Stop hoarding forgotten links. Start capturing context, establishing connections, and building your digital second brain with Volt.
              </p>
              <div className="cta-reveal-item opacity-0">
                <Link
                  href="/explore"
                  className="inline-flex h-16 items-center justify-center rounded-full bg-primary px-12 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-[transform,shadow,background-color] hover:scale-105"
                >
                  Access Workspace
                </Link>
              </div>
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
                {[
                  { name: 'Resources', href: '/resources' },
                  { name: 'Categories', href: '/categories' },
                  { name: 'Projects', href: '/projects' },
                  { name: 'Notes', href: '/notes' },
                  { name: 'Dashboard', href: '/explore' }
                ].map((item) => (
                  <Link key={item.name} href={item.href} className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="h-px w-full max-w-xs bg-border" />
              <p className="text-base text-muted-foreground">
                © 2026 Volt. Your personal knowledge operating system.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </LenisProvider>
  )
}
