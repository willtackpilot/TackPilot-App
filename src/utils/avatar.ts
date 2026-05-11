import { C } from '../constants/theme';

/**
 * Deterministic name → avatar color. The same name always maps to the
 * same swatch so a sub renders consistent colors across every screen
 * (Threads list, Threads detail header, People Crew/Customers, and
 * Today's thread mini rows).
 *
 * Palette is brand-adjacent — only C tokens, mixed light/dark with
 * matching text color for legibility. Eight slots so a small team
 * still gets visually distinct avatars without recycling.
 */

type Swatch = { bg: string; text: string };

const PALETTE: Swatch[] = [
  { bg: C.blue, text: '#FFFFFF' },
  { bg: C.green, text: '#FFFFFF' },
  { bg: C.amber, text: '#FFFFFF' },
  { bg: C.ink2, text: '#FFFFFF' },
  { bg: C.blueSoft, text: C.ink },
  { bg: C.greenSoft, text: C.ink },
  { bg: C.amberSoft, text: C.ink },
  { bg: C.inset, text: C.ink2 },
];

export function avatarColors(name: string | null | undefined): Swatch {
  const key = (name ?? '').trim();
  if (!key) return PALETTE[PALETTE.length - 1];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
