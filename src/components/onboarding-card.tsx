type Check = {
  label: string;
  done: boolean;
};

type OnboardingCardProps = {
  title: string;
  description: string;
  score: number;
  checks: Check[];
  ctaHref?: string;
  ctaLabel?: string;
  compact?: boolean;
};

export default function OnboardingCard({
  title,
  description,
  score,
  checks,
  ctaHref,
  ctaLabel,
  compact = false,
}: OnboardingCardProps) {
  const missing = checks.filter((check) => !check.done).slice(0, compact ? 2 : 3);
  const visibleChecks = compact ? checks.slice(0, 4) : checks.slice(0, 6);

  if (compact) {
    return (
      <section className="premium-card rounded-[26px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-dim)]">Onboarding</p>
              <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-3 py-1 text-xs font-semibold text-[#4f8cff]">
                {score}% complété
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[color:var(--text-main)] sm:text-2xl">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-muted)]">
              {description}
              {missing.length > 0 ? ` À compléter : ${missing.map((item) => item.label).join(", ")}.` : ""}
            </p>
          </div>

          {ctaHref && ctaLabel && (
            <a href={ctaHref} className="inline-flex shrink-0 rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-4 py-2.5 text-sm font-bold text-[#050612]">
              {ctaLabel}
            </a>
          )}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4f8cff] via-[#9b5cff] to-[#00d4ff]"
            style={{ width: `${Math.max(8, Math.min(100, score))}%` }}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {visibleChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs">
              <span className={check.done ? "h-2 w-2 rounded-full bg-[#35e6a5]" : "h-2 w-2 rounded-full bg-[#ffb86b]"} />
              <span className={check.done ? "text-[color:var(--text-muted)]" : "text-[color:var(--text-main)]"}>{check.label}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="premium-card rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Onboarding</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.9] text-white">{title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">{description}</p>
        </div>

        <div className="rounded-[26px] border border-[#4f8cff]/30 bg-[#4f8cff]/10 px-5 py-4 text-center">
          <p className="font-display text-[2.8rem] leading-none text-white">{score}%</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#8bb7ff]">complété</p>
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4f8cff] via-[#9b5cff] to-[#00d4ff]"
          style={{ width: `${Math.max(8, Math.min(100, score))}%` }}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {checks.slice(0, 6).map((check) => (
          <div key={check.label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm">
            <span className={check.done ? "h-2.5 w-2.5 rounded-full bg-[#35e6a5]" : "h-2.5 w-2.5 rounded-full bg-[#ffb86b]"} />
            <span className={check.done ? "text-white/72" : "text-white"}>{check.label}</span>
          </div>
        ))}
      </div>

      {missing.length > 0 && (
        <p className="mt-5 text-sm leading-7 text-white/55">
          À améliorer maintenant : {missing.map((item) => item.label).join(", ")}.
        </p>
      )}

      {ctaHref && ctaLabel && (
        <a href={ctaHref} className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612]">
          {ctaLabel}
        </a>
      )}
    </section>
  );
}
