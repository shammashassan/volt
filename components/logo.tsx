import React from 'react'
import { Command } from 'lucide-react'

export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Command className="size-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">UI Dev</span>
        </div>
    )
}
