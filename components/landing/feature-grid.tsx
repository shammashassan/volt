"use client"

import React, { useRef } from 'react'
import { BentoGrid, BentoCard } from '@/components/bento-grid'
import {
  Command,
  Layers,
  ListTodo,
  Network,
  Smartphone
} from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins
gsap.registerPlugin(useGSAP, ScrollTrigger)

const features = [
  {
    id: "command",
    title: "Command Center (Ctrl + K)",
    description: "The core interaction engine of Volt. Press Ctrl + K from anywhere to perform instant fuzzy searches, capture rapid thoughts, navigate categories, and trigger workspace commands entirely via keyboard.",
    icon: Command,
    image: "/images/categories/search.png",
    className: "md:col-span-2"
  },
  {
    id: "graph",
    title: "Interactive Knowledge Graph",
    description: "Visualize and explore your second brain in real-time. Navigate categories and resource nodes organically using physics-based force graphs, and discover smart bidirectional relationships.",
    icon: Network,
    image: "/images/categories/enhance.png",
    className: "md:col-span-1"
  },
  {
    id: "ownership",
    title: "Self-Defined Structure",
    description: "A completely custom structure tailored to you. Start with a clean slate and build your own nested categories, custom collections, and tag namespaces that match your exact mental model.",
    icon: Layers,
    image: "/images/categories/build.png",
    className: "md:col-span-1"
  },
  {
    id: "reminders",
    title: "Checklist & Day Agenda",
    description: "Manage actionable tasks with smart priority filters, seamless transition animations, and a visual daily timeline mapping out your agenda.",
    icon: ListTodo,
    image: "/images/categories/maps.png",
    className: "md:col-span-1"
  },
  {
    id: "pwa",
    title: "Offline PWA & Mobile Share Target",
    description: "Install Volt as a standalone app on iOS or Android. Save webpage links instantly from other mobile apps using the native OS Share Sheet, with full offline caching and dynamic preloading.",
    icon: Smartphone,
    image: "/images/categories/customize.png",
    className: "md:col-span-1"
  }
]

export function FeatureGrid({ startReveal = false }: { startReveal?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!startReveal) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Instant reveal for accessibility
      gsap.set(".grid-header-reveal, .bento-card-reveal", {
        opacity: 1,
        y: 0,
        scale: 1
      })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Set initial styles for animations
      gsap.set(".grid-title-reveal, .grid-subtitle-reveal", { opacity: 0, y: 20 })

      // Small delay to let Next.js rendering and page heights completely settle
      const timer = setTimeout(() => {
        // Animate header with clean fade-in-up reveal
        gsap.to([".grid-title-reveal", ".grid-subtitle-reveal"], {
          opacity: 1,
          y: 0,
          duration: 1.8,
          stagger: 0.22,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".grid-header-reveal",
            start: "top 85%",
            once: true
          }
        })

        // Animate cards individually according to their scroll position
        const cards = gsap.utils.toArray<HTMLElement>(".bento-card-reveal")
        cards.forEach((card) => {
          gsap.fromTo(card, {
            opacity: 0,
            y: 80,
            scale: 0.96
          }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              once: true
            }
          })
        })
      }, 100)

      return () => clearTimeout(timer)
    })
  }, { scope: containerRef, dependencies: [startReveal] })

  return (
    <section
      ref={containerRef}
      id="features"
      className="mx-auto max-w-7xl px-6 py-24 sm:py-32"
    >
      <div className="grid-header-reveal mb-20 text-center">
        <h2 className="grid-title-reveal opacity-0 mb-4 text-4xl font-bold tracking-tight sm:text-6xl will-change-[transform,opacity]">
          Designed for context, not storage
        </h2>
        <p className="grid-subtitle-reveal opacity-0 mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl will-change-[transform,opacity]">
          Volt shifts the focus from hoarding bookmarks to building a connected second brain that keeps your knowledge retrievable.
        </p>
      </div>

      <BentoGrid className="bento-grid-reveal">
        {features.map((feat) => {
          const Icon = feat.icon
          return (
            <BentoCard
              key={feat.id}
              title={feat.title}
              description={feat.description}
              icon={<Icon className="size-6" />}
              image={feat.image}
              priority={feat.id === "command"}
              className={`${feat.className} opacity-0 bento-card-reveal`}
            />
          )
        })}
      </BentoGrid>
    </section>
  )
}
