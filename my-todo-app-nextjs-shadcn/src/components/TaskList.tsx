'use client'

import { useTaskStore } from "@/store/useTaskStore"
import { TaskCard } from "./TaskCard"
import { AddTask } from "./AddTask"

export function TaskList() {
    const tasks = useTaskStore(state => state.tasks)
    const selectedCategory = useTaskStore(state => state.selectedCategory)

    const filteredTasks = tasks.filter(task => task.category === selectedCategory)

    return (
        <div>
            <AddTask />
            <div className="space-y-4">
                {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
                {filteredTasks.length === 0 && (
                    <p className="text-center text-muted-foreground">
                        No tasks in this category. Add one above!
                    </p>
                )}
            </div>
        </div>
    )
}
