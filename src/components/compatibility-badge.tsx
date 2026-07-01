import type { CompatibilityResult } from "@/lib/matching";

const toneClasses = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  primary: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  warning: "border-amber-500/24 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  danger: "border-rose-500/24 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

type CompatibilityBadgeProps = {
  match: Pick<CompatibilityResult, "score" | "label" | "tone">;
  compact?: boolean;
};

export default function CompatibilityBadge({ match, compact = false }: CompatibilityBadgeProps) {
  const tone = toneClasses[match.tone];
  const shortLabel = match.label
    .replace(/compatibilit[eé]\s*/i, "")
    .replace(/excellente/i, "excellent")
    .trim();

  const label = shortLabel || match.label;

  return (
    <div
      className={`inline-flex w-fit min-w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold leading-none ${tone} ${compact ? "" : "sm:text-sm"}`}
    >
      <span className="tabular-nums">{match.score}%</span>
      <span className="opacity-45">•</span>
      <span className="capitalize">{label}</span>
    </div>
  );
}
