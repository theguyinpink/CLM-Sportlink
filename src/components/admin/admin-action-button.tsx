"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminActionButtonProps = {
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "danger" | "success";
  action: () => Promise<{ ok: boolean; error?: string }>;
};

function CloseIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function AdminActionButton({
  label,
  title,
  description,
  confirmLabel = "Confirmer",
  variant = "default",
  action,
}: AdminActionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const buttonClass =
    variant === "danger"
      ? "border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/15"
      : variant === "success"
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
        : "border-white/10 bg-white/5 text-white/72 hover:bg-white/8 hover:text-white";

  const confirmClass =
    variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-400"
      : variant === "success"
        ? "bg-emerald-400 text-[#050612] hover:bg-emerald-300"
        : "bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] text-[#050612]";

  function runAction() {
    setError("");

    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setError(result.error || "Action impossible.");
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={["rounded-full border px-3 py-2 text-xs font-medium transition", buttonClass].join(" ")}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8">
          <button
            type="button"
            className="absolute inset-0 bg-[#050612]/88 backdrop-blur-xl"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[34px] border border-white/10 bg-[#0d1020] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.66)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(155,92,255,0.12),transparent_38%)]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Action admin</p>
                  <h2 className="mt-3 font-display text-[2.5rem] uppercase leading-[0.9] text-white">
                    {title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/8"
                  aria-label="Fermer"
                >
                  <CloseIcon />
                </button>
              </div>

              <p className="mt-5 text-sm leading-7 text-white/62">{description}</p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={runAction}
                  disabled={isPending}
                  className={["rounded-full px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60", confirmClass].join(" ")}
                >
                  {isPending ? "Action..." : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
