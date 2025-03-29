<script lang="ts">
    import { dndzone } from 'svelte-dnd-action';
    
    // List of random names
    interface NameItem {
        id: number;
        name: string;
    }

    let names: NameItem[] = [
        { id: 1, name: 'Emma Johnson' },
        { id: 2, name: 'James Wilson' },
        { id: 3, name: 'Sophia Brown' },
        { id: 4, name: 'William Davis' },
        { id: 5, name: 'Olivia Taylor' }
    ];

    // Handle drag and drop
    function handleDndConsider(e: CustomEvent) {
        if (e.detail.items) {
            names = e.detail.items;
        }
    }

    function handleDndFinalize(e: CustomEvent) {
        if (e.detail.items) {
            names = e.detail.items;
        }
    }
</script>

<div class="names-section">
    <div use:dndzone="{{items: names}}" on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}" class="names-grid">
        {#each names as name(name.id)}
            <div class="name-card" data-index={name.id}>
                <div class="name-content">
                    <h3>{name.name}</h3>
                    <p>Draggable person</p>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .names-section {
        padding: 1.5rem 0;
        margin-bottom: 2rem;
        background: #f8f9fa;
        border-radius: 12px;
    }

    .names-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        padding: 1rem;
    }

    .name-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        cursor: grab;
        position: relative;
    }

    .name-card:active {
        cursor: grabbing;
    }

    .name-card[data-index] {
        opacity: 0.5;
    }

    .name-content {
        text-align: center;
    }

    .name-content h3 {
        color: #228be6;
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
    }

    .name-content p {
        color: #6c757d;
        margin: 0;
        font-size: 0.875rem;
    }
</style>
