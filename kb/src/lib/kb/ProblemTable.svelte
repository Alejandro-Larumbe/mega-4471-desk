<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsFor } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));

  // The problems the ticket holds, counted the way the desk counts them.
  const problems = $derived(problemsFor(merged, tenantOf, notes.oneDayMove));

  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong>
  {problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.cause)}
      <tr>
        <td><code>{p.cause}</code></td>
        <td>{p.reports.length}</td>
        <td class="tags">{tags(p)}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
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
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
