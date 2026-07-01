import Link from "next/link";

type PublicHeroProps = {
  eyebrow: string;
  title: string;
  gradientTitle?: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function PublicHero({
  eyebrow,
  title,
  gradientTitle,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: PublicHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/8 bg-white/[0.035] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-120px] top-[-140px] h-[360px] w-[360px] rounded-full bg-[#8fb7ff]/9 blur-[120px]" />
        <div className="absolute bottom-[-140px] left-[-120px] h-[340px] w-[340px] rounded-full bg-[#b9a4ff]/7 blur-[120px]" />
        <div className="absolute bottom-0 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/58">
          <span className="h-1.5 w-1.5 rounded-full bg-[#79e7bd]" />
          {eyebrow}
        </div>

        <h1 className="font-display mt-7 text-[3rem] leading-[0.95] text-white sm:text-[4.6rem] lg:text-[5.6rem]">
          {title}
          {gradientTitle ? (
            <>
              <br />
              <span className="text-gradient-sport">{gradientTitle}</span>
            </>
          ) : null}
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
          {description}
        </p>

        {(primaryHref || secondaryHref) && (
          <div className="mt-9 flex flex-wrap gap-4">
            {primaryHref && primaryLabel ? (
              <Link href={primaryHref} className="btn-primary px-6 py-3 text-sm">
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link href={secondaryHref} className="btn-secondary px-6 py-3 text-sm">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
