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
      gsap.set(".workflow-header, .workflow-step", {
        opacity: 1,
        y: 0
      })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(".workflow-title-reveal, .workflow-subtitle-reveal", { opacity: 0, y: 30 })
      gsap.set(".workflow-step", { opacity: 0, y: 50 })

      const timer = setTimeout(() => {
        // Animate headers
        gsap.to([".workflow-title-reveal", ".workflow-subtitle-reveal"], {
          opacity: 1,
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

        // Animate steps
        gsap.to(".workflow-step", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
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
      title: "Capture",
      desc: "Instantly save web links, code repositories, quick notes, reminders, key figures, and ongoing projects before they get lost.",
      icon: PlusCircle,
      bullets: ["Quick-save bookmarks", "Jot down text thoughts", "Associate with creators/people"]
    },
    {
      id: "organize",
      stepNum: "02",
      title: "Organize",
      desc: "Assign custom categories, map tags, and establish bidirectional connections so that your entries contextualize each other.",
      icon: GitBranch,
      bullets: ["User-defined structures", "Contextual metadata answers", "Connected relationship maps"]
    },
    {
      id: "retrieve",
      stepNum: "03",
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
        <h2 className="workflow-title-reveal opacity-0 mb-4 text-4xl font-bold tracking-tight sm:text-6xl text-balance">
          Your Knowledge Workflow
        </h2>
        <p className="workflow-subtitle-reveal opacity-0 mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Volt's structure focuses on capturing context cleanly, organizing it custom-fit to your brain, and retrieving it instantly.
        </p>
      </div>

      <div className="workflow-steps-trigger grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className="workflow-step opacity-0 group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border bg-card/30 p-8 shadow-sm transition-[box-shadow,background-color,border-color] duration-300 hover:shadow-md hover:bg-card/50"
            >
              <div className="absolute top-4 right-6 text-7xl font-extrabold text-foreground/5 select-none transition-colors duration-300 group-hover:text-primary/10">
                {step.stepNum}
              </div>

              <div>
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="border-t border-border/40 pt-4 mt-auto">
                <ul className="space-y-2">
                  {step.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
