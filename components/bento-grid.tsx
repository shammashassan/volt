import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

import Link from "next/link"

interface BentoCardProps {
  children?: React.ReactNode
  className?: string
  title?: string
  description?: string
  icon?: React.ReactNode
  image?: string
  href?: string
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[25rem]", className)}>
      {children}
    </div>
  )
}

export const BentoCard = ({ children, className, title, description, icon, image, href }: BentoCardProps) => {
  const CardContent = (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border bg-background p-6 shadow-sm transition-[box-shadow,background-color,border-color,transform] hover:shadow-md cursor-pointer",
        className
      )}
    >
      <div className="pointer-events-none z-10 flex flex-col gap-1 transition-transform duration-300 group-hover:-translate-y-2">
        {icon && <div className="mb-2 text-primary">{icon}</div>}
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="max-w-full text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 mt-4 h-full w-full overflow-hidden rounded-2xl border bg-muted/50 transition-[background-color,border-color] duration-300 group-hover:bg-muted/80">
        {image && (
          <>
            <img 
              src={image} 
              alt={title} 
              className="absolute inset-0 h-full w-full object-cover opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
          </>
        )}
        <div className="relative h-full w-full p-4">
          {children}
        </div>
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className={cn("block", className)}>
        {CardContent}
      </Link>
    )
  }

  return CardContent
}
