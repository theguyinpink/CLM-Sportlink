"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type SelectOption = string | { value: string; label: string; disabled?: boolean };

type CustomSelectProps = {
  name: string;
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
};

function normalizeOption(option: SelectOption) {
  if (typeof option === "string") return { value: option, label: option, disabled: false };
  return { value: option.value, label: option.label, disabled: Boolean(option.disabled) };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CustomSelect({
  name,
  label,
  options,
  value,
  defaultValue = "",
  placeholder = "Sélectionner",
  searchPlaceholder = "Rechercher...",
  onChange,
  required,
  disabled,
  className = "",
  buttonClassName = "",
}: CustomSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const normalizedOptions = useMemo(() => options.map(normalizeOption), [options]);
  const currentValue = value ?? internalValue;
  const selected = normalizedOptions.find((option) => option.value === currentValue);

  const filteredOptions = useMemo(() => {
    const q = normalize(query);
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((option) => normalize(`${option.label} ${option.value}`).includes(q));
  }, [normalizedOptions, query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function selectValue(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <label htmlFor={`${id}-button`} className="mb-2 block text-sm text-white/55">
          {label}
        </label>
      ) : null}

      <input type="hidden" name={name} value={currentValue} required={required} />

      <button
        id={`${id}-button`}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-white/10 bg-[#07080f]/92 px-5 py-3 text-left text-sm text-white outline-none transition hover:border-[#4f8cff]/45 hover:bg-[#11172a] focus:border-[#4f8cff]/55 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
      >
        <span className={selected ? "truncate text-white" : "truncate text-white/42"}>
          {selected?.label || placeholder}
        </span>
        <span className={`text-white/45 transition ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-[90] mt-2 overflow-hidden rounded-[24px] border border-white/10 bg-[#090d1a]/98 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/8 p-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder={searchPlaceholder}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#4f8cff]/40"
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const active = option.value === currentValue;
                return (
                  <button
                    key={`${name}-${option.value}-${option.label}`}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => selectValue(option.value)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      active
                        ? "bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] font-semibold text-[#050612]"
                        : "text-white/72 hover:bg-white/[0.06] hover:text-white"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="truncate">{option.label}</span>
                    {active ? <span className="text-xs uppercase tracking-[0.18em]">OK</span> : null}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-5 text-sm text-white/40">Aucun résultat</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
