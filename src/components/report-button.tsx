"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createContentReportFromClient } from "@/app/report-actions";

type ReportButtonProps = {
  targetType: "post" | "comment" | "club_offer" | "player_profile" | "club";
  targetId: string;
  label?: string;
  compact?: boolean;
};

const reasons = [
  { value: "fake_content", label: "Contenu faux" },
  { value: "inappropriate", label: "Comportement inapproprié" },
  { value: "spam", label: "Spam" },
  { value: "wrong_category", label: "Mauvaise catégorie" },
  { value: "other", label: "Autre" },
];

export default function ReportButton({ targetType, targetId, label = "Signaler", compact = false }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const details = String(formData.get("details") || "").trim();
    const reason = String(formData.get("reason") || "other");

    startTransition(async () => {
      const result = await createContentReportFromClient({
        target_type: targetType,
        target_id: targetId,
        reason,
        details,
        page_url: pathname,
      });

      if (!result.ok) {
        setError(result.error || "Impossible d’envoyer le signalement.");
        return;
      }

      setSuccess(true);
      setTimeout(() => setOpen(false), 850);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] text-sm font-medium text-[color:var(--text-muted)] transition hover:border-red-400/25 hover:text-red-300",
          compact ? "px-3 py-2" : "px-4 py-2.5",
        ].join(" ")}
      >
        {label}
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <form onSubmit={submit} className="relative w-full max-w-lg rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Signalement</p>
                <h3 className="font-display mt-2 text-[1.8rem] leading-tight text-[color:var(--text-main)]">Signaler ce contenu</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ton signalement sera visible dans l’espace admin pour vérifier le contenu.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--text-soft)]">Fermer</button>
            </div>

            <label className="mt-5 block text-sm font-medium text-[color:var(--text-soft)]">Motif</label>
            <select name="reason" defaultValue="wrong_category" className="ui-select mt-2 w-full border px-4 py-3 text-sm">
              {reasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
            </select>

            <label className="mt-4 block text-sm font-medium text-[color:var(--text-soft)]">Détail optionnel</label>
            <textarea name="details" rows={4} maxLength={1000} className="mt-2 w-full rounded-[18px] border px-4 py-3 text-sm" placeholder="Explique rapidement ce qui pose problème..." />

            {error && <p className="mt-4 rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            {success && <p className="mt-4 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Signalement envoyé.</p>}

            <button type="submit" disabled={isPending} className="btn-primary mt-5 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
              {isPending ? "Envoi..." : "Envoyer le signalement"}
            </button>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
