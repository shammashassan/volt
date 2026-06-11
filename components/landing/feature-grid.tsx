"use client"

import React, { useRef } from 'react'
import { BentoGrid, BentoCard } from '@/components/bento-grid'
import {
  Command,
  GitFork,
  HelpCircle,
  Layers,
  History,
  Sparkles
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
    description: "The primary way to navigate and execute. Search resources, capture quick notes, and trigger actions in milliseconds.",
    icon: Command,
    image: "/images/categories/search.png",
    className: "md:col-span-2"
  },
  {
    id: "connections",
    title: "Connected Relationships",
    description: "Form networks between resources, notes, projects, and people. Knowledge isn't isolated—it grows through connections.",
    icon: GitFork,
    image: "/images/categories/enhance.png",
    className: "md:col-span-1"
  },
  {
    id: "context",
    title: "Context-First Resources",
    description: "Every saved link answers three critical questions: What is this? Why was it saved? Where is it being used?",
    icon: HelpCircle,
    image: "/images/categories/agents.png",
    className: "md:col-span-1"
  },
  {
    id: "ownership",
    title: "User-Owned Structure",
    description: "Start with an empty canvas. You define the categories, tags, and collections that match your unique mental model.",
    icon: Layers,
    image: "/images/categories/build.png",
    className: "md:col-span-2"
  },
  {
    id: "timeline",
    title: "Activity Timeline",
    description: "A chronological footprint of your digital discoveries. Revisit when you saved a resource or added a note.",
    icon: History,
    image: "/images/categories/start.png",
    className: "md:col-span-1"
  },
  {
    id: "associations",
    title: "Smart Recommendations",
    description: "Find related resources instantly based on shared tags, overlapping categories, and linked projects automatically.",
    icon: Sparkles,
    image: "/images/categories/polish.png",
    className: "md:col-span-2"
  }
]

export function FeatureGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Instant reveal for accessibility
      gsap.set(".grid-header-reveal, .bento-card-reveal", {
        opacity: 1,
        y: 0
      })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Set initial styles for animations
      gsap.set(".grid-header-reveal", { opacity: 0, y: 30 })
      gsap.set(".bento-card-reveal", { opacity: 0, y: 40 })

      // Small delay to let Next.js rendering and page heights completely settle
      const timer = setTimeout(() => {
        // Animate header
        gsap.to(".grid-header-reveal", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".grid-header-reveal",
            start: "top 85%",
            once: true
          }
        })

        // Animate cards with stagger
        gsap.to(".bento-card-reveal", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-grid-reveal",
            start: "top 85%",
            once: true
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    })
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      id="features"
      className="mx-auto max-w-7xl px-6 py-24 sm:py-32"
    >
      <div className="grid-header-reveal opacity-0 mb-20 text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Designed for context, not storage
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
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
