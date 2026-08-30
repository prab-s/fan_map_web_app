<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    void goto('/cms', { replaceState: true });
  });
</script>

<svelte:head>
  <title>CMS | Internal Facing</title>
</svelte:head>

<div class="alert alert-info">
  Redirecting to the CMS experience.
</div>
