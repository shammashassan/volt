"use client"

import React from 'react'
import { BentoGrid, BentoCard } from '@/components/bento-grid'
import { categories } from '@/lib/data'
import { ICON_MAP } from '@/lib/icons'

export function FeatureGrid() {
  return (
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
        {categories.map((cat, idx) => {
          const Icon = ICON_MAP[cat.icon]
          return (
            <BentoCard
              key={cat.id}
              title={cat.title}
              description={cat.description}
              icon={Icon ? <Icon className="size-6" /> : null}
              image={cat.image}
              className={
                [0, 3, 7].includes(idx)
                  ? "md:col-span-2"
                  : "md:col-span-1"
              }
            />
          )
        })}
      </BentoGrid>
    </section>
  )
}
