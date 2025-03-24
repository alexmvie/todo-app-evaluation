<script lang="ts">
    import { fade } from 'svelte/transition';
    import { tasks, type Task, updateTaskDueDate, deleteTask, toggleTask } from '$lib/stores/taskStore';
    import { format } from 'date-fns';
    import { derived } from 'svelte/store';

    export let category: string;
    
    function formatDate(date: string | undefined): string {
        if (!date) return '';
        try {
            return format(new Date(date), 'MMM d, yyyy h:mm a');
        } catch {
            return '';
        }
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

<div class="task-container">
    <h2>Tasks in {category}</h2>
    <div class="task-list">
        {#each $categoryTasks as task (task.id)}
            <div
                class="task"
                class:completed={task.completed}
                transition:fade
            >
                <div class="task-main">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onclick={() => toggleTask(task.id)}
                    />
                    <span class="task-title">{task.title}</span>
                </div>
                <div class="task-metadata">
                    <div class="due-date-container">
                        <input
                            type="datetime-local"
                            value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
                            onchange={(e) => handleDueDateChange(task, e)}
                            class="due-date-input"
                        />
                        {#if task.dueDate}
                            <span class="due-date">Due: {formatDate(task.dueDate)}</span>
                        {/if}
                    </div>
                    <button
                        class="delete-btn"
                        onclick={() => deleteTask(task.id)}
                        aria-label="Delete task"
                    >
                        ×
                    </button>
                </div>
            </div>
        {:else}
            <div class="empty-state" transition:fade>
                No tasks in this category yet.
            </div>
        {/each}
    </div>
</div>

<style>
    .task-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: relative;
        z-index: 1;
    }

    h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .task {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .task-main {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .task.completed .task-title {
        text-decoration: line-through;
        color: #666;
    }

    .task-title {
        flex: 1;
        font-size: 1rem;
    }

    .task-metadata {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-left: 2rem;
    }

    .due-date-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .due-date-input {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        color: #666;
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
        transition: all 0.2s ease;
    }

    .delete-btn:hover {
        background: #ffeeee;
        transform: scale(1.1);
    }

    .empty-state {
        padding: 2rem;
        text-align: center;
        color: #666;
        background: #f9f9f9;
        border-radius: 0.5rem;
        border: 2px dashed #ddd;
    }
</style>
