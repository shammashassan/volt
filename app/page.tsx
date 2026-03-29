'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { HeroHeader } from '@/components/header'
import { BentoGrid, BentoCard } from '@/components/bento-grid'
import { categories } from '@/lib/data'
import { 
  Rocket, 
  Component, 
  Zap, 
  Wrench, 
  Palette, 
  Map as MapIcon, 
  Search, 
  Volume2, 
  Bot,
  ArrowRight,
  Globe,
  CheckCircle 
} from 'lucide-react'

// Custom GitHub Icon SVG as it's missing from the local lucide version
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

const ICON_MAP = {
  Rocket: <Rocket className="size-6" />,
  Component: <Component className="size-6" />,
  Zap: <Zap className="size-6" />,
  Wrench: <Wrench className="size-6" />,
  Palette: <Palette className="size-6" />,
  Map: <MapIcon className="size-6" />,
  Search: <Search className="size-6" />,
  Volume2: <Volume2 className="size-6" />,
  Bot: <Bot className="size-6" />,
}

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const

const VARIANTS_ITEM = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      bounce: 0.3,
      duration: 0.6,
    },
  },
} as const

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/30">
      <HeroHeader />
      
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-20 text-center lg:px-12">
        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={VARIANTS_CONTAINER}
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={VARIANTS_ITEM} className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              v2.0 is now live
            </motion.div>

            <motion.div variants={VARIANTS_ITEM}>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-9xl">
                The UI Dev
                <br />
                <span className="bg-linear-to-r from-primary to-primary/40 bg-clip-text text-transparent">
                  Second Brain
                </span>
              </h1>
            </motion.div>

            <motion.div variants={VARIANTS_ITEM} className="max-w-2xl">
              <p className="text-lg text-muted-foreground sm:text-xl lg:text-2xl">
                The ultimate workspace for design engineers. A curated repository of high-fidelity components, visual tools, and interaction patterns.
              </p>
            </motion.div>

            <motion.div variants={VARIANTS_ITEM} className="mt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/explore"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-[transform,shadow,background-color] hover:scale-105 active:scale-95"
              >
                Start Exploring
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border bg-background px-10 text-base font-semibold transition-[background-color,border-color] hover:bg-muted"
              >
                <GitHubIcon className="size-5" />
                Browse Project
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Subtle Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[60px]" />
          <div className="absolute left-0 bottom-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[70px]" />
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Everything for modern UI dev
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Stop searching across a dozen tabs. We've vetted and cataloged the best resources for every stage of your design engineering workflow.
          </p>
        </div>

        <BentoGrid>
          {categories.slice(0, 6).map((cat, idx) => (
            <BentoCard
              key={cat.id}
              title={cat.title}
              description={cat.description}
              icon={ICON_MAP[cat.icon as keyof typeof ICON_MAP]}
              className={idx === 0 || idx === 3 ? "md:col-span-2" : "md:col-span-1"}
            >
              <div className="flex h-full flex-col justify-center p-6 mt-8">
                <div className="flex flex-1 w-full items-center justify-center rounded-2xl bg-white dark:bg-black border border-border/50 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                   {React.cloneElement(ICON_MAP[cat.icon as keyof typeof ICON_MAP] as React.ReactElement<{ className?: string }>, { 
                     className: "size-20 stroke-[1] text-black dark:text-white opacity-80" 
                   })}
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </section>

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
            <div className="relative aspect-square rounded-[2rem] border bg-background p-4 shadow-2xl lg:p-8 overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent" />
              <div className="relative flex h-full flex-col justify-center gap-6 z-10">
                {categories.slice(0, 4).map((cat) => (
                  <div key={cat.id} className="flex items-center gap-4 rounded-2xl border bg-muted/40 p-5 transition-[background-color,transform] hover:bg-muted/80 hover:translate-x-2">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-background text-primary shadow-sm ring-1 ring-border">
                      {ICON_MAP[cat.icon as keyof typeof ICON_MAP]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{cat.title}</h4>
                      <p className="text-sm text-muted-foreground">{cat.description.split('.')[0]}</p>
                    </div>
                  </div>
                ))}
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
            <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
              Join thousands of design engineers using the Second Brain to stay ahead of the UI curve. Curated weekly.
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
              <span className="text-2xl font-bold tracking-tighter">UI Dev Second Brain</span>
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
              © 2026 UI Dev Second Brain. Built for the design engineering community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
