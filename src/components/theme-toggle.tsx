"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("clm-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("clm-theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-xs font-semibold text-[color:var(--text-soft)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--text-main)]"
      aria-label={`Passer en mode ${nextTheme === "dark" ? "sombre" : "clair"}`}
      title={`Mode ${theme === "dark" ? "sombre" : "clair"}`}
    >
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
      <span className="hidden sm:inline">{theme === "dark" ? "Sombre" : "Clair"}</span>
    </button>
  );
}
