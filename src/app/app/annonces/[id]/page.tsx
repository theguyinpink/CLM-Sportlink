import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { playerInterestedInClub } from "@/app/connection-actions";
import ClubLogo from "@/components/club-logo";
import CompatibilityBadge from "@/components/compatibility-badge";
import FavoriteButton from "@/components/favorite-button";
import ReportButton from "@/components/report-button";
import InsightPill from "@/components/insight-pill";
import {
  calculateOfferCompatibility,
  getCategoryLabel,
  getOfferType,
  getOfferTypeLabel,
  includesOrEquals,
  type CompatibilityResult,
  type MatchReason,
} from "@/lib/matching";

type PageProps = {
  params: Promise<{ id: string }>;
};

function safeText(value?: string | null, fallback = "Non renseigné") {
  const text = String(value || "").trim();
  return text || fallback;
}

function rolesList(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.map(String);
  if (!value) return [];
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

function hasRole(profile: any, role: "player" | "referee" | "staff") {
  const roles = rolesList(profile?.roles_available);
  if (roles.length === 0) return role === "player";
  return roles.includes(role);
}

function reasonByLabel(match: CompatibilityResult | null, label: string): MatchReason | null {
  return match?.reasons.find((reason) => reason.label.toLowerCase() === label.toLowerCase()) || null;
}

function toneClass(tone?: MatchReason["tone"] | "neutral") {
  if (tone === "success") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
  if (tone === "primary") return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-200";
  if (tone === "warning") return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200";
  if (tone === "danger") return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200";
  return "border-[color:var(--line)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)]";
}

function compareText(value?: string | null, fallback = "Non renseigné") {
  return safeText(value, fallback);
}

function MatchBreakdown({ profile, club, offer, match }: { profile: any; club: any; offer: any; match: CompatibilityResult }) {
  const offerType = getOfferType(offer.offer_type, offer.category);
  const offerSport = offer.sport || club?.sport || null;

  const rows = (() => {
    if (offerType === "referee") {
      return [
        {
          label: "Rôle",
          leftLabel: "Ton profil",
          left: hasRole(profile, "referee") ? "Arbitre" : "Arbitrage non indiqué",
          rightLabel: "Besoin du club",
          right: "Recherche arbitre",
          reason: reasonByLabel(match, "Rôle"),
        },
        {
          label: "Sport",
          leftLabel: "Sport arbitré",
          left: compareText(profile?.referee_sports || profile?.sport),
          rightLabel: "Sport de l’annonce",
          right: compareText(offerSport),
          reason: reasonByLabel(match, "Sport"),
        },
        {
          label: "Niveau",
          leftLabel: "Niveau arbitre",
          left: compareText(profile?.referee_level || profile?.level),
          rightLabel: "Niveau recherché",
          right: compareText(offer.level_required || club?.level),
          reason: reasonByLabel(match, "Niveau"),
        },
        {
          label: "Zone",
          leftLabel: "Ta zone",
          left: [profile?.referee_city || profile?.city, profile?.region].filter(Boolean).join(" • ") || "Non renseigné",
          rightLabel: "Lieu annoncé",
          right: compareText(offer.location || club?.city || club?.region),
          reason: reasonByLabel(match, "Zone"),
        },
      ];
    }

    if (offerType === "staff") {
      return [
        {
          label: "Rôle",
          leftLabel: "Ton profil",
          left: hasRole(profile, "staff") ? "Coach / staff" : "Staff non indiqué",
          rightLabel: "Besoin du club",
          right: "Recherche coach / staff",
          reason: reasonByLabel(match, "Rôle"),
        },
        {
          label: "Sport",
          leftLabel: "Ton sport",
          left: compareText(profile?.sport),
          rightLabel: "Sport de l’annonce",
          right: compareText(offerSport),
          reason: reasonByLabel(match, "Sport"),
        },
        {
          label: "Mission",
          leftLabel: "Tes infos staff",
          left: compareText(profile?.staff_roles || profile?.staff_experience || profile?.bio, "À compléter"),
          rightLabel: "Besoin du club",
          right: compareText(offer.position_needed || getCategoryLabel(offer.category), "Mission à préciser"),
          reason: reasonByLabel(match, "Mission") || reasonByLabel(match, "Infos"),
        },
        {
          label: "Zone",
          leftLabel: "Ta zone",
          left: [profile?.city, profile?.region].filter(Boolean).join(" • ") || "Non renseigné",
          rightLabel: "Lieu annoncé",
          right: compareText(offer.location || club?.city || club?.region),
          reason: reasonByLabel(match, "Zone"),
        },
      ];
    }

    return [
      {
        label: "Sport",
        leftLabel: "Ton sport",
        left: compareText(profile?.sport),
        rightLabel: "Sport de l’annonce",
        right: compareText(offerSport),
        reason: reasonByLabel(match, "Sport"),
      },
      {
        label: "Poste",
        leftLabel: "Ton poste",
        left: compareText(profile?.position),
        rightLabel: "Poste recherché",
        right: compareText(offer.position_needed),
        reason: reasonByLabel(match, "Poste"),
      },
      {
        label: "Niveau",
        leftLabel: "Ton niveau",
        left: compareText(profile?.level),
        rightLabel: "Niveau recherché",
        right: compareText(offer.level_required || club?.level),
        reason: reasonByLabel(match, "Niveau"),
      },
      {
        label: "Zone",
        leftLabel: "Ta zone",
        left: [profile?.city, profile?.region].filter(Boolean).join(" • ") || "Non renseigné",
        rightLabel: "Lieu annoncé",
        right: compareText(offer.location || club?.city || club?.region),
        reason: reasonByLabel(match, "Zone"),
      },
    ];
  })();

  return (
    <div className="premium-card rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">Compatibilité détaillée</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text-main)]">Pourquoi cette annonce ressort</h2>
        </div>
        <CompatibilityBadge match={match} />
      </div>

      <div className="mt-5 grid gap-3">
        {rows.map((row) => {
          const reason = row.reason;
          const compatible = row.label === "Sport" ? includesOrEquals(row.left, row.right) : reason?.points && reason.points > 0;

          return (
            <article key={row.label} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--text-main)]">{row.label}</span>
                  {reason && <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass(reason.tone)}`}>+{reason.points}</span>}
                  {compatible ? (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">Ça correspond</span>
                  ) : (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">À vérifier</span>
                  )}
                </div>
                {reason && <span className="text-xs text-[color:var(--text-muted)]">{reason.detail}</span>}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dim)]">{row.leftLabel}</p>
                  <p className="mt-2 text-sm font-medium text-[color:var(--text-main)]">{row.left}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dim)]">{row.rightLabel}</p>
                  <p className="mt-2 text-sm font-medium text-[color:var(--text-main)]">{row.right}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default async function AnnonceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const [{ data: offer }, { data: profile }] = await Promise.all([
    supabase
      .from("club_offers")
      .select("*, clubs(id, user_id, club_name, sport, city, region, level, logo_path, description)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("player_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!offer) {
    return <main className="space-y-8"><p className="text-[color:var(--text-muted)]">Annonce introuvable.</p></main>;
  }

  const club = Array.isArray(offer.clubs) ? offer.clubs[0] : offer.clubs;
  const offerType = getOfferType(offer.offer_type, offer.category);
  const match = profile && club ? calculateOfferCompatibility(profile, club, offer) : null;

  const { data: savedOffer } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", "club_offer")
    .eq("target_id", offer.id)
    .maybeSingle();

  return (
    <main className="space-y-7">
      <section className="premium-card overflow-hidden rounded-[30px]">
        <div className="border-b border-[color:var(--line)] bg-[color:var(--surface-soft)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <ClubLogo logoPath={club?.logo_path} clubName={club?.club_name || "Club"} size="lg" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-[color:var(--text-dim)]">Annonce club</p>
                <h1 className="mt-2 truncate text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-main)] sm:text-4xl">
                  {offer.title || "Annonce sans titre"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {safeText(club?.club_name, "Club")} • {safeText(offer.sport || club?.sport, "Sport")} • {safeText(offer.location || club?.city, "Lieu")}
                </p>
              </div>
            </div>

            {match && <CompatibilityBadge match={match} />}
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="ui-pill rounded-full px-3 py-1.5 text-xs font-semibold">{getOfferTypeLabel(offerType)}</span>
              <span className="ui-pill rounded-full px-3 py-1.5 text-xs font-semibold">{getCategoryLabel(offer.category)}</span>
              <span className="ui-pill rounded-full px-3 py-1.5 text-xs font-semibold">{safeText(offer.sport || club?.sport, "Sport")}</span>
              {offer.level_required && <span className="ui-pill rounded-full px-3 py-1.5 text-xs font-semibold">{offer.level_required}</span>}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[color:var(--text-main)]">Détail de l’annonce</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[color:var(--text-soft)]">
                {offer.description || "Aucune description détaillée pour cette annonce."}
              </p>
            </div>

            {(offer.event_date || offer.event_time || offer.remuneration) && (
              <div className="grid gap-3 sm:grid-cols-3">
                {offer.event_date && <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]">Date</p><p className="mt-2 text-sm font-medium text-[color:var(--text-main)]">{offer.event_date}</p></div>}
                {offer.event_time && <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]">Horaire</p><p className="mt-2 text-sm font-medium text-[color:var(--text-main)]">{offer.event_time}</p></div>}
                {offer.remuneration && <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]">Défraiement</p><p className="mt-2 text-sm font-medium text-[color:var(--text-main)]">{offer.remuneration}</p></div>}
              </div>
            )}

            {match && <MatchBreakdown profile={profile} club={club} offer={offer} match={match} />}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">Club</p>
              <p className="mt-3 text-lg font-semibold text-[color:var(--text-main)]">{safeText(club?.club_name, "Club")}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                {safeText(club?.sport, "Sport")} • {safeText(club?.level, "Niveau")} • {safeText(club?.city, "Ville")}
              </p>
              {club?.description && <p className="mt-3 line-clamp-4 text-sm leading-7 text-[color:var(--text-soft)]">{club.description}</p>}
              {club?.id && (
                <Link href={`/app/joueur/clubs/${club.id}`} className="btn-secondary mt-4 inline-flex rounded-full px-4 py-2.5 text-sm font-medium">
                  Voir la fiche club
                </Link>
              )}
            </div>

            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4">
              <p className="text-sm font-semibold text-[color:var(--text-main)]">Actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <FavoriteButton targetType="club_offer" targetId={offer.id} initialSaved={Boolean(savedOffer)} />
                <ReportButton targetType="club_offer" targetId={offer.id} />
              </div>

              {profile && club?.id && (
                <form action={playerInterestedInClub} className="mt-4">
                  <input type="hidden" name="club_id" value={club.id} />
                  <input type="hidden" name="offer_id" value={offer.id} />
                  <button type="submit" className="btn-primary w-full rounded-full px-5 py-3 text-sm font-semibold">
                    Je suis intéressé
                  </button>
                </form>
              )}
            </div>

            <Link href="/app/joueur/opportunites" className="inline-flex text-sm font-medium text-[color:var(--primary)]">
              ← Retour aux opportunités
            </Link>
          </aside>
        </div>
      </section>

      {match && (
        <section className="premium-card rounded-[28px] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">Résumé rapide</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {match.reasons.map((reason) => (
              <InsightPill key={`${offer.id}-${reason.label}`} reason={reason} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
