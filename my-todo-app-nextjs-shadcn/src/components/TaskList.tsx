'use client'

import { useEffect } from "react"
import { useTaskStore } from "@/store/useTaskStore"
import { TaskCard } from "./TaskCard"
import { AddTask } from "./AddTask"

export function TaskList() {
    const tasks = useTaskStore(state => state.tasks)
    const selectedCategory = useTaskStore(state => state.selectedCategory)
    const initializeStore = useTaskStore(state => state.initializeStore)
    const toggleTask = useTaskStore(state => state.toggleTask)
    const editTask = useTaskStore(state => state.editTask)
    const deleteTask = useTaskStore(state => state.deleteTask)

    useEffect(() => {
        initializeStore()
    }, [initializeStore])

    const filteredTasks = tasks.filter(task =>
        selectedCategory ? task.category === selectedCategory : true
    )

    if (!selectedCategory) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-4">
            <AddTask />
            <div className="space-y-4">
                {filteredTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        toggleTask={toggleTask}
                        editTask={editTask}
                        deleteTask={deleteTask}
                    />
                ))}
                {filteredTasks.length === 0 && (
                    <p className="text-center text-muted-foreground">
                        No tasks found in this category
                    </p>
                )}
            </div>
        </div>
    )
}
