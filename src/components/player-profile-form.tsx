"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PROFILE_ROLE_OPTIONS,
  REFEREE_LEVEL_OPTIONS,
  REGION_OPTIONS,
  SPORT_OPTIONS,
  STAFF_ROLE_OPTIONS,
  getSportFieldLabel,
  getSportFieldPlaceholder,
  getSportLevels,
  getSportPositions,
  withCurrentOption,
} from "@/lib/form-options";
import { savePlayerProfileFromClient } from "@/app/profile-actions";
import CustomSelect from "@/components/custom-select";

type ProfileRole = "player" | "referee" | "staff";

type PlayerProfileFormProps = {
  profile?: any;
  defaultError?: string;
  defaultProfileRole?: ProfileRole;
};

const inputClass = "w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30";

function SelectField({
  name,
  label,
  value,
  defaultValue,
  options,
  onChange,
  required,
}: {
  name: string;
  label: string;
  value?: string;
  defaultValue?: string;
  options: string[];
  onChange?: (value: string) => void;
  required?: boolean;
}) {
  return (
    <CustomSelect
      name={name}
      label={label}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      options={options}
      required={required}
      placeholder="Sélectionner"
      buttonClassName="min-h-[50px]"
    />
  );
}

function normalizeProfileRole(value?: string | null): ProfileRole {
  return value === "referee" || value === "staff" || value === "player" ? value : "player";
}

function readRoles(value: any, fallback: ProfileRole = "player") {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [fallback];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Valeur historique possible.
  }
  const roles = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return roles.length ? roles : [fallback];
}

export default function PlayerProfileForm({ profile, defaultError, defaultProfileRole = "player" }: PlayerProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError || "");
  const [loading, setLoading] = useState(false);
  const normalizedDefaultRole = normalizeProfileRole(defaultProfileRole);
  const initialRoles = useMemo(
    () => readRoles(profile?.roles_available, normalizedDefaultRole),
    [profile?.roles_available, normalizedDefaultRole],
  );
  const [roles, setRoles] = useState<string[]>(initialRoles.length ? initialRoles : [normalizedDefaultRole]);
  const [sport, setSport] = useState(profile?.sport || "");
  const [refereeSport, setRefereeSport] = useState(profile?.referee_sports || profile?.sport || "");

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

  const isPlayer = roles.includes("player");
  const isReferee = roles.includes("referee");
  const isStaff = roles.includes("staff");
  const sportLabel = isPlayer
    ? "Sport principal"
    : isReferee && !isStaff
      ? "Sport arbitré"
      : isStaff && !isReferee
        ? "Sport encadré"
        : "Sport principal";
  const bioPlaceholder = isPlayer
    ? `Décris ton projet, tes qualités, ta disponibilité et ton profil ${getSportFieldPlaceholder(sport).toLowerCase()}...`
    : isReferee && !isStaff
      ? "Décris tes disponibilités, tes diplômes, ton expérience d’arbitrage et ta zone de déplacement..."
      : isStaff && !isReferee
        ? "Décris ton expérience, tes missions possibles, les catégories que tu peux encadrer et tes disponibilités..."
        : "Décris ton projet, tes qualités, tes disponibilités et ton profil sportif...";
  const playerLevels = withCurrentOption(getSportLevels(sport), profile?.level);
  const playerPositions = withCurrentOption(getSportPositions(sport), profile?.position);
  const refereeLevels = withCurrentOption(REFEREE_LEVEL_OPTIONS, profile?.referee_level);
  const refereeSports = withCurrentOption(SPORT_OPTIONS, profile?.referee_sports || profile?.sport);
  const regions = withCurrentOption(REGION_OPTIONS, profile?.region);

  return (
    <>
      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-12 xl:grid-cols-[minmax(280px,0.72fr)_minmax(560px,1.28fr)]">
        <div className="space-y-7">
          <div>
            <label className="mb-2 block text-sm text-white/55">Nom affiché</label>
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              required
              className={inputClass}
            />
          </div>

          <SelectField
            name="sport"
            label={sportLabel}
            value={sport}
            onChange={(value) => setSport(value)}
            options={withCurrentOption(SPORT_OPTIONS, profile?.sport)}
            required
          />

          {isPlayer && (
            <>
              <SelectField
                name="position"
                label={getSportFieldLabel(sport)}
                defaultValue={profile?.position ?? ""}
                options={playerPositions}
              />

              <SelectField
                name="level"
                label="Niveau joueur"
                defaultValue={profile?.level ?? ""}
                options={playerLevels}
              />
            </>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/55">Ville</label>
            <input
              name="city"
              defaultValue={profile?.city ?? ""}
              placeholder="Combs-la-Ville"
              className={inputClass}
            />
          </div>

          <SelectField
            name="region"
            label="Région"
            defaultValue={profile?.region ?? ""}
            options={regions}
          />

          <div className="premium-card rounded-[28px] p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Rôles disponibles</p>
            <p className="mt-3 text-xs leading-6 text-white/42">
              Tu peux choisir un seul profil ou cumuler plusieurs rôles selon ce que tu veux proposer aux clubs.
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
              placeholder={bioPlaceholder}
            />
          </div>

          {isReferee && (
            <section className="premium-card rounded-[32px] p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#35e6a5]">Arbitrage</p>
              <h3 className="font-display mt-3 text-[2rem] uppercase leading-[0.95] text-white">Disponibilité arbitre</h3>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <SelectField
                  name="referee_sports"
                  label="Sport arbitré"
                  value={refereeSport}
                  onChange={(value) => setRefereeSport(value)}
                  options={refereeSports}
                />
                <SelectField
                  name="referee_level"
                  label="Niveau d’arbitrage"
                  defaultValue={profile?.referee_level ?? ""}
                  options={refereeLevels}
                />
                <div>
                  <label className="mb-2 block text-sm text-white/55">Ville de départ</label>
                  <input name="referee_city" defaultValue={profile?.referee_city ?? profile?.city ?? ""} placeholder="Combs-la-Ville" className={inputClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Rayon de déplacement km</label>
                  <input name="referee_radius_km" type="number" min="0" defaultValue={profile?.referee_radius_km ?? ""} placeholder="25" className={inputClass} />
                </div>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
            <section className="premium-card rounded-[32px] p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8bb7ff]">Coach / staff</p>
              <h3 className="font-display mt-3 text-[2rem] uppercase leading-[0.95] text-white">Missions possibles</h3>
              <div className="mt-6 grid gap-7">
                <SelectField
                  name="staff_roles"
                  label="Rôle staff"
                  defaultValue={profile?.staff_roles ?? ""}
                  options={withCurrentOption(STAFF_ROLE_OPTIONS, profile?.staff_roles)}
                />
                <div>
                  <label className="mb-2 block text-sm text-white/55">Expérience</label>
                  <textarea name="staff_experience" rows={6} defaultValue={profile?.staff_experience ?? ""} placeholder="Ton expérience, tes disponibilités, les catégories que tu peux encadrer..." className="min-h-[150px] w-full rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5 text-white outline-none placeholder:text-white/30 focus:border-[#4f8cff]/35" />
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
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/55">Téléphone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                className={inputClass}
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
