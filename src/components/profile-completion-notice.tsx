"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Check = {
  label: string;
  done: boolean;
};

type ProfileCompletionNoticeProps = {
  storageKey: string;
  score: number;
  checks: Check[];
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
};

export default function ProfileCompletionNotice({
  storageKey,
  score,
  checks,
  title,
  description,
  ctaHref,
  ctaLabel,
}: ProfileCompletionNoticeProps) {
  const [hidden, setHidden] = useState(true);
  const missing = checks.filter((check) => !check.done).slice(0, 2);

  useEffect(() => {
    const isDismissed = window.localStorage.getItem(storageKey) === "dismissed";
    setHidden(isDismissed || score >= 100);
  }, [score, storageKey]);

  function dismiss() {
    window.localStorage.setItem(storageKey, "dismissed");
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <aside className="rounded-[26px] border border-[#ffb86b]/25 bg-[#ffb86b]/10 px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#ffd0a0]">
            Profil incomplet · {score}%
          </p>
          <h2 className="mt-2 text-base font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/68">
            {description}
            {missing.length > 0 ? ` À compléter : ${missing.map((item) => item.label).join(", ")}.` : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href={ctaHref} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#07080f] transition hover:opacity-90">
            {ctaLabel}
          </Link>
          <button type="button" onClick={dismiss} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
            Je le ferai plus tard
          </button>
        </div>
      </div>
    </aside>
  );
}
