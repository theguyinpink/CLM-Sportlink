import Link from "next/link";
import { playerInterestedInClub } from "@/app/connection-actions";
import ClubLogo from "@/components/club-logo";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import { getCategoryLabel, getOfferType, getOfferTypeLabel, type CompatibilityResult } from "@/lib/matching";

type OpportunityCardProps = {
  offer: any;
  club: any;
  match: CompatibilityResult;
  href: string;
  canApply?: boolean;
  index?: number;
};

export default function OpportunityCard({
  offer,
  club,
  match,
  href,
  canApply = true,
  index = 0,
}: OpportunityCardProps) {
  const offerType = getOfferType(offer.offer_type, offer.category);
  const roleLabel = offerType === "referee" ? "Rôle" : offerType === "staff" ? "Mission" : "Poste";
  const detailHref = offer?.id ? `/app/annonces/${offer.id}` : href;

  return (
    <article
      className="premium-card animate-fade-up rounded-[34px] p-6 transition hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <ClubLogo logoPath={club?.logo_path} clubName={club?.club_name || "Club"} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#35e6a5]/25 bg-[#35e6a5]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8ff5cf]">
                {getOfferTypeLabel(offerType)}
              </span>
              <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#c4a1ff]">
                {getCategoryLabel(offer.category)}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50">
                {club?.sport || "Sport"}
              </span>
            </div>
            <h3 className="font-display mt-4 text-[2.45rem] uppercase leading-[0.88] text-white">
              {offer.title}
            </h3>
            <p className="mt-3 text-sm text-white/62">
              {club?.club_name || "Club"}
              {offer.position_needed ? ` • ${roleLabel} : ${offer.position_needed}` : ""}
              {offer.level_required ? ` • ${offer.level_required}` : ""}
              {offer.location || club?.city ? ` • ${offer.location || club?.city}` : ""}
            </p>
          </div>
        </div>

        <CompatibilityBadge match={match} />
      </div>

      {(offer.event_date || offer.event_time || offer.remuneration) && (
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/58">
          {offer.event_date && <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1">Date : {offer.event_date}</span>}
          {offer.event_time && <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1">Horaire : {offer.event_time}</span>}
          {offer.remuneration && <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1">Défraiement : {offer.remuneration}</span>}
        </div>
      )}

      <p className="mt-6 line-clamp-3 max-w-4xl text-sm leading-8 text-white/64">
        {offer.description || "Aucune description détaillée pour cette opportunité."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {match.reasons.slice(0, 5).map((reason) => (
          <InsightPill key={`${offer.id}-${reason.label}`} reason={reason} />
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link href={detailHref} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:border-[#4f8cff]/35 hover:bg-[#4f8cff]/10">
          Voir le détail
        </Link>
        {canApply && (
          <form action={playerInterestedInClub}>
            <input type="hidden" name="club_id" value={club?.id} />
            <input type="hidden" name="offer_id" value={offer.id} />
            <button type="submit" className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] shadow-[0_14px_45px_rgba(79,140,255,0.22)] transition hover:-translate-y-0.5">
              Je suis intéressé
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
