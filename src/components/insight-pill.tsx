import type { MatchReason } from "@/lib/matching";

const toneClasses = {
  success: "border-[#35e6a5]/25 bg-[#35e6a5]/10 text-[#b7ffe4]",
  primary: "border-[#4f8cff]/25 bg-[#4f8cff]/10 text-[#cfe0ff]",
  warning: "border-[#ffb86b]/25 bg-[#ffb86b]/10 text-[#ffe1bd]",
  danger: "border-[#ff5c7a]/25 bg-[#ff5c7a]/10 text-[#ffc2cc]",
  muted: "border-white/10 bg-white/5 text-white/62",
};

export default function InsightPill({ reason }: { reason: MatchReason }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${toneClasses[reason.tone]}`}>
      <span className="font-medium text-white/85">{reason.label}</span>
      {reason.points > 0 && <span className="text-white/35">+{reason.points}</span>}
    </span>
  );
}
