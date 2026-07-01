import Link from "next/link";
import { playerInterestedInClub } from "@/app/connection-actions";
import ClubLogo from "@/components/club-logo";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import FavoriteButton from "@/components/favorite-button";
import ReportButton from "@/components/report-button";
import { getCategoryLabel, getOfferType, getOfferTypeLabel, type CompatibilityResult } from "@/lib/matching";

type OpportunityCardProps = {
  offer: any;
  club: any;
  match: CompatibilityResult;
  href: string;
  canApply?: boolean;
  index?: number;
  isSaved?: boolean;
};

export default function OpportunityCard({
  offer,
  club,
  match,
  href,
  canApply = true,
  index = 0,
  isSaved = false,
}: OpportunityCardProps) {
  const offerType = getOfferType(offer.offer_type, offer.category);
  const roleLabel = offerType === "staff" ? "Mission" : "Poste";

  return (
    <article
      id={`offer-${offer.id}`}
      className="premium-card animate-fade-up scroll-mt-28 rounded-[24px] p-5 transition premium-hover"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <ClubLogo logoPath={club?.logo_path} clubName={club?.club_name || "Club"} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                {getOfferTypeLabel(offerType)}
              </span>
              <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                {getCategoryLabel(offer.category)}
              </span>
              <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                {offer.sport || club?.sport || "Sport"}
              </span>
            </div>
            <h3 className="font-display mt-4 text-[1.55rem] leading-tight text-[color:var(--text-main)] sm:text-[1.85rem]">
              {offer.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
              {club?.club_name || "Club"}
              {offerType !== "referee" && offer.position_needed ? ` • ${roleLabel} : ${offer.position_needed}` : ""}
              {offer.level_required ? ` • ${offer.level_required}` : ""}
              {offer.location || club?.city ? ` • ${offer.location || club?.city}` : ""}
            </p>
          </div>
        </div>

        <CompatibilityBadge match={match} />
      </div>

      {(offer.event_date || offer.event_time || offer.remuneration) && (
        <div className="mt-5 flex flex-wrap gap-2 text-xs leading-6 text-[color:var(--text-muted)]">
          {offer.event_date && <span className="ui-pill rounded-full px-3 py-1">Date : {offer.event_date}</span>}
          {offer.event_time && <span className="ui-pill rounded-full px-3 py-1">Horaire : {offer.event_time}</span>}
          {offer.remuneration && <span className="ui-pill rounded-full px-3 py-1">Défraiement : {offer.remuneration}</span>}
        </div>
      )}

      <p className="mt-5 line-clamp-3 text-sm leading-8 text-[color:var(--text-soft)]">
        {offer.description || "Aucune description détaillée pour cette opportunité."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {match.reasons.slice(0, 5).map((reason) => (
          <InsightPill key={`${offer.id}-${reason.label}`} reason={reason} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={href} className="btn-secondary rounded-full px-5 py-3 text-sm font-medium">
          Voir le détail
        </Link>
        <FavoriteButton targetType="club_offer" targetId={offer.id} initialSaved={isSaved} compact />
        <ReportButton targetType="club_offer" targetId={offer.id} compact />
        {canApply && (
          <form action={playerInterestedInClub}>
            <input type="hidden" name="club_id" value={club?.id} />
            <input type="hidden" name="offer_id" value={offer.id} />
            <button type="submit" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
              Je suis intéressé
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
