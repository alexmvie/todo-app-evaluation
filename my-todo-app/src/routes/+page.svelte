<script lang="ts">
  import CategoryList from '$lib/components/CategoryList.svelte';
  import TaskList from '$lib/components/TaskList.svelte';
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <CategoryList />
  <TaskList />
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