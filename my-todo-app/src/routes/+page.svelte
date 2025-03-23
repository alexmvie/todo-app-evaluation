<script lang="ts">
  // Import the Task type definition from our types file
  import type { Task } from '$lib/types';
  import { fade, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // State variables using Svelte 5 runes
  let newTask = $state('');
  let newCategory = $state('');
  let selectedCategory = $state('personal');
  let categories = $state(['personal', 'work', 'shopping', 'health']);
  let tasks = $state<Task[]>([]);
  let editingCategory = $state<{index: number, value: string} | null>(null);
  let showCategoryModal = $state(false);
  
  // Category management functions
  function addCategory() {
    if (newCategory.trim() === '') return;
    const categoryValue = newCategory.trim().toLowerCase();
    if (categories.includes(categoryValue)) {
      showError('This category already exists');
      return;
    }
    categories = [...categories, categoryValue];
    newCategory = '';
  }

  function startEditingCategory(index: number) {
    editingCategory = { index, value: categories[index] };
    showCategoryModal = true;
  }

  function saveEditingCategory() {
    const editing = editingCategory;
    if (!editing) return;
    
    const newValue = editing.value.trim().toLowerCase();
    const { index } = editing;
    
    if (newValue === '') {
      cancelEditingCategory();
      return;
    }

    if (categories.includes(newValue) && categories[index] !== newValue) {
      showError('This category already exists');
      return;
    }

    const oldValue = categories[index];
    categories = categories.map((cat, i) => 
      i === index ? newValue : cat
    );

    // Update tasks with the new category name
    tasks = tasks.map(task =>
      task.category === oldValue ? { ...task, category: newValue } : task
    );

    if (selectedCategory === oldValue) {
      selectedCategory = newValue;
    }

    closeCategoryModal();
  }

  function cancelEditingCategory() {
    closeCategoryModal();
  }

  function closeCategoryModal() {
    showCategoryModal = false;
    editingCategory = null;
  }

  function showError(message: string) {
    // Create a toast notification element
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add entrance animation
    toast.style.animation = 'slideIn 0.3s ease-out';

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function deleteCategory(categoryToDelete: string) {
    if (categories.length <= 1) {
      showError('You must have at least one category');
      return;
    }

    // Move tasks to the first category
    tasks = tasks.map(task =>
      task.category === categoryToDelete ? { ...task, category: categories[0] } : task
    );

    // Remove the category with animation
    categories = categories.filter(cat => cat !== categoryToDelete);

    // Update selected category if needed
    if (selectedCategory === categoryToDelete) {
      selectedCategory = categories[0];
    }
    
    closeCategoryModal();
  }

  // Function that adds a new task to our list
  function addTask() {
    // Don't add empty tasks
    if (newTask.trim() === '') return;
    
    // Create a new task item
    const newTaskItem: Task = {
      id: Date.now(),
      text: newTask,
      done: false,
      category: selectedCategory,
      createdAt: new Date().toISOString()
    };
    
    // Add the new task to our list
    tasks = [...tasks, newTaskItem];
    // Clear the input field after adding
    newTask = '';
  }

  // Delete a task
  function deleteTask(id: number) {
    tasks = tasks.filter(task => task.id !== id);
  }

  // Toggle task completion
  function toggleTask(id: number) {
    tasks = tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    );
  }

  // Add these functions for drag and drop
  function handleDragStart(event: DragEvent, task: Task) {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', JSON.stringify(task));
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  function handleDrop(event: DragEvent, targetCategory: string, dropIndex?: number) {
    event.preventDefault();
    const taskData = event.dataTransfer?.getData('text/plain');
    if (!taskData) return;

    const draggedTask: Task = JSON.parse(taskData);
    
    // Remove task from its current position
    const updatedTasks = tasks.filter(t => t.id !== draggedTask.id);
    
    if (targetCategory !== draggedTask.category) {
      // Moving to a different category
      draggedTask.category = targetCategory;
      tasks = [...updatedTasks, draggedTask];
    } else if (dropIndex !== undefined) {
      // Reordering within the same category
      const categoryTasks = updatedTasks.filter(t => t.category === targetCategory);
      const otherTasks = updatedTasks.filter(t => t.category !== targetCategory);
      
      // Insert at the specified position
      categoryTasks.splice(dropIndex, 0, draggedTask);
      tasks = [...otherTasks, ...categoryTasks];
    }
  }

  function handleTaskDragOver(event: DragEvent, overTask: Task, index: number) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    // Determine if we're dropping above or below the target
    if (event.clientY < midY) {
      target.classList.add('drop-above');
      target.classList.remove('drop-below');
    } else {
      target.classList.add('drop-below');
      target.classList.remove('drop-above');
    }
  }

  function handleTaskDragLeave(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drop-above', 'drop-below');
  }

  function handleTaskDrop(event: DragEvent, targetTask: Task, index: number) {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    // Determine drop position based on mouse position
    const dropIndex = event.clientY < midY ? index : index + 1;
    
    handleDrop(event, targetTask.category, dropIndex);
    target.classList.remove('drop-above', 'drop-below');
  }

  // Derived values using Svelte 5 runes
  const tasksByCategory = $derived(categories.map(category => ({
    category,
    tasks: tasks.filter(task => task.category === category)
  })));

  const totalTasks = $derived(tasks.length);
  const completedTasks = $derived(tasks.filter(task => task.done).length);
  const progress = $derived(totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100));
