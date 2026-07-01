"use client";

import { useEffect, useState } from "react";

function scrollToTopQuickly() {
  const start = window.scrollY || document.documentElement.scrollTop || 0;
  if (start <= 0) return;

  const duration = 420;
  const startedAt = performance.now();

  const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

  function animate(now: number) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const nextY = Math.round(start * (1 - easeOutCubic(progress)));
    window.scrollTo(0, nextY);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      window.scrollTo(0, 0);
    }
  }

  requestAnimationFrame(animate);
}

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY > 420);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTopQuickly}
      aria-label="Remonter en haut de la page"
      title="Remonter en haut"
      className={`fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--text-main)] shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--line-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--text-main)]/20 sm:h-11 sm:w-11 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
