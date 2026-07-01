"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { createBetaFeedbackFromClient } from "@/app/feedback-actions";

const types = [
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idée" },
  { value: "design", label: "Design" },
  { value: "question", label: "Question" },
  { value: "other", label: "Autre" },
];

export default function BetaFeedbackPageForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

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
      form.reset();
    });
  }

  return (
    <form onSubmit={submit} className="premium-card rounded-[28px] p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[color:var(--text-soft)]">Type de retour</label>
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

      <label className="mt-5 block text-sm font-medium text-[color:var(--text-soft)]">Ton retour</label>
      <textarea
        name="message"
        rows={7}
        maxLength={1600}
        required
        className="mt-2 w-full rounded-[18px] border px-4 py-3 text-sm"
        placeholder="Exemple : sur la page opportunités, je ne comprends pas pourquoi..."
      />

      {error && <p className="mt-4 rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {success && <p className="mt-4 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Merci, retour envoyé.</p>}

      <button type="submit" disabled={isPending} className="btn-primary mt-5 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {isPending ? "Envoi..." : "Envoyer mon retour"}
      </button>
    </form>
  );
}
