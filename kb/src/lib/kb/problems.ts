// How one big ticket splits into the problems it really holds.
//
// causes.ts groups reports by cause: what the shared parser does to a date.
// desk-notes.json records the reports the desk read as one-day moves instead.
//
// Those are different bugs. A month/day swap moves a date by months; a one-day
// move moves it by one day. Fixing the parser does not fix a one-day move, so
// they need tickets of their own. This file splits the merged reports into
// those problems and counts them.
//
// Words for the rows live in the page, not here: this file only counts.

import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = {
  cause: Cause | 'one-day-move';
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  taggedAs: Record<string, number>;
  // The cause the desk's tenant rule filed these under, before the desk's notes.
  filedUnder: Cause | 'unplaced';
};

const seen = (reports: Report[]): string[] =>
  reports.map((r) => r.receivedAt.slice(0, 10)).sort();

const summarize = (
  cause: Problem['cause'],
  reports: Report[],
  filedUnder: Problem['filedUnder'],
): Problem => {
  const days = seen(reports);
  return {
    cause,
    reports,
    tenants: new Set(reports.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    taggedAs: reports.reduce<Record<string, number>>(
      (n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }),
      {},
    ),
    filedUnder,
  };
};

// Split the reports merged into one ticket into the problems it holds.
//
// The desk's cause rule (causes.ts) files each report by its tenant, its
// booking form and its channel. The desk's notes (desk-notes.json) move some
// of those reports out: the desk read them as one-day moves, which is a
// different bug from a month/day swap.
export function problemsFor(
  merged: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): Problem[] {
  const oneDay = new Set(oneDayMove);
  const rest: Report[] = [];
  const moved: Report[] = [];

  for (const r of merged) {
    (oneDay.has(r.id) ? moved : rest).push(r);
  }

  const byCause = new Map<Problem['cause'], Report[]>();
  for (const r of rest) {
    const cause = causeOf(r, tenantOf(r)) ?? 'unplaced';
    byCause.set(cause, [...(byCause.get(cause) ?? []), r]);
  }

  const problems: Problem[] = [...byCause.entries()].map(([cause, reports]) =>
    summarize(cause, reports, cause),
  );

  if (moved.length) {
    // Filed by the tenant rule under a cause the desk did not mean.
    const filedUnder = (moved[0] ? causeOf(moved[0], tenantOf(moved[0])) : null) ?? 'unplaced';
    problems.push(summarize('one-day-move', moved, filedUnder));
  }

  return problems.sort((a, b) => b.reports.length - a.reports.length);
}
