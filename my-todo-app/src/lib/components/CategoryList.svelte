<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { categories, selectedCategory, addCategory, updateCategory, deleteCategory } from '$lib/stores/categoryStore';
    import { tasks, type Task } from '$lib/stores/taskStore';
    import { showError } from '$lib/utils/notifications';
    import { derived } from 'svelte/store';
    
    interface EditingCategory {
        index: number;
        value: string;
    }
    
    let newCategory = '';
    let editingCategory: EditingCategory | null = null;
    let showCategoryModal = false;
    let showAddInput = false;
    
    // Calculate incomplete tasks per category
    const categoryMap = derived([categories, tasks], ([$categories, $tasks]) => {
        const map = new Map<string, number>();
        const categoryArray = Array.isArray($categories) ? $categories : [];
        for (const category of categoryArray) {
            map.set(
                category,
                $tasks.filter((t: Task) => t.category === category && !t.completed).length
            );
        }
        return map;
    });
    
    function handleAddCategory() {
        if (!newCategory.trim()) {
            showError('Category name cannot be empty');
            return;
        }
        
        const categoryArray = Array.isArray($categories) ? $categories : [];
        if (categoryArray.includes(newCategory.trim())) {
            showError('Category already exists');
            return;
        }
        
        addCategory(newCategory.trim());
        newCategory = '';
        showAddInput = false;
    }
    
    function handleUpdateCategory(index: number) {
        if (!editingCategory) return;
        
        const newName = editingCategory.value.trim();
        if (!newName) {
            showError('Category name cannot be empty');
            return;
        }
        
        const categoryArray = Array.isArray($categories) ? $categories : [];
        if (categoryArray.includes(newName)) {
            showError('Category already exists');
            return;
        }
        
        const oldCategory = categoryArray[index];
        if (oldCategory) {
            updateCategory(oldCategory, newName);
        }
        editingCategory = null;
    }
    
    function handleDeleteCategory(category: string) {
        const taskArray = Array.isArray($tasks) ? $tasks : [];
        if (taskArray.filter((t: Task) => t.category === category).length > 0) {
            showCategoryModal = true;
            return;
        }
        deleteCategory(category);
    }

    function setSelectedCategory(category: string) {
        selectedCategory.set(category);
    }
</script>

<div class="categories">
    <h2>Categories</h2>
    <div class="category-list">
        {#each Array.isArray($categories) ? $categories : [] as category, index (category)}
            <div
                class="category"
                class:active={category === $selectedCategory}
                animate:flip
            >
                {#if editingCategory?.index === index}
                    <input
                        type="text"
                        bind:value={editingCategory.value}
                        on:blur={() => handleUpdateCategory(index)}
                        on:keydown={e => e.key === 'Enter' && handleUpdateCategory(index)}
                        transition:fade
                    />
                {:else}
                    <button
                        class="category-btn"
                        on:click={() => setSelectedCategory(category)}
                    >
                        {category}
                        {#if $categoryMap.get(category)}
                            <span class="badge">{$categoryMap.get(category)}</span>
                        {/if}
                    </button>
                    <div class="actions">
                        <button
                            class="edit-btn"
                            on:click={() => editingCategory = { index, value: category }}
                        >
                            Edit
                        </button>
                        <button
                            class="delete-btn"
                            on:click={() => handleDeleteCategory(category)}
                        >
                            Delete
                        </button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    
    {#if showAddInput}
        <div class="add-category" transition:slide>
            <input
                type="text"
                bind:value={newCategory}
                placeholder="New category name"
                on:keydown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <div class="add-actions">
                <button on:click={handleAddCategory}>Add</button>
                <button on:click={() => showAddInput = false}>Cancel</button>
            </div>
        </div>
    {:else}
        <button
            class="add-btn"
            on:click={() => showAddInput = true}
        >
            Add Category
        </button>
    {/if}
</div>

{#if showCategoryModal}
    <div
        class="modal-overlay"
        transition:fade
        role="dialog"
    >
        <div class="modal">
            <h3>Cannot Delete Category</h3>
            <p>This category contains tasks. Please delete or move all tasks before deleting the category.</p>
            <button on:click={() => showCategoryModal = false}>OK</button>
        </div>
    </div>
{/if}

<style>
    .categories {
        padding: 1rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        color: #333;
    }

    .category-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .category {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .category-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        background: none;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        text-align: left;
        font-size: 1rem;
    }

    .category-btn:hover {
        background: #f0f0f0;
    }

    .active .category-btn {
        background: #e0e0e0;
        font-weight: bold;
    }

    .badge {
        background: #ff4444;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
    }

    .actions {
        display: flex;
        gap: 0.25rem;
    }

    .edit-btn,
    .delete-btn {
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
    }

    .edit-btn {
        background: #4CAF50;
        color: white;
    }

    .delete-btn {
        background: #ff4444;
        color: white;
    }

    .add-category {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .add-actions {
        display: flex;
        gap: 0.5rem;
    }

    .add-btn {
        margin-top: 1rem;
        width: 100%;
        padding: 0.5rem;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    input {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        max-width: 24rem;
    }

    .modal h3 {
        margin: 0 0 1rem 0;
        color: #333;
    }

    .modal p {
        margin: 0 0 1rem 0;
        color: #666;
    }

    .modal button {
        padding: 0.5rem 1rem;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }
</style>
