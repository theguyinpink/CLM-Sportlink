"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { REGION_OPTIONS, SPORT_OPTIONS, getSportLevels, withCurrentOption } from "@/lib/form-options";
import { saveClubProfileFromClient } from "@/app/profile-actions";
import CustomSelect from "@/components/custom-select";

type ClubProfileFormProps = {
  club?: any;
  defaultError?: string;
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
    />
  );
}

export default function ClubProfileForm({ club, defaultError }: ClubProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError || "");
  const [loading, setLoading] = useState(false);
  const [sport, setSport] = useState(club?.sport || "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const result = await saveClubProfileFromClient({
      club_name: String(formData.get("club_name") || "").trim(),
      sport: String(formData.get("sport") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      region: String(formData.get("region") || "").trim(),
      level: String(formData.get("level") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      contact_email: String(formData.get("contact_email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
    });

    if (!result.ok) {
      setError(result.error || "Impossible d’enregistrer la fiche club.");
      setLoading(false);
      return;
    }

    router.push("/app/club/profil?message=Fiche club enregistrée");
    router.refresh();
  }

  const levels = withCurrentOption(getSportLevels(sport), club?.level);

  return (
    <>
      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-7">
          <div>
            <label className="mb-2 block text-sm text-white/55">Nom du club</label>
            <input
              name="club_name"
              defaultValue={club?.club_name ?? ""}
              required
              className={inputClass}
            />
          </div>

          <SelectField
            name="sport"
            label="Sport"
            value={sport}
            onChange={(value) => setSport(value)}
            options={withCurrentOption(SPORT_OPTIONS, club?.sport)}
            required
          />

          <div>
            <label className="mb-2 block text-sm text-white/55">Ville</label>
            <input
              name="city"
              defaultValue={club?.city ?? ""}
              placeholder="Combs-la-Ville"
              className={inputClass}
            />
          </div>

          <SelectField
            name="region"
            label="Région"
            defaultValue={club?.region ?? ""}
            options={withCurrentOption(REGION_OPTIONS, club?.region)}
          />

          <SelectField
            name="level"
            label="Niveau"
            defaultValue={club?.level ?? ""}
            options={levels}
          />
        </div>

        <div className="space-y-10">
          <div>
            <label className="mb-3 block text-sm text-white/55">Description</label>
            <textarea
              name="description"
              defaultValue={club?.description ?? ""}
              rows={8}
              className="w-full rounded-[28px] border border-white/8 bg-white/[0.02] px-5 py-5 text-white outline-none placeholder:text-white/30"
              placeholder="Présente le club, le projet sportif, l’ambiance et les valeurs."
            />
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">Email de contact</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={club?.contact_email ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/55">Téléphone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={club?.phone ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#4f8cff] px-6 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Enregistrer la fiche club"}
          </button>
        </div>
      </form>
    </>
  );
}
