<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { tasks, tasksByCategory, addTask, deleteTask, toggleTask, reorderTasks } from '$lib/stores/taskStore';
    import { selectedCategory } from '$lib/stores/categoryStore';
    import type { Task } from '$lib/types';
    
    // Local state
    let newTask = $state('');
    
    function handleAddTask() {
        if (newTask.trim() === '') return;
        addTask(newTask, $selectedCategory);
        newTask = '';
    }

    // Drag and drop handlers
    function handleDragStart(event: DragEvent, task: Task) {
        if (!event.dataTransfer) return;
        event.dataTransfer.setData('text/plain', JSON.stringify(task));
        event.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
        
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        
        if (event.clientY < midY) {
            target.classList.add('drop-above');
            target.classList.remove('drop-below');
        } else {
            target.classList.add('drop-below');
            target.classList.remove('drop-above');
        }
    }

    function handleDragLeave(event: DragEvent) {
        const target = event.currentTarget as HTMLElement;
        target.classList.remove('drop-above', 'drop-below');
    }

    function handleDrop(event: DragEvent, targetTask: Task, index: number) {
        event.preventDefault();
        event.stopPropagation();
        
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        
        const taskData = event.dataTransfer?.getData('text/plain');
        if (!taskData) return;
        
        const draggedTask: Task = JSON.parse(taskData);
        const dropIndex = event.clientY < midY ? index : index + 1;
        
        reorderTasks(draggedTask, targetTask.category, dropIndex);
        target.classList.remove('drop-above', 'drop-below');
    }

    function handleListDrop(event: DragEvent) {
        event.preventDefault();
        const taskData = event.dataTransfer?.getData('text/plain');
        if (!taskData) return;
        
        const draggedTask: Task = JSON.parse(taskData);
        reorderTasks(draggedTask, $selectedCategory);
    }

    // Derived values
    const tasksInCategory = $derived($tasksByCategory.get($selectedCategory) ?? []);
    const totalTasks = $derived(tasksInCategory.length);
    const completedTasks = $derived(tasksInCategory.filter(task => task.done).length);
</script>

<style>
    .drop-target.drop-above {
        border-top: 2px solid #3b82f6;
        margin-top: -2px;
    }
    .drop-target.drop-below {
        border-bottom: 2px solid #3b82f6;
        margin-bottom: -2px;
    }
    .drag-handle {
        cursor: grab;
        touch-action: none;
    }
    .drag-handle:active {
        cursor: grabbing;
    }
    .dragging {
        opacity: 0.5;
    }
</style>

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
<div
    class="space-y-2"
    ondragover={handleDragOver}
    ondrop={handleListDrop}
    role="list"
    aria-label="Task list drop zone"
>
    {#each tasksInCategory as task, i (task.id)}
        <div
            class="mb-4"
            transition:slide|local
            animate:flip={{duration: 300}}
            role="listitem"
        >
            <div 
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors relative drop-target"
                draggable={true}
                ondragstart={(e) => {
                    handleDragStart(e, task);
                    e.currentTarget.classList.add('dragging');
                }}
                ondragend={(e) => {
                    e.currentTarget.classList.remove('dragging');
                }}
                ondragover={handleDragOver}
                ondragleave={handleDragLeave}
                ondrop={(e) => handleDrop(e, task, i)}
                role="button"
                tabindex="0"
                aria-label="Drag to reorder task: {task.text}"
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleTask(task.id);
                    }
                }}
            >
                <div class="drag-handle p-1 -ml-1 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9h8M8 15h8" />
                    </svg>
                </div>
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
</div>
