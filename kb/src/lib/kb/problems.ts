// How one big ticket splits into the problems it holds.
//
// This counts the way the desk counts. The desk's cause rule (causes.ts) files
// every report by its tenant, its booking form and its channel: `parser` or
// `hint`. The desk's notes (desk-notes.json) flag a few reports as read
// differently from the cause they are filed under; the desk counts them where
// they are filed and footnotes them there.
//
// So the numbers this file produces are the desk's own numbers: 379 parser,
// 33 hint. The one-day-move reads are reported as a footnote on the parser
// ticket, not as a ticket of their own.
//
// Words for the rows live in the page, not here: this file only counts.

import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = {
  cause: Cause | 'unplaced';
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  taggedAs: Record<string, number>;
  // Reports the desk read differently from the cause they are filed under.
  readDifferently: number;
};

const seen = (reports: Report[]): string[] =>
  reports.map((r) => r.receivedAt.slice(0, 10)).sort();

// The problems the reports merged into one ticket hold, counted the way the
// desk counts them.
export function problemsFor(
  merged: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  readDifferently: readonly string[],
): Problem[] {
  const different = new Set(readDifferently);

  const byCause = new Map<Problem['cause'], Report[]>();
  for (const r of merged) {
    const cause = causeOf(r, tenantOf(r)) ?? 'unplaced';
    byCause.set(cause, [...(byCause.get(cause) ?? []), r]);
  }

  return [...byCause.entries()]
    .map(([cause, reports]) => {
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
        readDifferently: reports.filter((r) => different.has(r.id)).length,
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
