import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { useSearchIndex, searchIdSet } from "../hooks/useSearchIndex";
import { useDisplaySet } from "../hooks/useDisplaySet";
import { summarizeRegions } from "../lib/selectors";

// "{visibleCount} regions/districts · {activeAlertCount} active alerts" for the pieces
// currently on screen (country provinces, a region's districts, or one district) with
// the active filter + search applied. Updates live.
export function AlertBadge() {
  const activeFilter = useStore((s) => s.activeFilter);
  const searchQuery = useStore((s) => s.searchQuery);
  const { fuse } = useSearchIndex();
  const { set, noun } = useDisplaySet();

  const searchIds = useMemo(
    () => searchIdSet(fuse, searchQuery),
    [fuse, searchQuery]
  );

  const summary = useMemo(
    () => summarizeRegions(set, activeFilter, searchIds),
    [set, activeFilter, searchIds]
  );

  const hasAlerts = summary.activeAlerts > 0;

  return (
    <div className="glass flex items-center gap-2 rounded-lg px-3 py-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-[2px] border ${
          hasAlerts
            ? "border-band-critical/60 bg-band-critical"
            : "border-band-normal/60 bg-band-normal"
        }`}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-ink">
        <span className="text-ink">{summary.visible}</span>
        <span className="text-ink-dim"> {noun} · </span>
        <span className={hasAlerts ? "text-band-critical" : "text-ink"}>
          {summary.activeAlerts}
        </span>
        <span className="text-ink-dim"> active alerts</span>
      </span>
    </div>
  );
}
