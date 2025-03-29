'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Task } from "@/types/task"
import { Pencil, Trash2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface TaskCardProps {
    task: Task
    toggleTask: (id: string) => void
    editTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
}

export function TaskCard({
    task,
    toggleTask,
    editTask,
    deleteTask
}: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDueDate, setNewDueDate] = useState<Date | undefined>(
        task.dueDate ? new Date(task.dueDate) : undefined
    )
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

    const handleEdit = () => {
        setIsEditing(true)
        setNewTitle(task.title)
        setNewDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    }

    const handleSave = () => {
        if (newTitle.trim()) {
            editTask(task.id, {
                title: newTitle,
                dueDate: newDueDate ? newDueDate.toISOString() : undefined
            })
        }
        setIsEditing(false)
        setNewTitle('')
    }

    const handleCancel = () => {
        setIsEditing(false)
        setNewTitle('')
        setNewDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set'
        return new Date(dateStr).toLocaleDateString()
    }

    return (
        <div
            className={cn(
                "relative group rounded-lg overflow-hidden border",
                task.completed ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-white"
            )}
        >
            <div className="p-4">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter task title..."
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Due Date
                            </label>
                            <Popover
                                open={isDatePickerOpen}
                                onOpenChange={setIsDatePickerOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !newDueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newDueDate ? format(newDueDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={newDueDate}
                                        onSelect={(date) => {
                                            setNewDueDate(date)
                                            setIsDatePickerOpen(false)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="space-y-1">
                                <h3
                                    className={cn(
                                        "text-lg font-medium",
                                        task.completed ? "line-through text-gray-500" : "text-gray-900"
                                    )}
                                >
                                    {task.title}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>{formatDate(task.createdAt)}</span>
                                    <span>•</span>
                                    <span>{formatDate(task.dueDate)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                className="hover:bg-gray-100"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
