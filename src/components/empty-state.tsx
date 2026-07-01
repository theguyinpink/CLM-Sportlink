import Link from "next/link";

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  resetHref?: string;
  resetLabel?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function EmptyState({
  eyebrow,
  title,
  description,
  resetHref,
  resetLabel = "Réinitialiser les filtres",
  ctaHref,
  ctaLabel,
}: EmptyStateProps) {
  return (
    <div className="premium-card rounded-[30px] px-6 py-8">
      <div className="mb-5 h-1 w-24 origin-left rounded-full bg-gradient-to-r from-[#4f8cff] via-[#00d4ff] to-[#9b5cff] opacity-80" />

      <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
        {eyebrow}
      </p>

      <h3 className="font-display mt-4 text-[2.25rem] uppercase leading-[0.92] text-white">
        {title}
      </h3>

      <p className="mt-4 max-w-2xl text-sm leading-8 text-white/68">
        {description}
      </p>

      {(resetHref || ctaHref) && (
        <div className="mt-7 flex flex-wrap gap-4">
          {resetHref && (
            <Link href={resetHref} className="btn-secondary px-5 py-3 text-sm">
              {resetLabel}
            </Link>
          )}

          {ctaHref && ctaLabel && (
            <Link href={ctaHref} className="btn-primary px-5 py-3 text-sm">
              {ctaLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
