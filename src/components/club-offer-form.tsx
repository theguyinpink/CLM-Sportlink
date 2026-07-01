"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClubOfferFromClient } from "@/app/offer-actions";
import { getCategoryLabel, OFFER_CATEGORIES } from "@/lib/matching";
import { LEVEL_OPTIONS, OFFER_TYPE_OPTIONS, POSITION_OPTIONS, REFEREE_LEVEL_OPTIONS, REGION_OPTIONS, SPORT_OPTIONS, STAFF_ROLE_OPTIONS } from "@/lib/form-options";

type ClubOfferFormProps = {
  club: {
    club_name?: string | null;
    sport?: string | null;
    city?: string | null;
    region?: string | null;
    level?: string | null;
  };
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

function categoryForOfferType(type: string, currentCategory?: string | null) {
  if (type === "referee") return "arbitre";
  if (type === "staff") return "staff";
  if (currentCategory === "arbitre" || currentCategory === "staff") return "recrutement";
  return currentCategory || "recrutement";
}

export default function ClubOfferForm({ club, defaultError }: ClubOfferFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError || "");
  const [loading, setLoading] = useState(false);
  const [offerType, setOfferType] = useState("player");
  const [category, setCategory] = useState("recrutement");

  function handleOfferTypeChange(value: string) {
    setOfferType(value);
    setCategory(categoryForOfferType(value, category));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const ageMinRaw = String(formData.get("age_min") || "").trim();
    const ageMaxRaw = String(formData.get("age_max") || "").trim();
    const safeCategory = categoryForOfferType(offerType, category);

    const result = await createClubOfferFromClient({
      title: String(formData.get("title") || "").trim(),
      offer_type: offerType,
      category: safeCategory,
      sport: String(formData.get("sport") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      position_needed: offerType === "referee" ? "Arbitre" : String(formData.get("position_needed") || "").trim(),
      level_required: String(formData.get("level_required") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      age_min: ageMinRaw ? Number(ageMinRaw) : null,
      age_max: ageMaxRaw ? Number(ageMaxRaw) : null,
      event_date: String(formData.get("event_date") || "").trim(),
      event_time: String(formData.get("event_time") || "").trim(),
      remuneration: String(formData.get("remuneration") || "").trim(),
    });

    if (!result.ok) {
      setError(result.error || "Impossible de créer l’annonce.");
      setLoading(false);
      return;
    }

    router.push("/app/club/annonces?message=Annonce créée");
    router.refresh();
  }

  const isReferee = offerType === "referee";
  const isStaff = offerType === "staff";
  const safeCategory = categoryForOfferType(offerType, category);
  const levelOptions = isReferee ? REFEREE_LEVEL_OPTIONS : LEVEL_OPTIONS;
  const roleLabel = isStaff ? "Mission / rôle staff" : "Poste recherché";
  const rolePlaceholder = isStaff ? "Coach, assistant, préparateur..." : "Ailier";
  const titlePlaceholder = isReferee ? "Recherche arbitre pour match U18" : isStaff ? "Recherche coach assistant" : "Recherche ailier régional";

  return (
    <>
      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <OptionList id="positions" values={isStaff ? STAFF_ROLE_OPTIONS : POSITION_OPTIONS} />
      <OptionList id="levels" values={levelOptions} />
      <OptionList id="regions" values={REGION_OPTIONS} />
      <OptionList id="sports" values={SPORT_OPTIONS} />

      <form onSubmit={handleSubmit} className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-7">
          <div className="premium-card rounded-[30px] p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Contexte club</p>
            <p className="mt-4 text-sm leading-7 text-white/62">
              {club.club_name || "Club"} • {club.sport || "Sport non renseigné"}
              {club.level ? ` • ${club.level}` : ""}
              {club.city || club.region ? ` • ${club.city || club.region}` : ""}
            </p>
            <p className="mt-3 text-xs leading-6 text-white/35">
              Tu peux publier une annonce joueur, arbitre ou staff sans créer de nouveau type de compte.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Besoin du club</label>
            <select
              name="offer_type"
              value={offerType}
              onChange={(event) => handleOfferTypeChange(event.target.value)}
              className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none"
            >
              {OFFER_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value} className="bg-[#07080f] text-white">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Titre</label>
            <input
              name="title"
              required
              placeholder={titlePlaceholder}
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/55">Sport de l’annonce</label>
            <input
              name="sport"
              list="sports"
              defaultValue={club.sport || ""}
              placeholder="Basketball"
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
            <p className="mt-2 text-xs text-white/35">
              Ce sport sert au calcul de compatibilité. Il peut être différent du sport principal du club si besoin.
            </p>
          </div>

          {isReferee || isStaff ? (
            <div>
              <input type="hidden" name="category" value={safeCategory} />
              <label className="mb-2 block text-sm text-white/55">Catégorie</label>
              <div className="ui-card-value rounded-[24px] border border-white/10 bg-white/5 px-5 py-3 text-sm leading-6 text-white">
                {getCategoryLabel(safeCategory)}
              </div>
              <p className="mt-2 text-xs text-white/35">
                La catégorie est verrouillée automatiquement selon le besoin choisi.
              </p>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm text-white/55">Catégorie</label>
              <select
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none"
              >
                {OFFER_CATEGORIES.filter((item) => item.value !== "arbitre" && item.value !== "staff").map((item) => (
                  <option key={item.value} value={item.value} className="bg-[#07080f] text-white">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isReferee ? (
            <input type="hidden" name="position_needed" value="Arbitre" />
          ) : (
            <div>
              <label className="mb-2 block text-sm text-white/55">{roleLabel}</label>
              <input
                name="position_needed"
                list="positions"
                placeholder={rolePlaceholder}
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/55">Niveau recherché</label>
            <input
              name="level_required"
              list="levels"
              placeholder={isReferee ? "Départemental" : "Régional"}
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          {!isReferee && !isStaff && (
            <div className="grid gap-7 md:grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]">
              <div>
                <label className="mb-2 block text-sm text-white/55">Âge minimum</label>
                <input
                  name="age_min"
                  type="number"
                  min="0"
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Âge maximum</label>
                <input
                  name="age_max"
                  type="number"
                  min="0"
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/55">Localisation</label>
            <input
              name="location"
              list="regions"
              placeholder={club.region || club.city || "Île-de-France"}
              className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          {(isReferee || isStaff) && (
            <div className="grid gap-7 md:grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]">
              <div>
                <label className="mb-2 block text-sm text-white/55">Date</label>
                <input name="event_date" type="date" className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Horaire</label>
                <input name="event_time" placeholder="Samedi 15h" className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30" />
              </div>
            </div>
          )}

          {(isReferee || isStaff) && (
            <div>
              <label className="mb-2 block text-sm text-white/55">Rémunération / défraiement</label>
              <input
                name="remuneration"
                placeholder="Ex : défraiement prévu, à discuter, bénévole..."
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div>
            <label className="mb-3 block text-sm text-white/55">Description intelligente</label>
            <textarea
              name="description"
              rows={10}
              placeholder={isReferee ? "Décris le match, la catégorie, le niveau, la date, le lieu, le défraiement et les attentes..." : isStaff ? "Décris la mission, les disponibilités, la catégorie, la durée et le projet du club..." : "Décris le besoin, le style recherché, le projet, l’ambiance, les qualités importantes..."}
              className="w-full rounded-[28px] border border-white/8 bg-white/2 px-5 py-5 text-white outline-none placeholder:text-white/30"
            />
            <p className="mt-3 text-xs leading-6 text-white/40">
              Cette annonce apparaîtra dans les opportunités des joueurs. Si le besoin est “arbitre” ou “staff”, les profils qui ont coché ce rôle seront mieux classés.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#4f8cff] via-[#9b5cff] to-[#00d4ff] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#050612] shadow-[0_18px_60px_rgba(79,140,255,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Publication..." : "Publier l’annonce"}
          </button>
        </div>
      </form>
    </>
  );
}
