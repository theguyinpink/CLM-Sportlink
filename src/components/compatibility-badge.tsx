import type { CompatibilityResult } from "@/lib/matching";

const toneClasses = {
  success: "border-[#35e6a5]/35 bg-[#35e6a5]/10 text-[#35e6a5] shadow-[0_0_35px_rgba(53,230,165,0.10)]",
  primary: "border-[#4f8cff]/35 bg-[#4f8cff]/10 text-[#8bb7ff] shadow-[0_0_35px_rgba(79,140,255,0.10)]",
  warning: "border-[#ffb86b]/35 bg-[#ffb86b]/10 text-[#ffc98f] shadow-[0_0_35px_rgba(255,184,107,0.08)]",
  danger: "border-[#ff5c7a]/35 bg-[#ff5c7a]/10 text-[#ff8ba0] shadow-[0_0_35px_rgba(255,92,122,0.08)]",
};

type CompatibilityBadgeProps = {
  match: Pick<CompatibilityResult, "score" | "label" | "tone">;
  compact?: boolean;
};

export default function CompatibilityBadge({ match, compact = false }: CompatibilityBadgeProps) {
  const tone = toneClasses[match.tone];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${tone}`}>
        <span>{match.score}%</span>
        <span className="text-white/45">•</span>
        <span>{match.label}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex min-w-[118px] flex-col items-center rounded-[24px] border px-4 py-3 text-center ${tone}`}>
      <span className="font-display text-[2.4rem] leading-[0.85] text-white">{match.score}%</span>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em]">{match.label}</span>
    </div>
  );
}
