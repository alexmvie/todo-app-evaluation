'use client'

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl">
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                    {/* Left section with menu */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                    {/* Right section with logo/title */}
                    <div className="flex items-center gap-2">
                        <div className="font-semibold">
                            <span className="text-primary">Todo</span>
                            <span className="text-muted-foreground">App</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
