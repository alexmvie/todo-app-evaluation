<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { categories, selectedCategory, addCategory, updateCategory, deleteCategory } from '$lib/stores/categoryStore';
    import { tasksByCategory } from '$lib/stores/taskStore';
    import { showError } from '$lib/utils/notifications';
    
    // Local state
    let newCategory = $state('');
    let editingCategory = $state<{index: number, value: string} | null>(null);
    let showCategoryModal = $state(false);
    
    // Calculate incomplete tasks per category
    const incompleteTasks = $derived(new Map(
        Array.from($tasksByCategory.entries()).map(([category, tasks]) => [
            category,
            tasks.filter(task => !task.done).length
        ])
    ));
    
    function handleAddCategory() {
        if (newCategory.trim() === '') return;
        const result = addCategory(newCategory);
        if (!result.success && result.error) {
            showError(result.error);
            return;
        }
        newCategory = '';
    }

    function startEditingCategory(index: number) {
        editingCategory = { index, value: $categories[index] };
        showCategoryModal = true;
    }

    function saveEditingCategory() {
        const editing = editingCategory;
        if (!editing) return;
        
        const oldValue = $categories[editing.index];
        const result = updateCategory(oldValue, editing.value);
        
        if (!result.success && result.error) {
            showError(result.error);
            return;
        }
        
        closeCategoryModal();
    }

    function handleDeleteCategory(categoryToDelete: string) {
        const result = deleteCategory(categoryToDelete);
        if (!result.success && result.error) {
            showError(result.error);
            return;
        }
        closeCategoryModal();
    }

    function closeCategoryModal() {
        showCategoryModal = false;
        editingCategory = null;
    }
</script>

<!-- Category list with modern design -->
<div class="flex flex-wrap gap-3 mb-6" transition:slide>
    {#each $categories as category, i (category)}
        <div
            class="group relative"
            animate:flip={{duration: 300}}
        >
            <button
                class="px-4 py-2 rounded-full {$selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-all flex items-center gap-2"
                onclick={() => $selectedCategory = category}
            >
                <span>{category}</span>
                {#if (incompleteTasks.get(category) ?? 0) > 0}
                    <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {incompleteTasks.get(category)}
                    </span>
                {/if}
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
            handleAddCategory();
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
                        onclick={() => handleDeleteCategory($categories[editingCategory?.index ?? 0])}
                        class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                    <div class="flex gap-2">
                        <button
                            type="button"
                            onclick={closeCategoryModal}
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
