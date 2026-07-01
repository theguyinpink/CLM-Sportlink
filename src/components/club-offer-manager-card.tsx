"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClubOfferFromClient, updateClubOfferFromClient } from "@/app/offer-actions";
import { getCategoryLabel, getOfferType, getOfferTypeLabel, OFFER_CATEGORIES } from "@/lib/matching";
import { LEVEL_OPTIONS, OFFER_TYPE_OPTIONS, POSITION_OPTIONS, REFEREE_LEVEL_OPTIONS, REGION_OPTIONS, STAFF_ROLE_OPTIONS } from "@/lib/form-options";

type ClubOfferManagerCardProps = {
  offer: any;
  club: {
    city?: string | null;
    region?: string | null;
  };
  index?: number;
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

function StatusPill({ status }: { status?: string | null }) {
  const value = status || "active";
  const label = value === "active" ? "Active" : value === "closed" ? "Désactivée" : value;
  const color = value === "active" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-white/45";

  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${color}`}>
      {label}
    </span>
  );
}

function categoryForOfferType(type: string, currentCategory?: string | null) {
  if (type === "referee") return "arbitre";
  if (type === "staff") return "staff";
  if (currentCategory === "arbitre" || currentCategory === "staff") return "recrutement";
  return currentCategory || "recrutement";
}

export default function ClubOfferManagerCard({ offer, club, index = 0 }: ClubOfferManagerCardProps) {
  const router = useRouter();
  const initialOfferType = getOfferType(offer.offer_type, offer.category);
  const initialCategory = categoryForOfferType(initialOfferType, offer.category);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerType, setOfferType] = useState(initialOfferType);
  const [category, setCategory] = useState(initialCategory);

  function startEditing() {
    setOfferType(initialOfferType);
    setCategory(initialCategory);
    setEditing(true);
  }

  function handleOfferTypeChange(value: string) {
    setOfferType(value);
    setCategory(categoryForOfferType(value, category));
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const ageMinRaw = String(formData.get("age_min") || "").trim();
    const ageMaxRaw = String(formData.get("age_max") || "").trim();
    const safeCategory = categoryForOfferType(offerType, category);

    const result = await updateClubOfferFromClient({
      id: offer.id,
      title: String(formData.get("title") || "").trim(),
      offer_type: offerType,
      category: safeCategory,
      description: String(formData.get("description") || "").trim(),
      position_needed: String(formData.get("position_needed") || "").trim(),
      level_required: String(formData.get("level_required") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      status: String(formData.get("status") || "active").trim(),
      age_min: ageMinRaw ? Number(ageMinRaw) : null,
      age_max: ageMaxRaw ? Number(ageMaxRaw) : null,
      event_date: String(formData.get("event_date") || "").trim(),
      event_time: String(formData.get("event_time") || "").trim(),
      remuneration: String(formData.get("remuneration") || "").trim(),
    });

    if (!result.ok) {
      setError(result.error || "Impossible de modifier l’annonce.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setError("");
    setLoading(true);

    const result = await deleteClubOfferFromClient(offer.id);

    if (!result.ok) {
      setError(result.error || "Impossible de supprimer l’annonce.");
      setLoading(false);
      setConfirmDelete(false);
      return;
    }

    setLoading(false);
    setConfirmDelete(false);
    router.refresh();
  }

  const displayOfferType = getOfferType(offer.offer_type, offer.category);
  const displayCategory = categoryForOfferType(displayOfferType, offer.category);
  const isReferee = offerType === "referee";
  const isStaff = offerType === "staff";
  const displayIsReferee = displayOfferType === "referee";
  const displayIsStaff = displayOfferType === "staff";
  const roleLabel = isReferee ? "Rôle" : isStaff ? "Mission" : "Poste";
  const displayRoleLabel = displayIsReferee ? "Rôle" : displayIsStaff ? "Mission" : "Poste";
  const safeCategory = categoryForOfferType(offerType, category);

  return (
    <article className="premium-card animate-fade-up rounded-[32px] p-6" style={{ animationDelay: `${index * 60}ms` }}>
      <OptionList id={`positions-${offer.id}`} values={isStaff ? STAFF_ROLE_OPTIONS : POSITION_OPTIONS} />
      <OptionList id={`levels-${offer.id}`} values={isReferee ? REFEREE_LEVEL_OPTIONS : LEVEL_OPTIONS} />
      <OptionList id={`regions-${offer.id}`} values={REGION_OPTIONS} />

      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-[#02030a]/80 backdrop-blur-xl"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[30px] border border-white/10 bg-[#111527] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-red-300/80">Suppression</p>
            <h3 className="font-display mt-4 text-[2.2rem] uppercase leading-[0.92] text-white">
              Supprimer cette annonce ?
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Cette action retirera définitivement l’annonce de ton espace club et des opportunités visibles par les profils.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-full bg-red-400 px-5 py-3 text-sm font-bold text-[#050612] transition hover:bg-red-300 disabled:opacity-60"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!editing ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#35e6a5]/25 bg-[#35e6a5]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8ff5cf]">
              {getOfferTypeLabel(displayOfferType)}
            </span>
            <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#c4a1ff]">
              {getCategoryLabel(displayCategory)}
            </span>
            <StatusPill status={offer.status} />
          </div>

          <h2 className="font-display mt-5 text-[2.4rem] uppercase leading-[0.9] text-white">
            {offer.title}
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{displayRoleLabel}</p>
              <p className="mt-2 text-sm text-white">{offer.position_needed || "Non précisé"}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Niveau</p>
              <p className="mt-2 text-sm text-white">{offer.level_required || "Non précisé"}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Zone</p>
              <p className="mt-2 text-sm text-white">{offer.location || club.city || club.region || "Non précisée"}</p>
            </div>
          </div>

          {(offer.event_date || offer.event_time || offer.remuneration) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Date</p>
                <p className="mt-2 text-sm text-white">{offer.event_date || "À définir"}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Horaire</p>
                <p className="mt-2 text-sm text-white">{offer.event_time || "À définir"}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Défraiement</p>
                <p className="mt-2 text-sm text-white">{offer.remuneration || "Non précisé"}</p>
              </div>
            </div>
          )}

          <p className="mt-5 text-sm leading-8 text-white/64">
            {offer.description || "Aucune description."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startEditing}
              className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] transition hover:-translate-y-0.5"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-full border border-red-500/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-500/10"
            >
              Supprimer
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleEdit} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">Titre</label>
              <input name="title" required defaultValue={offer.title || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/55">Statut</label>
              <select name="status" defaultValue={offer.status || "active"} className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none">
                <option value="active" className="bg-[#07080f] text-white">Active</option>
                <option value="closed" className="bg-[#07080f] text-white">Désactivée</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">Besoin du club</label>
              <select name="offer_type" value={offerType} onChange={(event) => handleOfferTypeChange(event.target.value)} className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none">
                {OFFER_TYPE_OPTIONS.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#07080f] text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {isReferee || isStaff ? (
              <div>
                <input type="hidden" name="category" value={safeCategory} />
                <label className="mb-2 block text-sm text-white/55">Catégorie</label>
                <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">
                  {getCategoryLabel(safeCategory)}
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm text-white/55">Catégorie</label>
                <select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none">
                  {OFFER_CATEGORIES.filter((item) => item.value !== "arbitre" && item.value !== "staff").map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#07080f] text-white">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">Zone</label>
              <input name="location" list={`regions-${offer.id}`} defaultValue={offer.location || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/55">Niveau recherché</label>
              <input name="level_required" list={`levels-${offer.id}`} defaultValue={offer.level_required || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/55">{roleLabel}</label>
              <input name="position_needed" list={`positions-${offer.id}`} defaultValue={offer.position_needed || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
            </div>
            {!isReferee && !isStaff && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-white/55">Âge min</label>
                  <input name="age_min" type="number" min="0" defaultValue={offer.age_min ?? ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/55">Âge max</label>
                  <input name="age_max" type="number" min="0" defaultValue={offer.age_max ?? ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
                </div>
              </div>
            )}
          </div>

          {(isReferee || isStaff) && (
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-white/55">Date</label>
                <input name="event_date" type="date" defaultValue={offer.event_date || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Horaire</label>
                <input name="event_time" defaultValue={offer.event_time || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Défraiement</label>
                <input name="remuneration" defaultValue={offer.remuneration || ""} className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none" />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/55">Description</label>
            <textarea name="description" rows={6} defaultValue={offer.description || ""} className="w-full rounded-[24px] border border-white/8 bg-white/2 px-5 py-4 text-white outline-none" />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] disabled:opacity-60">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5">
              Annuler
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
