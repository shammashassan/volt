"use client"

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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

export function HeroSection() {
  return (
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
            Volt v1.0 • The UI Dev's Second Brain
          </motion.div>

          <motion.div variants={VARIANTS_ITEM}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight">
              The ultimate workspace
              <br />
              <span className="bg-linear-to-r from-primary to-primary/40 bg-clip-text text-transparent">
                for design engineers.
              </span>
            </h1>
          </motion.div>

          <motion.div variants={VARIANTS_ITEM} className="max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground sm:text-xl">
              A curated vault to archive, organize, and source production-ready components, interactive animations, and visual tools.
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

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[60px]" />
        <div className="absolute left-0 bottom-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[70px]" />
      </div>
    </section>
  )
}
