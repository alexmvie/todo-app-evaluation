<!-- Import necessary Svelte transitions and animations -->
<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { categories, selectedCategory, addCategory, updateCategory, deleteCategory } from '$lib/stores/categoryStore';
    import { tasks, type Task } from '$lib/stores/taskStore';
    import { showError } from '$lib/utils/notifications';
    import { derived } from 'svelte/store';
    import { dndzone } from 'svelte-dnd-action';
    
    // Interface for tracking which category is being edited
    interface EditingCategory {
        index: number;
        value: string;
    }
    
    // Define the Category interface to match our store
    interface Category {
        id: string;
        name: string;
        color: string;
        index: number;
    }
    
    // Define a function to update category indices
    const updateCategoryIndices = (categories: Category[]) => {
        // Create a new array to store updated categories
        const updatedCategories = [];
        
        // Loop through each category
        for (let i = 0; i < categories.length; i++) {
            // Get the current category
            const category = categories[i];
            
            // Create a new category object with the index
            const updatedCategory = {
                ...category,  // Keep all existing properties
                index: i      // Add the current index
            };
            
            // Add the updated category to our new array
            updatedCategories.push(updatedCategory);
        }
        
        // Return the new array of updated categories
        return updatedCategories;
    };

    // Update the categories store with the new indices
    categories.update(updateCategoryIndices);

    // short way for the codeblock updateCategoryIndices:
    // categories.update((cats: Category[]) => cats.map((cat, i) => ({ ...cat, index: i })));
    // ---------------------------------------------------------------------------------------------------

    // Array of color options for new categories
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D3', '#54C6EB', '#A4D8A4'];
    
    // Track the state of our UI components
    let newCategory = '';
    let editingCategory: EditingCategory | null = null;
    let showCategoryModal = false;
    let showAddInput = false;
    
    // Create a derived store that calculates incomplete tasks per category
    // This will automatically update when categories or tasks change
    const categoryMap = derived([categories, tasks], ([$categories, $tasks]) => {
        const map = new Map<string, number>();
        const categoryArray = $categories as Category[];
        for (const category of categoryArray) {
            map.set(
                category.name,
                $tasks.filter((t: Task) => t.category === category.name && !t.completed).length
            );
        }
        return map;
    });
    
    // Handle drag and drop consideration (when items are being dragged)
    function handleDndConsider(e: CustomEvent<{ items: Category[] }>) {
        categories.set(e.detail.items.map((item, index) => ({ ...item, index })));
    }

    // Handle drag and drop finalization (when items are dropped)
    function handleDndFinalize(e: CustomEvent<{ items: Category[] }>) {
        categories.set(e.detail.items.map((item, index) => ({ ...item, index })));
    }

    // Handle adding a new category
    function handleAddCategory() {
        if (!newCategory.trim()) {
            showError('Category name cannot be empty');
            return;
        }
        
        const categoryArray = $categories as Category[];
        if (categoryArray.some(cat => cat.name === newCategory.trim())) {
            showError('Category already exists');
            return;
        }
        
        // Generate a temporary ID that will be replaced by the store function
        const tempId = `category-${Date.now()}`;
        addCategory({ id: tempId, name: newCategory.trim(), color: '#FF6B6B', index: categoryArray.length });
        newCategory = '';
        showAddInput = false;
    }
    
    // Handle updating an existing category
    function handleUpdateCategory(index: number) {
        if (!editingCategory) return;
        
        const newName = editingCategory.value.trim();
        if (!newName) {
            showError('Category name cannot be empty');
            return;
        }
        
        const categoryArray = $categories as Category[];
        if (categoryArray.some(cat => cat.name === newName && categoryArray.indexOf(cat) !== index)) {
            showError('Category already exists');
            return;
        }
        
        const oldCategory = categoryArray[index];
        if (oldCategory) {
            updateCategory(oldCategory.id, { ...oldCategory, name: newName });
        }
        editingCategory = null;
    }
    
    // Handle deleting a category
    function handleDeleteCategory(category: Category) {
        const taskArray = $tasks as Task[];
        if (taskArray.filter((t: Task) => t.category === category.name).length > 0) {
            showCategoryModal = true;
            return;
        }
        deleteCategory(category.id);
    }

    // Set the selected category
    function setSelectedCategory(category: Category) {
        selectedCategory.set(category.name);
    }
</script>

