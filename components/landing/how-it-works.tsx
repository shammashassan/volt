"use client"

import React, { useRef } from 'react'
import { PlusCircle, GitBranch, Command } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function HowItWorks({ startReveal = false }: { startReveal?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!startReveal) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".workflow-header, .workflow-step", { autoAlpha: 1, y: 0 })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Only transform + opacity are touched — stays on the compositor, no layout/paint cost.
      gsap.set(".workflow-title-reveal, .workflow-subtitle-reveal", { autoAlpha: 0, y: 30 })
      gsap.set(".workflow-step", { autoAlpha: 0, y: 40 })

      const timer = setTimeout(() => {
        gsap.to([".workflow-title-reveal", ".workflow-subtitle-reveal"], {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".workflow-header",
            start: "top 85%",
            once: true
          }
        })

        gsap.to(".workflow-step", {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".workflow-steps-trigger",
            start: "top 80%",
            once: true
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    })
  }, { scope: containerRef, dependencies: [startReveal] })

  const steps = [
    {
      id: "capture",
      stepNum: "01",
      hex: "0x01",
      title: "Capture",
      desc: "Instantly save web links, code repositories, quick notes, reminders, key figures, and ongoing projects before they get lost.",
      icon: PlusCircle,
      bullets: ["Quick-save bookmarks", "Jot down text thoughts", "Associate with creators/people"]
    },
    {
      id: "organize",
      stepNum: "02",
      hex: "0x02",
      title: "Organize",
      desc: "Assign custom categories, map tags, and establish bidirectional connections so that your entries contextualize each other.",
      icon: GitBranch,
      bullets: ["User-defined structures", "Contextual metadata answers", "Connected relationship maps"]
    },
    {
      id: "retrieve",
      stepNum: "03",
      hex: "0x03",
      title: "Retrieve",
      desc: "Access your entire second brain in milliseconds using our global Command Center. Just press Ctrl + K to find anything.",
      icon: Command,
      bullets: ["Fuzzy universal search", "Action-driven navigation", "Responsive keyboard controls"]
    }
  ]

  return (
    <section
      ref={containerRef}
      id="workflow"
      className="mx-auto max-w-7xl px-6 py-24 sm:py-32 border-t border-border/50"
    >
      <div className="workflow-header mb-20 text-center">
        <span className="workflow-subtitle-reveal font-mono text-[11px] font-semibold tracking-[0.25em] text-primary/70 uppercase mb-3 inline-block">
          Three-Stage Pipeline
        </span>
        <h2 className="workflow-title-reveal mb-4 text-4xl font-bold tracking-tight sm:text-6xl text-balance">
          Your Knowledge Workflow
        </h2>
        <p className="workflow-subtitle-reveal mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Volt&apos;s structure focuses on capturing context cleanly, organizing it custom-fit to your brain, and retrieving it instantly.
        </p>
      </div>

      <div className="workflow-steps-trigger relative grid grid-cols-1 md:grid-cols-3 gap-px md:gap-0 rounded-[1.75rem] border border-border/50 overflow-hidden bg-border/50">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className="workflow-step card-perf group relative flex flex-col justify-between bg-card p-8 md:p-10 contain-[layout_paint]"
              style={{ transitionDelay: `${i * 0}ms` }}
            >
              {/* Static glow layer — box-shadow is baked in once, only its opacity animates (cheap compositor fade, no blur recalculation) */}
              <div className="card-glow pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Top accent bar — scaleX transform instead of animating border-color/width */}
              <div className="absolute top-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-muted-foreground/70">
                    {step.hex}
                  </span>
                  <div className="card-icon relative flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-[transform,border-color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-3 group-hover:border-primary">
                    {/* Expanding ring pulse — transform:scale + opacity only */}
                    <span className="icon-ring pointer-events-none absolute inset-0 rounded-xl border border-primary/50 opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-[1.6] transition-[transform,opacity] duration-500 ease-out" />
                    {/* Fill sweep — a circle scaled up from 0, clipped by the parent's rounded-xl overflow */}
                    <span className="icon-fill absolute inset-0 overflow-hidden rounded-xl">
                      <span className="absolute inset-0 origin-center scale-0 rounded-full bg-primary transition-transform duration-300 ease-out group-hover:scale-[1.8]" />
                    </span>
                    <Icon className="icon-glyph relative z-10 size-5 transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="border-t border-border/40 pt-6 mt-auto relative z-10">
                <ul className="space-y-3">
                  {step.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <svg className="size-4 text-primary/60 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Oversized numeral, static — no per-frame cost, purely decorative */}
              <div className="absolute -bottom-4 -right-2 text-[7rem] font-black leading-none text-foreground/3 select-none pointer-events-none">
                {step.stepNum}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .card-perf {
          will-change: transform;
        }
        .card-glow {
          box-shadow: 0 24px 48px -12px hsl(var(--primary) / 0.18);
          background: radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.06), transparent 70%);
        }
      `}</style>
    </section>
  )
}