"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import CustomSelect from "@/components/custom-select";
import { submitBetaFeedback } from "@/app/feedback-actions";

const inputClass = "w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30";

export default function FeedbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const ratingValue = String(formData.get("rating") || "").trim();
    const result = await submitBetaFeedback({
      category: String(formData.get("category") || "general"),
      rating: ratingValue ? Number(ratingValue) : null,
      page_path: String(formData.get("page_path") || ""),
      message: String(formData.get("message") || ""),
    });

    if (!result.ok) {
      setError(result.error || "Impossible d’envoyer le retour.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setSuccess("Merci, ton retour bêta a bien été envoyé.");
    setLoading(false);
    router.refresh();
  }

  return (
    <main className="space-y-10">
      <section className="max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#35e6a5]">Bêta privée</p>
        <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.8rem] lg:text-[5.7rem]">
          Faire un
          <br />
          retour
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
          Signale un bug, une gêne mobile, une idée ou une amélioration. Tous les retours arrivent dans l’admin pour préparer la bêta.
        </p>
      </section>

      {error ? <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">{error}</div> : null}
      {success ? <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-300">{success}</div> : null}

      <form onSubmit={handleSubmit} className="premium-card grid gap-7 rounded-[34px] p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <CustomSelect
            name="category"
            label="Type de retour"
            defaultValue="bug"
            options={[
              { value: "bug", label: "Bug" },
              { value: "mobile", label: "Problème mobile" },
              { value: "design", label: "Design / lisibilité" },
              { value: "feature", label: "Idée de fonctionnalité" },
              { value: "general", label: "Retour général" },
            ]}
          />

          <CustomSelect
            name="rating"
            label="Ressenti global"
            defaultValue="4"
            options={[
              { value: "5", label: "5 — Excellent" },
              { value: "4", label: "4 — Très bien" },
              { value: "3", label: "3 — Correct" },
              { value: "2", label: "2 — À améliorer" },
              { value: "1", label: "1 — Bloquant" },
            ]}
          />

          <div>
            <label className="mb-2 block text-sm text-white/55">Page concernée</label>
            <input name="page_path" placeholder="Ex : /app/joueur/opportunites" className={inputClass} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm text-white/55">Ton retour</label>
            <textarea
              name="message"
              required
              rows={9}
              placeholder="Décris ce que tu as vu, ce que tu voulais faire, et ce qui serait mieux selon toi..."
              className="w-full rounded-[28px] border border-white/8 bg-white/[0.02] px-5 py-5 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#4f8cff] via-[#9b5cff] to-[#00d4ff] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#050612] shadow-[0_18px_60px_rgba(79,140,255,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Envoyer le retour bêta"}
          </button>
        </div>
      </form>
    </main>
  );
}
