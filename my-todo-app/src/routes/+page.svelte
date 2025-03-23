<script lang="ts">
  import TaskList from '$lib/components/TaskList.svelte';
  import CategoryList from '$lib/components/CategoryList.svelte';
  import { selectedCategory } from '$lib/stores/categoryStore';
  import Footer from '$lib/components/Footer.svelte';
</script>

<main class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
    <aside class="md:col-span-1">
      <CategoryList />
    </aside>
    <div class="md:col-span-3">
      <TaskList category={$selectedCategory} />
    </div>
  </div>
</main>

<Footer />

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