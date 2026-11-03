<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsFor } from '#lib/kb/problems';

  let {
    ticket,
    tickets = {},
  }: {
    ticket: number;
    // Where each problem is tracked: cause -> the ticket filed for it.
    tickets?: Record<string, string>;
  } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));

  // The problems the ticket holds, counted the way the desk counts them.
  const problems = $derived(problemsFor(merged, tenantOf, notes.oneDayMove));
</script>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>tracked in</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.cause)}
      <tr>
        <td><code>{p.cause}</code></td>
        <td>{p.reports.length}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if tickets[p.cause]}
            <a href={tickets[p.cause]}>the ticket filed for it</a>
          {:else}
            not tracked
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each problems.filter((p) => p.readDifferently > 0) as p (p.cause)}
  <p class="note">
    {p.readDifferently} of these read differently from the cause they are filed under: the desk
    noted them as one-day moves, not month/day swaps. They stay counted under
    <code>{p.cause}</code>, where the desk files them, and the note travels with the ticket.
  </p>
{/each}

<style>
  .note { color: var(--muted); font-size: 0.85em; }
</style>
