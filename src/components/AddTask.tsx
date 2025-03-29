'use client'

import { useState } from "react"
import { useTaskStore } from "@/store/useTaskStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addDays, format } from "date-fns"

export function AddTask() {
    const [title, setTitle] = useState("")
    const [dueDate, setDueDate] = useState(() => {
        // Set default due date to 2 weeks from now
        const twoWeeksFromNow = addDays(new Date(), 14)
        return format(twoWeeksFromNow, "yyyy-MM-dd'T'HH:mm")
    })
    const { addTask, categories } = useTaskStore()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        addTask({
            title: title.trim(),
            completed: false,
            category: categories[0], // Default to first category
            dueDate
        })
        setTitle("")
        // Reset due date to 2 weeks from now
        setDueDate(format(addDays(new Date(), 14), "yyyy-MM-dd'T'HH:mm"))
    }

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row">
                <Input
                    type="text"
                    placeholder="Add a new task..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1"
                />
                <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full md:w-auto"
                />
                <Button type="submit" className="w-full md:w-auto">
                    Add Task
                </Button>
            </div>
        </form>
    )
}
