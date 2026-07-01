"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createBetaFeedbackFromClient } from "@/app/feedback-actions";

const types = [
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idée" },
  { value: "design", label: "Design" },
  { value: "question", label: "Question" },
  { value: "other", label: "Autre" },
];

export default function BetaFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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
    setSuccess(false);
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createBetaFeedbackFromClient({
        feedback_type: String(formData.get("feedback_type") || "other"),
        message: String(formData.get("message") || ""),
        rating: Number(formData.get("rating") || 0) || null,
        page_url: pathname,
      });

      if (!result.ok) {
        setError(result.error || "Impossible d’envoyer le retour.");
        return;
      }

      setSuccess(true);
      (event.currentTarget as HTMLFormElement).reset();
      setTimeout(() => setOpen(false), 900);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full border border-[color:var(--line)] bg-[color:var(--text-main)] px-4 py-3 text-sm font-semibold text-[color:var(--bg)] shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
      >
        Retour bêta
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <form onSubmit={submit} className="relative w-full max-w-xl rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Bêta privée</p>
                <h3 className="font-display mt-2 text-[1.9rem] leading-tight text-[color:var(--text-main)]">Donner un retour</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Bug, idée, design, incompréhension : écris-le ici pour améliorer CLM SportLink.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--text-soft)]">Fermer</button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-soft)]">Type</label>
                <select name="feedback_type" defaultValue="bug" className="ui-select mt-2 w-full border px-4 py-3 text-sm">
                  {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-soft)]">Note rapide</label>
                <select name="rating" defaultValue="4" className="ui-select mt-2 w-full border px-4 py-3 text-sm">
                  <option value="5">5 — Très clair</option>
                  <option value="4">4 — Bien</option>
                  <option value="3">3 — Moyen</option>
                  <option value="2">2 — Difficile</option>
                  <option value="1">1 — Bloquant</option>
                </select>
              </div>
            </div>

            <label className="mt-4 block text-sm font-medium text-[color:var(--text-soft)]">Message</label>
            <textarea name="message" rows={5} maxLength={1600} required className="mt-2 w-full rounded-[18px] border px-4 py-3 text-sm" placeholder="Exemple : sur la page opportunités, je ne comprends pas pourquoi..." />

            {error && <p className="mt-4 rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            {success && <p className="mt-4 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Merci, retour envoyé.</p>}

            <button type="submit" disabled={isPending} className="btn-primary mt-5 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
              {isPending ? "Envoi..." : "Envoyer mon retour"}
            </button>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
