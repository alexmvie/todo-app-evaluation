<script lang="ts">
  import TaskList from '$lib/components/TaskList.svelte';
  import CategoryList from '$lib/components/CategoryList.svelte';
  import { selectedCategory } from '$lib/stores/categoryStore';

  import Names from '$lib/components/Names.svelte';
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <Names />
  
  <div class="flex flex-col md:flex-row mt-8">
    <div class="category-column md:w-1/4">
      <div class="sticky-sidebar">
        <CategoryList />
      </div>
    </div>
    <div class="separator"></div>
    <div class="task-column md:w-3/4">
      <TaskList category={$selectedCategory} />
    </div>
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

  .sticky-sidebar {
    position: sticky;
    top: 1rem;
    height: fit-content;
    width: 100%;
  }

  .category-column {
    padding-right: 1rem;
  }

  .separator {
    display: none;
  }

  @media (min-width: 768px) {
    .separator {
      display: block;
      width: 1px;
      background-color: #e5e7eb;
      margin: 0 2rem;
    }
  }

  .task-column {
    padding-left: 1rem;
  }

  @media (max-width: 768px) {
    .category-column, .task-column {
      padding: 0;
      width: 100%;
    }
    
    .category-column {
      margin-bottom: 3rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 2rem;
    }
  }
</style>