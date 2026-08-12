const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

/**
 * Cosmetic-only qualifier words layered onto the real tier rank for display
 * fidelity to the design system (e.g. "Tier II — Merit"). Not backed by any
 * API field — admin-renamed or unranked tiers just fall back to the plain
 * tier name, so nothing is ever fabricated for a tier this can't map.
 */
const QUALIFIER: Record<number, string> = { 1: 'Distinction', 2: 'Merit', 3: 'Pass' };

function tierRank(tierName: string): number | null {
  const match = /^Tier\s+(\d+)$/i.exec(tierName.trim());
  return match ? Number(match[1]) : null;
}

/** "Tier 2" -> "Tier II"; anything that doesn't match (e.g. "Not Passing") is returned as-is. */
export function romanTierLabel(tierName: string): string {
  const n = tierRank(tierName);
  return n && ROMAN[n] ? `Tier ${ROMAN[n]}` : tierName;
}

/** "Tier 2" -> "Merit"; null if the name doesn't map to a known rank. */
export function tierQualifier(tierName: string): string | null {
  const n = tierRank(tierName);
  return n ? (QUALIFIER[n] ?? null) : null;
}
