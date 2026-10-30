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
    >
      <Search className="mr-2 size-4" />
      Open Command Center
    </Button>
  )
}
