"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveClubSettingsFromClient } from "@/app/settings-actions";

type ClubSettingsFormProps = {
  club: any;
};

export default function ClubSettingsForm({ club }: ClubSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const result = await saveClubSettingsFromClient({
      contact_email: String(formData.get("contact_email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
    });

    if (!result.ok) {
      setError(result.error || "Impossible d’enregistrer les paramètres.");
      setLoading(false);
      return;
    }

    router.push("/app/club/parametres?message=Paramètres enregistrés");
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
            Contact club
          </p>

          <div className="mt-6 grid gap-7 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">Email de contact</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={club.contact_email || ""}
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/55">Téléphone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={club.phone || ""}
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#4f8cff] px-6 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Enregistrer les paramètres"}
        </button>
      </form>
    </>
  );
}
