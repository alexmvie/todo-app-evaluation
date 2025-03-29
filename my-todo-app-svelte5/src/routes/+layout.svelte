<script lang="ts">
	import '../app.css';
    import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
    <main class="flex-grow">
        {@render children()}
    </main>
    <Footer />
</div>

<style>
    :global(html) {
        height: 100%;
    }
    :global(body) {
        min-height: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
