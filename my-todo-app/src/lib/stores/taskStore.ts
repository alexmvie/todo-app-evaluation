import { writable, derived } from 'svelte/store';
import type { Task } from '$lib/types';
import sampleData from '$lib/sample-tasks.json';

export const tasks = writable<Task[]>(sampleData.tasks);

export function addTask(text: string, category: string) {
    const newTask: Task = {
        id: Date.now(),
        text,
        done: false,
        category,
        createdAt: new Date().toISOString()
    };
    tasks.update(tasks => [...tasks, newTask]);
}

export function deleteTask(id: number) {
    tasks.update(tasks => tasks.filter(task => task.id !== id));
}

export function toggleTask(id: number) {
    tasks.update(tasks => tasks.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
    ));
}

export function updateTaskCategory(taskId: number, newCategory: string) {
    tasks.update(tasks => tasks.map(task =>
        task.id === taskId ? { ...task, category: newCategory } : task
    ));
}

export function updateTasksCategory(oldCategory: string, newCategory: string) {
    tasks.update(tasks => tasks.map(task =>
        task.category === oldCategory ? { ...task, category: newCategory } : task
    ));
}

export function reorderTasks(draggedTask: Task, targetCategory: string, dropIndex?: number) {
    tasks.update(tasks => {
        // Remove task from its current position
        const updatedTasks = tasks.filter(t => t.id !== draggedTask.id);
        
        if (targetCategory !== draggedTask.category) {
            // Moving to a different category
            draggedTask.category = targetCategory;
            return [...updatedTasks, draggedTask];
        } else if (dropIndex !== undefined) {
            // Reordering within the same category
            const categoryTasks = updatedTasks.filter(t => t.category === targetCategory);
            const otherTasks = updatedTasks.filter(t => t.category !== targetCategory);
            
            // Insert at the specified position
            categoryTasks.splice(dropIndex, 0, draggedTask);
            return [...otherTasks, ...categoryTasks];
        }
        
        return tasks;
    });
}

export const tasksByCategory = derived(tasks, $tasks => {
    const grouped = new Map<string, Task[]>();
    $tasks.forEach(task => {
        const category = task.category;
        if (!grouped.has(category)) {
            grouped.set(category, []);
        }
        grouped.get(category)?.push(task);
    });
    return grouped;
});
