import { writable, type Writable } from 'svelte/store';
import sampleTasks from '../sample-tasks.json';

// Simple UUID generator
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    category: string;
    dueDate?: string;
    createdAt: string;
}

const tasks: Writable<Task[]> = writable(sampleTasks.tasks);

export function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = {
        ...task,
        id: generateUUID(),
        createdAt: new Date().toISOString()
    };
    tasks.update(tasks => [...tasks, newTask]);
}

export function deleteTask(id: string) {
    tasks.update(tasks => tasks.filter(task => task.id !== id));
}

export function toggleTask(id: string) {
    tasks.update(tasks => tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    }));
}

export function updateTaskTitle(id: string, title: string) {
    tasks.update(tasks => tasks.map(task => {
        if (task.id === id) {
            return { ...task, title };
        }
        return task;
    }));
}

export function updateTaskCategory(oldCategory: string, newCategory: string) {
    tasks.update(tasks => tasks.map(task => {
        if (task.category === oldCategory) {
            return { ...task, category: newCategory };
        }
        return task;
    }));
}

export function updateTaskDueDate(id: string, dueDate: string | undefined) {
    tasks.update(tasks => tasks.map(task => {
        if (task.id === id) {
            return { ...task, dueDate };
        }
        return task;
    }));
}

export function reorderTasks(fromId: string, toId: string) {
    tasks.update(tasks => {
        const fromIndex = tasks.findIndex(task => task.id === fromId);
        const toIndex = tasks.findIndex(task => task.id === toId);
        
        if (fromIndex === -1 || toIndex === -1) return tasks;
        
        const newTasks = [...tasks];
        const [movedTask] = newTasks.splice(fromIndex, 1);
        newTasks.splice(toIndex, 0, movedTask);
        
        return newTasks;
    });
}

// Derived state
export const tasksByCategory = {
    subscribe: tasks.subscribe((tasks) => {
        const categories = ['Work', 'Personal', 'Shopping', 'Health'];
        return new Map(
            categories.map(category => [
                category,
                tasks.filter((task: Task) => task.category === category)
            ])
        );
    })
};

export { tasks };
