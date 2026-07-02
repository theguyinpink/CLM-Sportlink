"use client";

import { useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeToggleProps = {
  variant?: "panel" | "navbar";
};

const STORAGE_KEY = "clm-sportlink-theme";
const THEME_EVENT = "clm-sportlink-theme-change";

const options: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: "light", label: "Clair", description: "Interface lumineuse" },
  { value: "dark", label: "Sombre", description: "Contraste premium" },
  { value: "system", label: "Système", description: "Suit ton appareil" },
];

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "dark";

  const saved = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "dark";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;

  return resolved;
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const media = window.matchMedia("(prefers-color-scheme: light)");

  const handleThemeChange = () => {
    const preference = getStoredTheme();
    applyTheme(preference);
    callback();
  };

  const handleSystemChange = () => {
    if (getStoredTheme() === "system") handleThemeChange();
  };

  window.addEventListener("storage", handleThemeChange);
  window.addEventListener(THEME_EVENT, handleThemeChange);
  media.addEventListener("change", handleSystemChange);

  return () => {
    window.removeEventListener("storage", handleThemeChange);
    window.removeEventListener(THEME_EVENT, handleThemeChange);
    media.removeEventListener("change", handleSystemChange);
  };
}

function setPreference(nextTheme: ThemePreference) {
  window.localStorage.setItem(STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 13.2A8.5 8.5 0 0 1 10.8 3 7 7 0 1 0 21 13.2Z" />
    </svg>
  );
}

export default function ThemeToggle({ variant = "panel" }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => "dark" as ThemePreference);
  const resolvedTheme = resolveTheme(theme);

  function toggleNavbarTheme() {
    setPreference(resolvedTheme === "dark" ? "light" : "dark");
  }

  if (variant === "navbar") {
    const nextLabel = resolvedTheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre";

    return (
      <button
        type="button"
        onClick={toggleNavbarTheme}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white transition hover:border-[#4f8cff]/35 hover:bg-[#4f8cff]/10"
        aria-label={nextLabel}
        title={nextLabel}
      >
        {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
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
              onClick={() => setPreference(option.value)}
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