</script>

<div class="min-h-screen bg-gray-100 py-8 px-4">
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
    <!-- Header with progress -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">My Tasks</h1>
      <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300 ease-in-out"
          style="width: {progress}%"
        ></div>
      </div>
      <p class="text-sm text-gray-600 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
    </div>

    <!-- Category list with modern design -->
    <div class="flex flex-wrap gap-3 mb-6" transition:slide>
      {#each categories as category, i (category)}
        <div
          class="group relative"
          animate:flip={{duration: 300}}
        >
          <button
            class="px-4 py-2 rounded-full {selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-all"
            onclick={() => selectedCategory = category}
          >
            {category}
          </button>
          <div class="absolute right-0 top-0 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onclick={() => startEditingCategory(i)}
              class="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm hover:bg-gray-700"
            >
              ✎
            </button>
          </div>
        </div>
      {/each}
      <form
        class="flex gap-2"
        onsubmit={(e) => {
          e.preventDefault();
          addCategory();
        }}
      >
        <input
          value={newCategory}
          oninput={(e) => newCategory = e.currentTarget.value}
          placeholder="New category..."
          class="px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          type="submit"
          disabled={newCategory.trim() === ''}
          class="w-10 h-10 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all flex items-center justify-center"
        >
          +
        </button>
      </form>
    </div>

    <!-- Category edit modal -->
    {#if showCategoryModal}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        transition:fade
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
        onkeydown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            closeCategoryModal();
          }
        }}
      >
        <button
          class="absolute inset-0 w-full h-full cursor-default"
          aria-label="Close modal"
          onclick={closeCategoryModal}
        ></button>
        <div
          class="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4 relative"
          transition:slide
          role="document"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 id="modal-title" class="text-xl font-semibold">Edit Category</h2>
            <button
              onclick={closeCategoryModal}
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <form
            class="space-y-4"
            onsubmit={(e) => {
              e.preventDefault();
              saveEditingCategory();
            }}
          >
            <input
              value={editingCategory?.value ?? ''}
              oninput={(e) => {
                if (editingCategory) {
                  editingCategory = {
                    index: editingCategory.index,
                    value: e.currentTarget.value
                  };
                }
              }}
              class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category name"
            />
            <div class="flex justify-between">
              <button
                type="button"
                onclick={() => deleteCategory(categories[editingCategory?.index ?? 0])}
                class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
              <div class="flex gap-2">
                <button
                  type="button"
                  onclick={cancelEditingCategory}
                  class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <!-- Add task section -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg">
      <div class="flex gap-2">
        <input
          value={newTask}
          oninput={(e) => newTask = e.currentTarget.value}
          placeholder="Add a new task..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onclick={addTask}
          disabled={newTask.trim() === ''}
          class="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Add
        </button>
      </div>
    </div>

    <!-- Tasks by category -->
    {#each tasksByCategory as { category, tasks }}
      {#if tasks.length > 0}
        <div class="mb-6"
          ondragover={handleDragOver}
          ondrop={(e) => handleDrop(e, category)}
          role="region"
          aria-label={`${category} tasks drop zone`}
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-700 capitalize">{category}</h2>
            <div class="flex gap-2">
              {#if editingCategory?.index === categories.indexOf(category)}
                <div class="flex gap-2">
                  <input
                    value={editingCategory.value}
                    oninput={(e) => {
                      if (editingCategory) {
                        editingCategory = {
                          index: editingCategory.index,
                          value: e.currentTarget.value
                        };
                      }
                    }}
                    class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onclick={saveEditingCategory}
                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onclick={cancelEditingCategory}
                    class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              {:else}
                <div class="flex gap-2">
                  <button
                    onclick={() => startEditingCategory(categories.indexOf(category))}
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => deleteCategory(category)}
                    class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              {/if}
            </div>
          </div>
          <style>
            .drop-above::before {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              top: -2px;
              height: 2px;
              background: #3b82f6;
            }
            .drop-below::after {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              bottom: -2px;
              height: 2px;
              background: #3b82f6;
            }
          </style>
          <ul class="space-y-2">
            {#each tasks as task, i}
              <li class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors cursor-move relative"
                draggable={true}
                ondragstart={(e) => handleDragStart(e, task)}
                ondragover={(e) => handleTaskDragOver(e, task, i)}
                ondragleave={handleTaskDragLeave}
                ondrop={(e) => handleTaskDrop(e, task, i)}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onchange={() => toggleTask(task.id)}
                  class="w-5 h-5 rounded-full border-2 border-gray-300 checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-500"
                />
                <span class="flex-1 {task.done ? 'line-through text-gray-400' : 'text-gray-700'}">
                  {task.text}
                </span>
                <button
                  onclick={() => deleteTask(task.id)}
                  class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                  aria-label="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  @keyframes slideIn {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
</style>