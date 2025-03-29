import { create } from 'zustand'
import { Task } from '@/types/task'
import sampleData from '@/data/sample-tasks.json'
import categoriesData from '@/data/categories.json'

interface TaskStore {
    tasks: Task[]
    categories: string[]
    selectedCategory: string
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
    deleteTask: (id: string) => void
    toggleTask: (id: string) => void
    updateTaskTitle: (id: string, title: string) => void
    updateTaskCategory: (oldCategory: string, newCategory: string) => void
    updateTaskDueDate: (id: string, dueDate: string | undefined) => void
    reorderTasks: (fromId: string, toId: string) => void
    setSelectedCategory: (category: string) => void
    initializeStore: () => void
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    categories: [],
    selectedCategory: '',
    
    initializeStore: () => {
        set({
            tasks: sampleData.tasks,
            categories: categoriesData.categories,
            selectedCategory: categoriesData.categories[0]
        })
    },

    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
            ...task,
            category: state.selectedCategory,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        }]
    })),

    deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
    })),

    toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        )
    })),

    updateTaskTitle: (id, title) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === id ? { ...task, title } : task
        )
    })),

    updateTaskCategory: (oldCategory, newCategory) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.category === oldCategory ? { ...task, category: newCategory } : task
        ),
        categories: state.categories.map(cat =>
            cat === oldCategory ? newCategory : cat
        )
    })),

    updateTaskDueDate: (id, dueDate) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === id ? { ...task, dueDate } : task
        )
    })),

    reorderTasks: (fromId, toId) => set((state) => {
        const tasks = [...state.tasks]
        const fromIndex = tasks.findIndex(t => t.id === fromId)
        const toIndex = tasks.findIndex(t => t.id === toId)
        
        if (fromIndex === -1 || toIndex === -1) return state
        
        const [movedTask] = tasks.splice(fromIndex, 1)
        tasks.splice(toIndex, 0, movedTask)
        
        return { tasks }
    }),

    setSelectedCategory: (category) => set({ selectedCategory: category })
}))
