"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { savePlayerSettingsFromClient } from "@/app/settings-actions";

type PlayerSettingsFormProps = {
  profile: any;
};

export default function PlayerSettingsForm({ profile }: PlayerSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const result = await savePlayerSettingsFromClient({
      is_public: formData.get("is_public") === "on",
      open_to_opportunities: formData.get("open_to_opportunities") === "on",
      preferred_contact_method: String(formData.get("preferred_contact_method") || "email"),
      contact_email_visible_after_accept:
        formData.get("contact_email_visible_after_accept") === "on",
      phone_visible_after_accept: formData.get("phone_visible_after_accept") === "on",
    });

    if (!result.ok) {
      setError(result.error || "Impossible d’enregistrer les paramètres.");
      setLoading(false);
      return;
    }

    router.push("/app/joueur/parametres?message=Paramètres enregistrés");
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
            Visibilité
          </p>

          <div className="mt-6 space-y-5">
            <label className="flex items-start gap-3 text-sm text-white/78">
              <input
                type="checkbox"
                name="is_public"
                defaultChecked={profile.is_public ?? true}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-white">Profil public</span>
                <span className="mt-1 block text-white/55">
                  Autorise l’affichage de ton profil dans les vues publiques et les listes visibles.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-white/78">
              <input
                type="checkbox"
                name="open_to_opportunities"
                defaultChecked={profile.open_to_opportunities ?? true}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-white">Ouvert aux opportunités</span>
                <span className="mt-1 block text-white/55">
                  Permet aux clubs de te voir comme disponible pour une prise de contact.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
            Contact
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <label className="mb-2 block text-sm text-white/55">
                Méthode de contact préférée
              </label>
              <select
                name="preferred_contact_method"
                defaultValue={profile.preferred_contact_method || "email"}
                className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none"
              >
                <option value="email" className="bg-[#0a0a0a] text-white">
                  Email
                </option>
                <option value="phone" className="bg-[#0a0a0a] text-white">
                  Téléphone
                </option>
              </select>
            </div>

            <label className="flex items-start gap-3 text-sm text-white/78">
              <input
                type="checkbox"
                name="contact_email_visible_after_accept"
                defaultChecked={profile.contact_email_visible_after_accept ?? false}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-white">Partager mon email après acceptation</span>
                <span className="mt-1 block text-white/55">
                  L’email devient visible lorsqu’une demande est acceptée.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-white/78">
              <input
                type="checkbox"
                name="phone_visible_after_accept"
                defaultChecked={profile.phone_visible_after_accept ?? false}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-white">Partager mon téléphone après acceptation</span>
                <span className="mt-1 block text-white/55">
                  Le téléphone devient visible lorsqu’une demande est acceptée.
                </span>
              </span>
            </label>
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
