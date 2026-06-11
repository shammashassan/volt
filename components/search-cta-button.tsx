"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchCTAButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"))
  }

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-6 rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-98 cursor-pointer text-sm"
    >
      <Search className="mr-2 size-4" />
      Open Command Center
    </Button>
  )
}
