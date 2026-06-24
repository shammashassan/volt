"use client"

import React, { useState, useRef } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface FAQItem {
  question: string
  answer: string
}

export function FaqSection({ startReveal = false }: { startReveal?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useGSAP(() => {
    if (!startReveal) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".faq-header, .faq-item-reveal", {
        opacity: 1,
        y: 0
      })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(".faq-title-reveal, .faq-subtitle-reveal", { opacity: 0, y: 30 })
      gsap.set(".faq-item-reveal", { opacity: 0, y: 40 })

      const timer = setTimeout(() => {
        // Animate headers
        gsap.to([".faq-title-reveal", ".faq-subtitle-reveal"], {
          opacity: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".faq-header",
            start: "top 85%",
            once: true
          }
        })

        // Animate accordion items
        gsap.to(".faq-item-reveal", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".faq-items-trigger",
            start: "top 80%",
            once: true
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    })
  }, { scope: containerRef, dependencies: [startReveal] })

  const faqs: FAQItem[] = [
    {
      question: "What is Volt?",
      answer: "Volt is a personal knowledge operating system designed to act as your digital second brain. Rather than storing information in flat, isolated folders, Volt lets you connect resources, notes, projects, and people through bidirectional links that mimic how your mind actually makes associations."
    },
    {
      question: "Why not use a bookmark manager?",
      answer: "Traditional bookmark managers focus strictly on storing raw links, resulting in long, cluttered lists that are rarely revisited. Volt shifts the focus to curation: it requires context (why you saved it), links elements together, and keeps everything instantly searchable so your saved items turn into active knowledge."
    },
    {
      question: "Is Volt a bookmark manager?",
      answer: "No. While Volt has bookmarking features for cataloging web resources, it is a broader knowledge management platform. You can take markdown notes, tie resources to active projects, link authors/creators, and log your learning watchlists in a unified workspace."
    },
    {
      question: "Can I define my own categories?",
      answer: "Yes, absolutely. Volt is structured as a blank slate. You define the custom categories, tag namespaces, and collection frameworks that suit your specific workflow, rather than being forced into a rigid, predefined database schema."
    },
    {
      question: "How does the Ctrl + K search work?",
      answer: "Volt features a global Command Center accessible anywhere in the app with the Ctrl + K (or Cmd + K) hotkey. It executes a lightning-fast fuzzy search across all resources, categories, notes, projects, and people, letting you navigate your workspace entirely from your keyboard."
    },
    {
      question: "Who is Volt built for?",
      answer: "Volt is designed for developers, researchers, writers, and students—anyone looking to cut through digital noise, preserve structural context for their discoveries, and establish a long-term, self-owned database of knowledge."
    }
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      ref={containerRef}
      id="faq"
      className="mx-auto max-w-4xl px-6 py-24 sm:py-32 border-t border-border/50"
    >
      <div className="faq-header mb-16 text-center">
        <h2 className="faq-title-reveal opacity-0 mb-4 text-4xl font-bold tracking-tight sm:text-6xl text-balance">
          Frequently Asked Questions
        </h2>
        <p className="faq-subtitle-reveal opacity-0 mx-auto max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about Volt's architecture, philosophy, and features.
        </p>
      </div>

      <div className="faq-items-trigger space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              className="faq-item-reveal opacity-0 rounded-2xl border bg-card/30 transition-all duration-300 hover:bg-card/50"
            >
              <button
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-6 text-left font-semibold text-lg md:text-xl text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="size-5 text-primary/70 shrink-0" />
                  {faq.question}
                </span>
                <span className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted transition-colors duration-300">
                  {isOpen ? (
                    <Minus className="size-4 text-foreground" />
                  ) : (
                    <Plus className="size-4 text-foreground" />
                  )}
                </span>
              </button>
              
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 pt-0 text-muted-foreground text-base leading-relaxed md:pl-14">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
