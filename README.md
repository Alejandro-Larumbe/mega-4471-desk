# mega-4471-desk

The support desk's own work on ticket **#4471**: the 412 reports that were merged into it,
the problems they really hold, and the kb page that says so.

## What is here

| Path | What it is |
| --- | --- |
| `kb/src/routes/kb/incidents/4471-problems/+page.svx` | The new kb page (signed; frontmatter carries the signature, the page ends with `<RenderStamp {signature} />`) |
| `kb/src/lib/kb/problems.ts` | Counts the problems the reports merged into a ticket hold, the way the desk counts them |
| `kb/src/lib/kb/ProblemTable.svelte` | Renders that table, with counts computed from the data |
| `site/` | The kb built: the page as the desk sees it (`site/kb/incidents/4471-problems.html`) |
| `tools/analyze-4471.mjs` | The same analysis, runnable on its own, printing the counts |

The repo's GitHub issues are the desk's tickets: one per problem, each saying how many reports
it covers.

## The problems in #4471

`#4471` was closed as one issue: 412 reports, one fix queued. The reports hold two problems.

| Problem | Reports | Root cause | Fix |
| --- | --- | --- | --- |
| `parser` | **379** | The shared parser reads every date month first. A day-first tenant writes the day first, so the month and the day swap. | Read dates the way the tenant's locale writes them |
| `hint` | **33** | The `booking-v3` form prints `MM/DD/YYYY` under a day-first tenant. Their people type month first, and the form reads it the tenant's way. | The form's printed hint, not the shared parser |

379 + 33 = 412.

The counts are the desk's own: `groupByCause` over the reports merged into the ticket, with the
tenant directory and the report channel, not browser settings.

## Where the counts come from

Two numbers in the export do not survive contact with the data, and both are what the desk's
own table shows:

- **427 rows, 412 reports.** The ticket system exports in overlapping pages and a report can
  come twice. One id, one report.
- **`meta.intakeTag` is a guess.** It is what intake guessed from the reporter's browser at the
  moment the report came in. It disagrees with the cause the report is filed under here: 23 of
  the 379 parser reports are tagged `hint`, and 15 of the 33 hint reports are tagged `parser`.
  The tenant, its booking form and the channel decide the cause; the tag does not.

## The five reports that read differently

Five of the 379 parser reports do not read like month/day swaps. The desk caught them by hand
and wrote them down in `desk-notes.json`: one day moves, and an invite arriving before the
booking was made. They are counted under `parser`, where the tenant rule files them, and the
note travels with that ticket — a month/day fix will not move a date that is one day out, so
they need looking at on their own. The desk's own table footnotes them the same way, which is
why they are not a third ticket: the desk files them under `parser`, and the count the desk
prints for `parser` is 379.

## Building the kb

```sh
cd kb
npm install
npm run build     # writes kb/build
```

`site/` is a copy of that build.
