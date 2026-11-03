// Runs the desk's own rules from support-kb/src/lib over the #4471 export.
// Mirrors support-kb/src/lib/kb/causes.ts exactly (uniqueById, causeOf, groupByCause, readAs)
// plus the one-day-move correction recorded in support-kb/src/lib/data/desk-notes.json.
//
// Usage: node analyze-4471.mjs <kb-dir> <out.json>

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const kbDir = process.argv[2];
const outFile = process.argv[3];

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

// --- src/lib/kb/causes.ts ---
const DATE_HINT = { 'booking-v2': 'DD/MM/YYYY', 'booking-v3': 'MM/DD/YYYY' };

function dayFirst(locale) {
  const order = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(Date.UTC(2026, 0, 2, 12)))
    .map((p) => p.type);
  return order.indexOf('day') < order.indexOf('month');
}

function causeOf(r, t) {
  if (!t || !dayFirst(t.locale)) return null;
  return r.channel === 'form' && DATE_HINT[t.form].startsWith('MM') ? 'hint' : 'parser';
}

const uniqueById = (reports) => [...new Map(reports.map((r) => [r.id, r])).values()];

function groupByCause(reports, tenantOf) {
  const byCause = new Map();
  for (const r of reports) {
    const cause = causeOf(r, tenantOf(r)) ?? 'unplaced';
    byCause.set(cause, [...(byCause.get(cause) ?? []), r]);
  }
  return [...byCause.entries()]
    .map(([cause, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        cause,
        reports: rs,
        taggedAs: rs.reduce((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        mergedInto: [...new Set(rs.flatMap((r) => (r.mergedInto ? [r.mergedInto] : [])))],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

const readAs = (g, ids) => g.reports.filter((r) => ids.includes(r.id)).length;

// --- src/lib/kb/locales.ts ---
const tenants = {};
for (const f of readdirSync(join(kbDir, 'src/lib/data/tenants'))) {
  const t = readJson(join(kbDir, 'src/lib/data/tenants', f));
  tenants[t.handle] = t;
}
const tenantOf = (r) => tenants[r.tenant];

// --- src/lib/data ---
const raw = readJson(join(kbDir, 'src/lib/data/reports-4471.json'));
const notes = readJson(join(kbDir, 'src/lib/data/desk-notes.json'));

// --- run ---
const unique = uniqueById(raw);
const merged = unique.filter((r) => r.mergedInto === 4471);
const groups = groupByCause(merged, tenantOf);

const oneDayMoveIds = notes.oneDayMove ?? [];
const parser = groups.find((g) => g.cause === 'parser');
const hint = groups.find((g) => g.cause === 'hint');

// readAs() counts the one-day-move reports inside the group they were filed in.
const oneDayMoveInParser = parser ? readAs(parser, oneDayMoveIds) : 0;
const oneDayMoveElsewhere = groups
  .filter((g) => g.cause !== 'parser')
  .map((g) => ({ cause: g.cause, count: readAs(g, oneDayMoveIds) }))
  .filter((x) => x.count > 0);

const oneDayMoveReports = merged.filter((r) => oneDayMoveIds.includes(r.id));

// One ticket per problem, counted the way the desk counts: the one-day-move reports stay
// counted under the cause they are filed in (the desk footnotes them there), so they are part
// of the parser count and not a problem of their own.
const problems = [
  {
    key: 'parser',
    title: 'The shared parser reads day-first dates month first',
    count: parser ? parser.reports.length : 0,
    detail:
      'The shared parser reads every date month first; a day-first tenant writes the day first, so the month and the day swap.',
    oneDayMoveInside: oneDayMoveInParser,
  },
  {
    key: 'hint',
    title: 'The booking-v3 form prints MM/DD/YYYY to day-first tenants',
    count: hint ? hint.reports.length : 0,
    detail:
      'Through the booking-v3 form, the tenant types what the printed hint tells them (month first) and the form reads it the tenant’s way. A different fix from the parser bug.',
    oneDayMoveInside: 0,
  },
];

const result = {
  exportedRows: raw.length,
  uniqueReports: unique.length,
  duplicateIds: raw.length - unique.length,
  mergedInto4471: merged.length,
  tenantsOnFile: Object.keys(tenants).length,
  tenantLocales: Object.fromEntries(Object.entries(tenants).map(([h, t]) => [h, `${t.locale}/${t.form}`])),
  groups: groups.map((g) => ({
    cause: g.cause,
    reports: g.reports.length,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    taggedAs: g.taggedAs,
    channels: g.reports.reduce((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    forms: g.reports.reduce((n, r) => ({ ...n, [tenants[r.tenant].form]: (n[tenants[r.tenant].form] ?? 0) + 1 }), {}),
    oneDayMove: readAs(g, oneDayMoveIds),
  })),
  oneDayMove: {
    ids: oneDayMoveIds,
    filedInParser: oneDayMoveInParser,
    elsewhere: oneDayMoveElsewhere,
    tenants: oneDayMoveReports.map((r) => r.tenant),
    note: 'Counted under the cause they are filed in, footnoted there. Not a problem of its own.',
  },
  problems: problems.map((p) => ({ ...p, count: p.count })),
  totalCovered: problems.reduce((n, p) => n + p.count, 0),
};

writeFileSync(outFile, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
