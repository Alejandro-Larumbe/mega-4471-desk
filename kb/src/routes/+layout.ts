import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = true;

// The kb pages carry their own frontmatter, and the layout they ask for is named
// in it (`layout: runbook`). The page module's frontmatter is read here so the
// root layout can hand it to that layout.
const pages = import.meta.glob('/src/routes/**/+page.svx');

export const load: LayoutLoad = async ({ route }) => {
  const key = `/src/routes${route.id}/+page.svx`;
  const load_ = pages[key];
  const mod = load_ ? await load_() : undefined;
  const metadata = (mod?.metadata ?? {}) as Record<string, unknown>;
  return { metadata };
};
