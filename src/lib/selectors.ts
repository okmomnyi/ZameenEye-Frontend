import type { CountryData, RiskRegion, SeverityBand } from "../types/risk";
import { bandFor } from "../types/risk";
import type { FilterKey } from "../store/useStore";

// Central match logic shared by the map, filter tabs and alert badge so a region is
// "visible/matched" consistently everywhere. When searchIds is provided (a search is
// active) it overrides the filter entirely.
export function regionMatches(
  r: RiskRegion,
  filter: FilterKey,
  searchIds: Set<string> | null
): boolean {
  if (searchIds) return searchIds.has(r.id);
  if (filter === "all") return true;
  if (filter === "active-alerts") return r.activeAlert;
  return r.riskType === filter;
}

export function allRegions(data: CountryData | null): RiskRegion[] {
  return data ? Object.values(data.regions) : [];
}

export function visibleRegions(
  data: CountryData | null,
  filter: FilterKey,
  searchIds: Set<string> | null
): RiskRegion[] {
  return allRegions(data).filter((r) => regionMatches(r, filter, searchIds));
}

export interface CountrySummary {
  total: number;
  visible: number;
  activeAlerts: number;
  byBand: Record<SeverityBand, number>;
}

// Summary over an explicit region set (ADM1 regions or ADM2 districts, depending on
// the active detail level). `visible`/`activeAlerts` reflect the current filter+search
// combo; band counts are over the whole set.
export function summarizeRegions(
  regions: RiskRegion[],
  filter: FilterKey,
  searchIds: Set<string> | null
): CountrySummary {
  const visible = regions.filter((r) => regionMatches(r, filter, searchIds));
  const byBand: Record<SeverityBand, number> = {
    normal: 0,
    watch: 0,
    warning: 0,
    critical: 0,
  };
  for (const r of regions) byBand[bandFor(r.severity, r.activeAlert).band]++;
  return {
    total: regions.length,
    visible: visible.length,
    activeAlerts: visible.filter((r) => r.activeAlert).length,
    byBand,
  };
}

// Summary for the alert badge + info panel default state (ADM1 level).
export function summarize(
  data: CountryData | null,
  filter: FilterKey,
  searchIds: Set<string> | null
): CountrySummary {
  return summarizeRegions(allRegions(data), filter, searchIds);
}
