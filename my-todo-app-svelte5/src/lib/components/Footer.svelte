<script lang="ts">
    import { version } from '$lib/stores/versionStore';
    const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-100 py-6 mt-auto">
    <div class="container mx-auto px-4 text-center text-gray-600">
        <p>© {currentYear} Alexander Mastny. All rights reserved.</p>
        <p class="text-sm mt-1">Version {$version}</p>
    </div>
</footer>
