"use client";

import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "clm-sportlink-theme";

const options: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: "light", label: "Clair", description: "Interface lumineuse" },
  { value: "dark", label: "Sombre", description: "Contraste premium" },
  { value: "system", label: "Système", description: "Suit ton appareil" },
];

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(preference: ThemePreference) {
  const resolved = preference === "system" ? getSystemTheme() : preference;

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const initialTheme: ThemePreference =
      saved === "light" || saved === "dark" || saved === "system" ? saved : "dark";

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemChange = () => {
      const current = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
      if (current === "system") applyTheme("system");
    };

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  function updateTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  if (!mounted) {
    return (
      <div className="h-[50px] rounded-2xl border border-white/10 bg-white/[0.04]" />
    );
  }

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="grid gap-1.5 sm:grid-cols-3">
        {options.map((option) => {
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateTheme(option.value)}
              className={[
                "rounded-2xl px-4 py-3 text-left transition",
                active
                  ? "bg-[#4f8cff] text-[#07080f] shadow-lg shadow-[#4f8cff]/25"
                  : "text-white/70 hover:bg-white/8 hover:text-white",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span
                className={[
                  "mt-1 block text-[11px] leading-4",
                  active ? "text-[#07080f]/70" : "text-white/40",
                ].join(" ")}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
