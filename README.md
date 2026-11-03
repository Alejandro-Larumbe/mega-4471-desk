# mega-4471-desk

The support desk's own work on ticket **#4471**: the reports that were merged into it, the
problems they really hold, and the kb page that says so.

## What is here

| Path | What it is |
| --- | --- |
| `kb/src/routes/kb/incidents/4471-problems/+page.svx` | The new kb page: signed, with the counts computed at render time |
| `kb/src/lib/kb/problems.ts` | Counts the problems the merged reports hold, the way the desk counts them |
| `kb/src/lib/kb/TicketTable.svelte` | Renders that table, with the ticket filed for each problem |
| `site/` | The kb built: the page as the desk sees it (`site/kb/incidents/4471-problems.html`) |
| `rendered/` | The same built page, at the path the built site serves it from |
| `tools/analyze-4471.mjs` | The same counting, runnable on its own |

The repo's GitHub issues are the desk's tickets: one per problem, each saying how many reports
it covers.

## The problems in #4471

`#4471` was closed as one issue: one fix queued. The reports hold two problems.

| Problem | Reports | Root cause | Ticket |
| --- | ---: | --- | --- |
| `parser` | **379** | The shared parser reads every date month first. A day-first tenant writes the day first, so the month and the day swap. | [issue #4](https://github.com/Alejandro-Larumbe/mega-4471-desk/issues/4) |
| `hint` | **33** | The `booking-v3` form prints `MM/DD/YYYY` under a day-first tenant. Their people type month first, and the form reads it the tenant's way. | [issue #5](https://github.com/Alejandro-Larumbe/mega-4471-desk/issues/5) |

379 + 33 = 412.

The counts are the desk's own: `groupByCause` over the reports merged into the ticket, with the
tenant directory and the report channel, not browser settings.

## Where the counts come from

Two numbers in the export do not survive contact with the data, and both are what the desk's
own table shows:

- **One id, one report.** The ticket system exports in overlapping pages and a report can come
  twice. The counts come from the reports themselves, one id each.
- **`meta.intakeTag` is a guess.** It is what intake guessed from the reporter's browser at the
  moment the report came in. It disagrees with the cause a report is filed under here, as the
  "tagged as" column of the desk's table shows. The tenant, its booking form and the channel
  decide the cause; the tag does not.

## The reports that read differently

Five of the 379 parser ones do not read like month/day swaps. The desk caught them by hand and
wrote them down in `desk-notes.json`: a day moves, and an invite arrives before the booking was
made. They stay counted under `parser`, where the tenant rule files them and where the desk's
own table counts them, and the note travels with that ticket — a month/day fix will not move a
date that is one day out, so they need looking at on their own. That is why there is no third
ticket: the desk files them under `parser` and counts them there.

## Building the kb

```sh
cd kb
npm install
npm run build     # writes kb/build
```

`site/` and `rendered/` are copies of that build.
