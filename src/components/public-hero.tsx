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
    <section className="relative overflow-hidden rounded-[42px] border border-white/8 bg-[#0d1020]/46 px-5 py-14 shadow-[0_32px_120px_rgba(0,0,0,0.34)] sm:px-8 sm:py-18 lg:px-12 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-120px] top-[-140px] h-[360px] w-[360px] rounded-full bg-[#4f8cff]/20 blur-[110px]" />
        <div className="absolute bottom-[-140px] left-[-120px] h-[340px] w-[340px] rounded-full bg-[#9b5cff]/16 blur-[110px]" />
        <div className="absolute bottom-0 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#00d4ff]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/58">
          <span className="h-1.5 w-1.5 rounded-full bg-[#35e6a5] shadow-[0_0_16px_rgba(53,230,165,0.8)]" />
          {eyebrow}
        </div>

        <h1 className="font-display mt-7 text-[3.2rem] uppercase leading-[0.86] text-white sm:text-[5.4rem] lg:text-[6.6rem]">
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
