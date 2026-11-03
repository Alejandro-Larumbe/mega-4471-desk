# mega-4471-desk

The support desk's own work on ticket **#4471**: the 412 reports that were merged into it,
split into the problems they actually hold, and the kb page that says so.

## What is here

| Path | What it is |
| --- | --- |
| `kb/src/` | The kb export from the Challenge page, plus the page and logic added for this work |
| `kb/src/routes/kb/incidents/4471-problems/+page.svx` | The new kb page (signed; frontmatter carries the signature, the page ends with `<RenderStamp {signature} />`) |
| `kb/src/lib/kb/problems.ts` | Splits the reports merged into a ticket into the problems they hold |
| `kb/src/lib/kb/ProblemTable.svelte` | Renders that split, with counts computed from the data |
| `site/` | The kb built: the page as the desk sees it (`site/kb/incidents/4471-problems.html`) |
| `tools/analyze-4471.mjs` | The same analysis, runnable on its own, printing the counts |

The repo's GitHub issues are the desk's tickets: one per problem, each saying how many reports
it covers.

## The problems in #4471

`#4471` was closed as one issue: 412 reports, one fix queued. The reports do not agree.

| Problem | Reports | Root cause | Fix |
| --- | --- | --- | --- |
| `parser` | **374** | The shared parser reads every date month first. A day-first tenant writes the day first, so the month and the day swap. | Read dates the way the tenant's locale writes them |
| `hint` | **33** | The `booking-v3` form prints `MM/DD/YYYY` under a day-first tenant. Their people type month first, and the form reads it the tenant's way. | The form's printed hint, not the shared parser |
| `one-day-move` | **5** | Dates land one day out, not a month/day swap. | Its own cause; a month/day fix does not move a date that is one day out |

374 + 33 + 5 = 412.

## Where the counts come from

Two numbers in the export do not survive contact with the data, and both are what the desk's
own table shows:

- **427 rows, 412 reports.** The ticket system exports in overlapping pages and a report can
  come twice. One id, one report.
- **`meta.intakeTag` is a guess.** It is what intake guessed from the reporter's browser at
  the moment the report came in. It disagrees with the cause the report is filed under here
  (the `parser` group holds 23 reports tagged `hint`, the `hint` group holds 15 tagged
  `parser`). The tenant, its booking form and the channel decide the cause; the tag does not.

The desk's `CauseTable` counts the 5 one-day moves inside the `parser` row, because the tenant
rule files them there. `ProblemTable` pulls them into their own row, so the counts add up to
the reports each problem actually covers.

## Building the kb

```sh
cd kb
npm install
npm run build     # writes kb/build
```

`site/` is a copy of that build.
