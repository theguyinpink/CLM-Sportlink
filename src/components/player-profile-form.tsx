"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LEVEL_OPTIONS,
  POSITION_OPTIONS,
  PROFILE_ROLE_OPTIONS,
  REFEREE_LEVEL_OPTIONS,
  REGION_OPTIONS,
  SPORT_OPTIONS,
  STAFF_ROLE_OPTIONS,
} from "@/lib/form-options";
import { savePlayerProfileFromClient } from "@/app/profile-actions";

type PlayerProfileFormProps = {
  profile?: any;
  defaultError?: string;
};

function OptionList({ id, values }: { id: string; values: string[] }) {
  return (
    <datalist id={id}>
      {values.map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

function readRoles(value: any) {
  if (Array.isArray(value)) return value.map(String);
  if (!value) return ["player"];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Valeur historique possible.
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function PlayerProfileForm({ profile, defaultError }: PlayerProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError || "");
  const [loading, setLoading] = useState(false);
  const initialRoles = useMemo(() => readRoles(profile?.roles_available), [profile?.roles_available]);
  const [roles, setRoles] = useState<string[]>(initialRoles.length ? initialRoles : ["player"]);

  function toggleRole(role: string) {
    setRoles((current) => {
      const next = current.includes(role) ? current.filter((item) => item !== role) : [...current, role];
      return next.length ? next : ["player"];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const refereeRadiusRaw = String(formData.get("referee_radius_km") || "").trim();

    const result = await savePlayerProfileFromClient({
      display_name: String(formData.get("display_name") || "").trim(),
      sport: String(formData.get("sport") || "").trim(),
      position: String(formData.get("position") || "").trim(),
      level: String(formData.get("level") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      region: String(formData.get("region") || "").trim(),
      bio: String(formData.get("bio") || "").trim(),
      contact_email: String(formData.get("contact_email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      contact_email_visible_after_accept:
        formData.get("contact_email_visible_after_accept") === "on",
      phone_visible_after_accept: formData.get("phone_visible_after_accept") === "on",
      roles_available: formData.getAll("roles_available").map(String),
      referee_sports: String(formData.get("referee_sports") || "").trim(),
      referee_level: String(formData.get("referee_level") || "").trim(),
      referee_city: String(formData.get("referee_city") || "").trim(),
      referee_radius_km: refereeRadiusRaw ? Number(refereeRadiusRaw) : null,
      referee_availability: String(formData.get("referee_availability") || "").trim(),
      referee_experience: String(formData.get("referee_experience") || "").trim(),
      staff_roles: String(formData.get("staff_roles") || "").trim(),
      staff_experience: String(formData.get("staff_experience") || "").trim(),
    });

    if (!result.ok) {
      setError(result.error || "Impossible d’enregistrer le profil.");
      setLoading(false);
      return;
    }

    router.push("/app/joueur/profil?message=Profil enregistré");
    router.refresh();
  }

  const isReferee = roles.includes("referee");
  const isStaff = roles.includes("staff");

  return (
    <>
      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <OptionList id="sports" values={SPORT_OPTIONS} />
      <OptionList id="positions" values={POSITION_OPTIONS} />
      <OptionList id="levels" values={LEVEL_OPTIONS} />
      <OptionList id="referee-levels" values={REFEREE_LEVEL_OPTIONS} />
      <OptionList id="regions" values={REGION_OPTIONS} />
      <OptionList id="staff-roles" values={STAFF_ROLE_OPTIONS} />

      <form onSubmit={handleSubmit} className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-7">
          <div>
            <label className="mb-2 block text-sm text-white/55">Nom affiché</label>
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              required
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Sport principal</label>
            <input
              name="sport"
              list="sports"
              defaultValue={profile?.sport ?? ""}
              required
              placeholder="Basketball"
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
            <p className="mt-2 text-xs text-white/35">Astuce : choisis la même écriture côté joueur, club et annonce.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Poste joueur</label>
            <input
              name="position"
              list="positions"
              defaultValue={profile?.position ?? ""}
              placeholder="Ailier"
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Niveau joueur</label>
            <input
              name="level"
              list="levels"
              defaultValue={profile?.level ?? ""}
              placeholder="Régional"
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Ville</label>
            <input
              name="city"
              defaultValue={profile?.city ?? ""}
              placeholder="Combs-la-Ville"
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Région</label>
            <input
              name="region"
              list="regions"
              defaultValue={profile?.region ?? ""}
              placeholder="Île-de-France"
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div className="premium-card rounded-[28px] p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Rôles disponibles</p>
            <p className="mt-3 text-xs leading-6 text-white/42">
              Tu peux rester joueur, mais aussi indiquer que tu es disponible comme arbitre ou staff.
            </p>
            <div className="mt-5 grid gap-3">
              {PROFILE_ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72 transition hover:border-[#4f8cff]/30 hover:bg-[#4f8cff]/10"
                >
                  <span>{option.label}</span>
                  <input
                    name="roles_available"
                    type="checkbox"
                    value={option.value}
                    checked={roles.includes(option.value)}
                    onChange={() => toggleRole(option.value)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <label className="mb-3 block text-sm text-white/55">Bio</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ""}
              rows={8}
              className="w-full rounded-[28px] border border-white/8 bg-white/[0.02] px-5 py-5 text-white outline-none placeholder:text-white/30"
              placeholder="Décris ton style de jeu, ton projet, tes qualités, ta disponibilité..."
            />
          </div>

          {isReferee && (
            <section className="premium-card rounded-[30px] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#35e6a5]">Arbitrage</p>
              <h3 className="font-display mt-3 text-[2rem] uppercase leading-[0.95] text-white">Disponibilité arbitre</h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/55">Sport arbitré</label>
                  <input name="referee_sports" list="sports" defaultValue={profile?.referee_sports ?? profile?.sport ?? ""} placeholder="Basketball" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Niveau d’arbitrage</label>
                  <input name="referee_level" list="referee-levels" defaultValue={profile?.referee_level ?? ""} placeholder="Départemental" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Ville de départ</label>
                  <input name="referee_city" defaultValue={profile?.referee_city ?? profile?.city ?? ""} placeholder="Combs-la-Ville" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Rayon de déplacement km</label>
                  <input name="referee_radius_km" type="number" min="0" defaultValue={profile?.referee_radius_km ?? ""} placeholder="25" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/55">Disponibilités</label>
                  <textarea name="referee_availability" rows={4} defaultValue={profile?.referee_availability ?? ""} placeholder="Week-end, mercredi soir, tournois..." className="w-full rounded-[22px] border border-white/8 bg-white/2 px-4 py-4 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Expérience / diplôme</label>
                  <textarea name="referee_experience" rows={4} defaultValue={profile?.referee_experience ?? ""} placeholder="Diplôme, catégories déjà arbitrées, années d’expérience..." className="w-full rounded-[22px] border border-white/8 bg-white/2 px-4 py-4 text-white outline-none" />
                </div>
              </div>
            </section>
          )}

          {isStaff && (
            <section className="premium-card rounded-[30px] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8bb7ff]">Coach / staff</p>
              <h3 className="font-display mt-3 text-[2rem] uppercase leading-[0.95] text-white">Missions possibles</h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/55">Rôle staff</label>
                  <input name="staff_roles" list="staff-roles" defaultValue={profile?.staff_roles ?? ""} placeholder="Coach, assistant, préparateur..." className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Expérience</label>
                  <textarea name="staff_experience" rows={4} defaultValue={profile?.staff_experience ?? ""} placeholder="Ton expérience, tes disponibilités, les catégories que tu peux encadrer..." className="w-full rounded-[22px] border border-white/8 bg-white/2 px-4 py-4 text-white outline-none" />
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">Email de contact</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={profile?.contact_email ?? ""}
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/55">Téléphone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-7">
            <label className="flex items-center gap-3 text-sm text-white/68">
              <input
                name="contact_email_visible_after_accept"
                type="checkbox"
                defaultChecked={profile?.contact_email_visible_after_accept ?? false}
                className="h-4 w-4 cursor-pointer"
              />
              Montrer mon email après acceptation
            </label>

            <label className="flex items-center gap-3 text-sm text-white/68">
              <input
                name="phone_visible_after_accept"
                type="checkbox"
                defaultChecked={profile?.phone_visible_after_accept ?? false}
                className="h-4 w-4 cursor-pointer"
              />
              Montrer mon téléphone après acceptation
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#4f8cff] px-6 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Enregistrer le profil"}
          </button>
        </div>
      </form>
    </>
  );
}
