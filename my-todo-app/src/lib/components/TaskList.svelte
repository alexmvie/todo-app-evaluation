<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { tasks, tasksByCategory, addTask, deleteTask, toggleTask } from '$lib/stores/taskStore';
    import { selectedCategory } from '$lib/stores/categoryStore';
    import type { Task } from '$lib/types';
    
    // Local state
    let newTask = $state('');
    
    function handleAddTask() {
        if (newTask.trim() === '') return;
        addTask(newTask, $selectedCategory);
        newTask = '';
    }

    // Derived values
    const tasksInCategory = $derived($tasksByCategory.get($selectedCategory) ?? []);
    const totalTasks = $derived(tasksInCategory.length);
    const completedTasks = $derived(tasksInCategory.filter(task => task.done).length);
</script>

<!-- Task list header -->
<div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-800 capitalize">{$selectedCategory} Tasks</h1>
    <p class="text-sm text-gray-600 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
</div>

<!-- Add task section -->
<div class="mb-8 bg-gray-50 p-4 rounded-lg">
    <form
        class="flex gap-2"
        onsubmit={(e) => {
            e.preventDefault();
            handleAddTask();
        }}
    >
        <input
            value={newTask}
            oninput={(e) => newTask = e.currentTarget.value}
            placeholder="Add a new task..."
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
            type="submit"
            disabled={newTask.trim() === ''}
            class="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
            Add Task
        </button>
    </form>
</div>

<!-- Task list -->
{#each tasksInCategory as task (task.id)}
    <div
        class="mb-4"
        transition:slide|local
        animate:flip={{duration: 300}}
    >
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
            <input
                type="checkbox"
                checked={task.done}
                onchange={() => toggleTask(task.id)}
                class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span class={task.done ? 'line-through text-gray-400' : 'text-gray-700'}>
                {task.text}
            </span>
            <button
                onclick={() => deleteTask(task.id)}
                class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
            >
                Delete
            </button>
        </div>
    </div>
{/each}
