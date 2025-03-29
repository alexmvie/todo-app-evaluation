<script lang="ts">
    // Svelte stores are reactive data containers that can be shared across components
    // The $ prefix is used to access the current value of a store
    // When you use $storeName, Svelte automatically subscribes to the store and updates the value when it changes

    import { fade } from 'svelte/transition';
    import { tasks, type Task, updateTaskDueDate, deleteTask, toggleTask } from '$lib/stores/taskStore';
    import { format } from 'date-fns';
    import { derived, writable } from 'svelte/store';

    export let category: string;
    
    // Create a writable store for the category prop
    const categoryStore = writable<string>(category);
    
    // Update the store when the prop changes
    $: categoryStore.set(category);

    // Format date for display in german format
    function formatDate(date: string | undefined): string {
        if (!date) return '';
        try {
            return format(new Date(date), 'dd. MMM yyyy h:mm a');
        } catch {
            return '';
        }
    }

    // Format date for input elements
    function formatDateForInput(date: string | undefined): string {
        if (!date) return '';
        try {
            const dateObj = new Date(date);
            return dateObj.toISOString().slice(0, 16);
        } catch {
            return '';
        }
    }

    // State for due date editing
    let editingDueDate = false;
    let editingTaskId: string | null = null;

    // Handle due date edit toggle
    function toggleDueDateEdit(task: Task) {
        if (editingTaskId === task.id) {
            editingDueDate = false;
            editingTaskId = null;
        } else {
            editingDueDate = true;
            editingTaskId = task.id;
        }
    }

    // Handle due date change
    function handleDueDateChange(task: Task, event: Event) {
        const input = event.target as HTMLInputElement;
        const newDate = input.value ? new Date(input.value).toISOString() : undefined;
        updateTaskDueDate(task.id, newDate);
        editingDueDate = false;
        editingTaskId = null;
    }

    // Create a derived store that automatically updates when either tasks or category changes
    // The $ prefix is used here in the template to access the current value of the store
    const categoryTasks = derived([tasks, categoryStore], ([allTasks, currentCategory]) => {
        // Safety check to ensure allTasks is an array
        if (!Array.isArray(allTasks)) return [];
        
        // Return only tasks that belong to the current category
        return allTasks.filter(task => task.category === currentCategory);
    });
</script>

<!-- In the template, we use $categoryTasks to access the current value of the store -->
<div class="task-container">
    <h2>Tasks in {category}</h2>
    <div class="task-list">
        {#each $categoryTasks as task (task.id)}
            <!-- 
                The (task.id) is Svelte's key expression. It helps Svelte track which items have changed.
                Similar to React's key prop, but using parentheses instead of a separate key attribute.
            -->
            <div
                class="task"
                class:completed={task.completed}
                transition:fade
            >
                <div class="task-main">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        on:click={() => toggleTask(task.id)}
                    />
                    <span class="task-title">{task.title}</span>
                </div>
                <div class="task-metadata">
                    
                    <div class="due-date-container relative">
                        {#if !editingDueDate || editingTaskId !== task.id}
                            <p class="flex items-center gap-2">
                                Created: {formatDate(task.createdAt)}, Due: {formatDate(task.dueDate)}
                                <button
                                    class="edit-btn"
                                    on:click={() => toggleDueDateEdit(task)}
                                    aria-label="Edit due date"
                                >
                                    ✏️
                                </button>
                            </p>
                        {:else}
                            <div class="flex flex-col">
                                <input
                                    type="datetime-local"
                                    value={formatDateForInput(task.dueDate)}
                                    on:change={(e) => handleDueDateChange(task, e)}
                                    class="due-date-input"
                                />
                                <button
                                    class="mt-2 text-sm text-gray-500 hover:text-gray-700"
                                    on:click={() => toggleDueDateEdit(task)}
                                >
                                    Cancel
                                </button>
                            </div>
                        {/if}
                    </div>
                    <button
                        class="delete-btn"
                        on:click={() => deleteTask(task.id)}
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
        position: relative;
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

    .due-date-container {
        position: relative;
    }

    .edit-btn {
        background: none;
        border: none;
        color: #6b7280;
        font-size: 1.2em;
        cursor: pointer;
        padding: 0;
        margin-left: 4px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .due-date-container:hover .edit-btn {
        opacity: 1;
    }

    .edit-btn:hover {
        color: #111827;
    }

    .due-date-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        line-height: 1.25;
    }

    .due-date-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
</style>
