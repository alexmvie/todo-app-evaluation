<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { categories, selectedCategory, addCategory, updateCategory, deleteCategory } from '$lib/stores/categoryStore';
    import { tasks, type Task } from '$lib/stores/taskStore';
    import { showError } from '$lib/utils/notifications';
    import { derived } from 'svelte/store';
    import { dndzone } from 'svelte-dnd-action';
    
    interface EditingCategory {
        index: number;
        value: string;
    }
    
    interface Category {
        id: string;
        name: string;
        color: string;
        index: number;
    }
    
    categories.update((cats: Category[]) => cats.map((cat, i) => ({ ...cat, index: i })));

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D3', '#54C6EB', '#A4D8A4'];
    
    let newCategory = '';
    let editingCategory: EditingCategory | null = null;
    let showCategoryModal = false;
    let showAddInput = false;
    
    // Calculate incomplete tasks per category
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
    
    function handleDndConsider(e: CustomEvent<{ items: Category[] }>) {
        categories.set(e.detail.items.map((item, index) => ({ ...item, index })));
    }

    function handleDndFinalize(e: CustomEvent<{ items: Category[] }>) {
        categories.set(e.detail.items.map((item, index) => ({ ...item, index })));
    }

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
    
    function handleDeleteCategory(category: Category) {
        const taskArray = $tasks as Task[];
        if (taskArray.filter((t: Task) => t.category === category.name).length > 0) {
            showCategoryModal = true;
            return;
        }
        deleteCategory(category.id);
    }

    function setSelectedCategory(category: Category) {
        selectedCategory.set(category.name);
    }
</script>

<div class="categories">
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
    
    <div 
        class="category-list" 
        role="tablist"
        use:dndzone={{items: $categories as Category[], flipDurationMs: 300}}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
    >
        {#each $categories as category (category.id)}
            <div class="category-wrapper" animate:flip={{duration: 300}}>
                {#if editingCategory?.index === $categories.indexOf(category)}
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
        {:else}
            <div class="empty-state">
                <p>No categories found</p>
                <button class="primary-btn" on:click={() => showAddInput = true}>Add your first category</button>
            </div>
        {/each}
    </div>
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
            <button class="primary-btn" on:click={() => showCategoryModal = false}>OK</button>
        </div>
    </div>
{/if}

<style>
    .categories {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: relative;
        z-index: 2;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
        font-weight: 600;
    }

    .new-category-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        background: #f8f9fa;
        color: #228be6;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .new-category-btn:hover {
        background: #e7f5ff;
        transform: scale(1.05);
    }

    .new-category-btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(34, 139, 230, 0.2);
    }

    .category-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .category-wrapper {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 8px;
        cursor: grab;
        transition: all 0.2s ease;
    }

    .category-wrapper:hover {
        background: #f5f5f5;
    }

    .category-item {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        background: #f8f9fa;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        min-height: 3rem;
    }

    .category-item:hover {
        background: #e9ecef;
    }

    .category-item.active {
        background: #4299e1;
        color: white;
    }

    .category-main {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .category-name {
        flex: 1;
        font-weight: 500;
    }

    .category-actions {
        display: flex;
        gap: 0.5rem;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.25rem;
        height: 1.25rem;
        padding: 0 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
        background: #ff6b6b;
        border-radius: 0.25rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .category-item.active .badge {
        background: white;
        color: #4299e1;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        opacity: 0.5;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 0.25rem;
    }

    .category-item:hover .icon-btn {
        opacity: 0.8;
    }

    .icon-btn:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.05);
    }

    .category-item.active .icon-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .add-category {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .primary-btn {
        padding: 0.75rem 1.5rem;
        background: #228be6;
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .primary-btn:hover {
        background: #1c7ed6;
        transform: translateY(-2px);
    }

    input {
        padding: 0.75rem 1rem;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.15s ease;
    }

    input:focus {
        outline: none;
        border-color: #4dabf7;
        box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.2);
    }

    .empty-state {
        padding: 2rem;
        text-align: center;
        color: #868e96;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 0.5rem;
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
        z-index: 100;
    }

    .modal {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        max-width: 24rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal h3 {
        margin: 0 0 1rem 0;
        color: #333;
    }

    .modal p {
        margin: 0 0 1.5rem 0;
        color: #495057;
    }
</style>
