'use client'

import { useTaskStore } from "@/store/useTaskStore"
import versionData from "@/data/version.json"

export function Footer() {
    const tasks = useTaskStore(state => state.tasks)
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length

    return (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl">
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                    {/* Left section with task stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <p>Total tasks: {totalTasks}</p>
                        <p>Completed: {completedTasks}</p>
                        <p>Open: {totalTasks - completedTasks}</p>
                    </div>
                    {/* Center section with copyright */}
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                        <p>© {versionData.year} {versionData.author}</p>
                        <span className="text-border">•</span>
                        <p>v{versionData.version}</p>
                    </div>
                    {/* Right section with tech stack */}
                    <div className="text-sm text-muted-foreground">
                        Made with Next.js and shadcn/ui
                    </div>
                </div>
            </div>
        </footer>
    )
}