<!-- Main categories container -->
<div class="categories">
    <!-- Header section with title and add button -->
    <div class="header">
        <h2>Categories</h2>
        <button 
            class="new-category-btn"
            on:click={() => showAddInput = !showAddInput}
            aria-label={showAddInput ? "Cancel adding category" : "Add new category"}
        >
            {#if showAddInput}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            {/if}
        </button>
    </div>
    
    <!-- Add category input form -->
    {#if showAddInput}
        <div class="add-category" transition:slide>
            <input
                type="text"
                bind:value={newCategory}
                placeholder="New category name"
                on:keydown={e => e.key === 'Enter' && handleAddCategory()}
                aria-label="New category name"
            />
            <button 
                class="primary-btn"
                on:click={handleAddCategory}
            >
                Add
            </button>
        </div>
    {/if}
    
    <!-- Category list container with drag and drop functionality -->
    <div 
        class="category-list" 
        role="tablist"
        use:dndzone={{items: $categories as Category[], flipDurationMs: 300}}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
    >
        {#each $categories as category (category.id)}
            <!-- Individual category item with animation -->
            <div class="category-wrapper" animate:flip={{duration: 300}}>
                {#if editingCategory?.index === $categories.indexOf(category)}
                    <!-- Editing mode -->
                    <div class="edit-container" transition:fade|local>
                        <input
                            type="text"
                            bind:value={editingCategory.value}
                            on:blur={() => handleUpdateCategory($categories.indexOf(category))}
                            on:keydown={e => e.key === 'Enter' && handleUpdateCategory($categories.indexOf(category))}
                            aria-label="Edit category name"
                        />
                        <button 
                            class="save-btn" 
                            on:click={() => handleUpdateCategory($categories.indexOf(category))}
                            aria-label="Save category name"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        </button>
                    </div>
                {:else}
                    <!-- Normal view -->
                    <div
                        class="category-item"
                        class:active={category.name === $selectedCategory}
                        on:click={() => setSelectedCategory(category)}
                        role="tab"
                        aria-selected={category.name === $selectedCategory}
                        aria-label={`Category ${category.name} with ${$categoryMap.get(category.name) || 0} incomplete tasks`}
                        tabindex="0"
                        on:keydown={e => e.key === 'Enter' && setSelectedCategory(category)}
                    >
                        <div class="category-main">
                            <span class="category-name">{category.name}</span>
                            {#if $categoryMap.get(category.name)}
                                <span class="badge" role="status">{$categoryMap.get(category.name)}</span>
                            {/if}
                        </div>
                        <div class="category-actions">
                            <button
                                class="icon-btn edit"
                                on:click|stopPropagation={() => editingCategory = { index: $categories.indexOf(category), value: category.name }}
                                aria-label="Edit category name"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button
                                class="icon-btn delete"
                                on:click|stopPropagation={() => handleDeleteCategory(category)}
                                aria-label="Delete category"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<!-- Modal for confirming category deletion -->
{#if showCategoryModal}
    <div
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm category deletion"
    >
        <div class="modal-content">
            <h3>Warning</h3>
            <p>This category has tasks. Are you sure you want to delete it?</p>
            <div class="modal-actions">
                <button
                    class="secondary-btn"
                    on:click={() => showCategoryModal = false}
                >
                    Cancel
                </button>
                <button
                    class="danger-btn"
                    on:click={() => {
                        deleteCategory($categories[$categories.length - 1].id);
                        showCategoryModal = false;
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .categories {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #1f2937;
    }

    .new-category-btn {
        background: none;
        border: none;
        color: #3b82f6;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.375rem;
        transition: all 0.2s ease;
    }

    .new-category-btn:hover {
        background: #f1f5f9;
    }

    .add-category {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    .add-category input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }

    .primary-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s ease;
    }

    .primary-btn:hover {
        background: #2563eb;
    }

    .category-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .category-wrapper {
        background: white;
        border-radius: 0.375rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .category-item.active {
        background: #f1f5f9;
    }

    .category-item:hover {
        background: #f8fafc;
    }

    .category-main {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .category-name {
        font-weight: 500;
        color: #1f2937;
    }

    .badge {
        background: #3b82f6;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
    }

    .category-actions {
        display: flex;
        gap: 0.5rem;
    }

    .icon-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.375rem;
        transition: all 0.2s ease;
    }

    .icon-btn:hover {
        color: #3b82f6;
    }

    .icon-btn.edit {
        color: #3b82f6;
    }

    .icon-btn.delete {
        color: #ef4444;
    }

    .edit-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
    }

    .edit-container input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }

    .save-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .save-btn:hover {
        background: #2563eb;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        max-width: 300px;
        width: 90%;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }

    .secondary-btn {
        background: none;
        border: 1px solid #e5e7eb;
        color: #1f2937;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .secondary-btn:hover {
        background: #f1f5f9;
    }

    .danger-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .danger-btn:hover {
        background: #dc2626;
    }
</style>
