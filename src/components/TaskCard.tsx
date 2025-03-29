'use client'

import { Task } from "@/types/task"
import { useTaskStore } from "@/store/useTaskStore"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface TaskCardProps {
    task: Task
}

export function TaskCard({ task }: TaskCardProps) {
    const { toggleTask, deleteTask } = useTaskStore()

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set'
        return new Date(dateStr).toLocaleString()
    }

    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                        <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="mt-1"
                        />
                        <div className="space-y-1">
                            <p className={`text-sm font-medium leading-none ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Created: {formatDate(task.createdAt)}
                            </p>
                            {task.dueDate && (
                                <p className="text-sm text-muted-foreground">
                                    Due: {formatDate(task.dueDate)}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="text-destructive"
                    >
                        ✕
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
