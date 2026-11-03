<script lang="ts">
  import type { Snippet } from 'svelte';
  import Runbook from '#lib/layouts/runbook.svelte';

  let { data, children }: { data: { metadata: Record<string, unknown> }; children: Snippet } = $props();

  const meta = $derived(data.metadata ?? {});
</script>

{#if meta.title}
  <Runbook
    title={(meta.title as string) ?? ''}
    owner={(meta.owner as string) ?? ''}
    status={(meta.status as string) ?? ''}
    reviewed={(meta.reviewed as string | Date) ?? ''}
  >
    {@render children()}
  </Runbook>
{:else}
  {@render children()}
{/if}
