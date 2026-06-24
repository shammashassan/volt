"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

// Register the useGSAP plugin
gsap.registerPlugin(useGSAP)

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

export function HeroSection({ startReveal = false }: { startReveal?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse spotlight coordinates tracking
  useGSAP((context, contextSafe) => {
    if (!startReveal) return

    const section = containerRef.current
    if (!section) return

    // Respect system preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let rect = section.getBoundingClientRect()
    let offsetLeft = rect.left + window.scrollX
    let offsetTop = rect.top + window.scrollY

    const updateOffsets = () => {
      rect = section.getBoundingClientRect()
      offsetLeft = rect.left + window.scrollX
      offsetTop = rect.top + window.scrollY
    }

    window.addEventListener('resize', updateOffsets)

    if (!contextSafe) return

    // Use quickTo for buttery smooth performance animating transform x and y directly on the GPU
    const xTo = gsap.quickTo('.spotlight-glow', 'x', { duration: 0.6, ease: 'power2.out' })
    const yTo = gsap.quickTo('.spotlight-glow', 'y', { duration: 0.6, ease: 'power2.out' })

    const handleMouseMove = contextSafe((e: MouseEvent) => {
      const x = e.pageX - offsetLeft
      const y = e.pageY - offsetTop
      xTo(x)
      yTo(y)
    })

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('resize', updateOffsets)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, { scope: containerRef, dependencies: [startReveal] })

  useGSAP(() => {
    if (!startReveal) return

    // Respect system preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('.bg-glow-1, .bg-glow-2, .bg-glow-3, .spotlight-glow', { opacity: 1, scale: 1 })
      gsap.set('.hero-badge, .hero-title-word, .hero-para, .hero-btn', { opacity: 1, y: 0, scale: 1 })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Ambient glow entrance animations (GPU layers, pure opacity fades to prevent re-rasterizing CSS filters)
    tl.fromTo('.bg-glow-1', {
      opacity: 0
    }, {
      opacity: 1,
      duration: 2.2,
      ease: 'power3.out'
    }, 0)

    tl.fromTo(['.bg-glow-2', '.bg-glow-3'], {
      opacity: 0
    }, {
      opacity: 1,
      duration: 2.5,
      stagger: 0.15,
      ease: 'power2.out'
    }, 0.1)

    // Dynamic theme spotlight glow fade-in (opacity-only)
    tl.fromTo('.spotlight-glow', {
      opacity: 0
    }, {
      opacity: () => {
        const isDark = document.documentElement.classList.contains('dark')
        return isDark ? 0.35 : 0.12
      },
      duration: 2.0,
      ease: 'power3.out'
    }, 0.1)

    // Entrance sequence
    tl.fromTo('.hero-badge', {
      opacity: 0,
      y: 12,
      scale: 0.97
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.6,
    }, 0.1)

    // Stagger reveal the title words using refined, tighter slide and stagger timings
    tl.fromTo('.hero-title-word', {
      y: 8,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1.6,
      stagger: 0.08,
      ease: 'power3.out'
    }, '<+0.15')

    // Fade-in-up paragraph
    tl.fromTo('.hero-para', {
      opacity: 0,
      y: 8
    }, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power3.out'
    }, '<+0.35')

    tl.fromTo('.hero-btn', {
      opacity: 0,
      y: 10,
      scale: 0.98
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.15,
      duration: 1.4,
    }, '<+0.25')
  }, { scope: containerRef, dependencies: [startReveal] })

  const titleWords1 = "A searchable network".split(" ")
  const titleWords2 = "of your knowledge.".split(" ")

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-25 text-center lg:px-12"
    >
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6">
          <div className="hero-badge opacity-0 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Volt v2.0 • Personal Knowledge OS
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight text-center">
            {titleWords1.map((word, idx) => (
              <span key={idx} className="hero-title-word inline-block mr-[0.25em] opacity-0 will-change-[transform,opacity]">
                {word}
              </span>
            ))}
            <br className="w-full hidden sm:block" />
            {titleWords2.map((word, idx) => (
              <span key={idx} className="hero-title-word inline-block mr-[0.25em] opacity-0 bg-linear-to-r from-primary to-primary/40 bg-clip-text text-transparent font-extrabold will-change-[transform,opacity]">
                {word}
              </span>
            ))}
          </h1>

          <div className="hero-para opacity-0 max-w-2xl mx-auto will-change-[transform,opacity]">
            <p className="text-lg text-muted-foreground sm:text-xl">
              Not another bookmark manager. Volt is a personal knowledge operating system to capture resources, write notes, link projects, track media watchlists, and retrieve everything instantly.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/explore"
              className="group hero-btn opacity-0 inline-flex h-14 items-center justify-center gap-2 rounded-full border border-transparent bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-[transform,shadow,background-color] hover:scale-105 active:scale-95"
            >
              Open Workspace
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/shammashassan/volt"
              target="_blank"
              className="hero-btn opacity-0 inline-flex h-14 items-center justify-center gap-2 rounded-full border bg-background px-10 text-base font-semibold transition-[background-color,border-color] hover:bg-muted"
            >
              <GitHubIcon className="size-5" />
              Browse Project
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Static Hardware-Accelerated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-35 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" 
        />
        
        {/* GPU-Accelerated Spotlight Glow (no blend mode composition overhead, no layout thrashing) */}
        <div 
          className="spotlight-glow absolute pointer-events-none w-[1000px] h-[1000px] -left-[500px] -top-[500px] rounded-full opacity-0 will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(120,119,198,0.15) 0%, transparent 65%)',
          }}
        />
        
        {/* Glow Orbs (using pure radial-gradients, avoiding expensive CSS blur filters entirely) */}
        <div 
          className="bg-glow-1 absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          }}
        />
        <div 
          className="bg-glow-2 absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          }}
        />
        <div 
          className="bg-glow-3 absolute left-0 bottom-0 h-[600px] w-[600px] rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)',
          }}
        />
      </div>
    </section>
  )
}
