import type { MatchReason } from "@/lib/matching";

const toneClasses = {
  success: "border-emerald-500/16 bg-emerald-500/8 text-emerald-700 dark:text-emerald-200",
  primary: "border-blue-500/16 bg-blue-500/8 text-blue-700 dark:text-blue-200",
  warning: "border-amber-500/18 bg-amber-500/8 text-amber-700 dark:text-amber-200",
  danger: "border-rose-500/18 bg-rose-500/8 text-rose-700 dark:text-rose-200",
  muted: "border-[color:var(--line)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)]",
};

export default function InsightPill({ reason }: { reason: MatchReason }) {
  return (
    <span className={`ui-pill items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${toneClasses[reason.tone]}`}>
      <span className="font-medium">{reason.label}</span>
      {reason.points > 0 && <span className="opacity-55">+{reason.points}</span>}
    </span>
  );
}
