<script lang="ts">
    import { fade } from 'svelte/transition';
    import { tasks, type Task, updateTaskDueDate, deleteTask, toggleTask } from '$lib/stores/taskStore';
    import { format } from 'date-fns';
    import { derived } from 'svelte/store';

    export let category: string;
    
    function formatDate(date: string | undefined): string {
        if (!date) return '';
        return format(new Date(date), 'MMM d, yyyy h:mm a');
    }

    function handleDueDateChange(task: Task, event: Event) {
        const input = event.target as HTMLInputElement;
        const newDate = input.value ? new Date(input.value).toISOString() : undefined;
        updateTaskDueDate(task.id, newDate);
    }

    const categoryTasks = derived(tasks, ($tasks) => {
        return Array.isArray($tasks) ? $tasks.filter((task: Task) => task.category === category) : [];
    });
</script>

<div class="task-list">
    {#each $categoryTasks as task (task.id)}
        <div
            class="task"
            class:completed={task.completed}
            transition:fade
        >
            <input
                type="checkbox"
                checked={task.completed}
                onclick={() => toggleTask(task.id)}
            />
            <span class="task-title">{task.title}</span>
            <div class="task-metadata">
                <input
                    type="datetime-local"
                    value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
                    onchange={(e) => handleDueDateChange(task, e)}
                    class="due-date-input"
                />
                <span class="due-date">{formatDate(task.dueDate)}</span>
                <button
                    class="delete-btn"
                    onclick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                >
                    ×
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
    .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
    }

    .task {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        background: white;
        border-radius: 0.25rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .task.completed .task-title {
        text-decoration: line-through;
        color: #666;
    }

    .task-title {
        flex: 1;
    }

    .task-metadata {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .due-date-input {
        padding: 0.25rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }

    .due-date {
        color: #666;
        font-size: 0.875rem;
    }

    .delete-btn {
        background: none;
        border: none;
        color: #ff4444;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
    }

    .delete-btn:hover {
        background: #ffeeee;
    }
</style>
