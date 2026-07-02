import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerAvatar from "@/components/player-avatar";
import PlayerMediaGrid from "@/components/player-media-grid";
import OnboardingCard from "@/components/onboarding-card";
import ContactCounterModal from "@/components/contact-counter-modal";
import { calculatePlayerCompletion, getOfferTypeLabel } from "@/lib/matching";

function readRoles(value: any) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return ["player"];
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

  return roles.length ? roles : ["player"];
}

function roleProfileLabel(roles: string[]) {
  if (roles.includes("player")) return "CV sportif joueur";
  if (roles.includes("referee")) return "CV sportif arbitre";
  if (roles.includes("staff")) return "CV sportif coach / staff";
  return "CV sportif";
}

function profileSubtitle(profile: any, roles: string[]) {
  if (roles.includes("player")) {
    return [profile.sport, profile.position, profile.level].filter(Boolean).join(" • ");
  }

  if (roles.includes("referee")) {
    return [profile.referee_sports || profile.sport, profile.referee_level, profile.referee_city || profile.city]
      .filter(Boolean)
      .join(" • ");
  }

  if (roles.includes("staff")) {
    return [profile.sport, profile.staff_roles, profile.city || profile.region].filter(Boolean).join(" • ");
  }

  return [profile.sport, profile.city || profile.region].filter(Boolean).join(" • ");
}

export default async function PlayerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/app/joueur/profil/edit");

  const [{ data: media }, { data: acceptedRequests }] = await Promise.all([
    supabase
      .from("player_media")
      .select("*")
      .eq("player_profile_id", profile.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("connection_requests")
      .select("*, clubs(id, club_name, sport, city, region, level, logo_path)")
      .eq("player_profile_id", profile.id)
      .eq("status", "accepted")
      .order("responded_at", { ascending: false }),
  ]);

  const contacts = (acceptedRequests || [])
    .map((request: any) => {
      const club = Array.isArray(request.clubs) ? request.clubs[0] : request.clubs;
      if (!club?.id) return null;
      return {
        id: club.id,
        name: club.club_name || "Club",
        subtitle: [club.sport, club.city || club.region, club.level].filter(Boolean).join(" • "),
        imagePath: club.logo_path,
        href: `/app/joueur/clubs/${club.id}`,
        type: "club" as const,
      };
    })
    .filter(Boolean);

  const completion = calculatePlayerCompletion(profile);
  const roles = readRoles(profile.roles_available);
  const isPlayer = roles.includes("player");
  const isReferee = roles.includes("referee");
  const isStaff = roles.includes("staff");
  const subtitle = profileSubtitle(profile, roles) || "Profil à compléter";

  const statCards = [
    ...(isPlayer
      ? [
          { label: "Poste", value: profile.position || "Non renseigné" },
          { label: "Niveau", value: profile.level || "Non renseigné" },
        ]
      : []),
    ...(isReferee
      ? [
          { label: "Sport arbitré", value: profile.referee_sports || profile.sport || "Non renseigné" },
          { label: "Niveau arbitre", value: profile.referee_level || "Non renseigné" },
        ]
      : []),
    ...(isStaff
      ? [
          { label: "Rôle staff", value: profile.staff_roles || "Non renseigné" },
          {
            label: "Expérience staff",
            value: profile.staff_experience ? "Renseignée" : "Non renseignée",
          },
        ]
      : []),
    { label: "Zone", value: profile.city || profile.region || "Non renseignée" },
    { label: "Rôles", value: roles.map((role: string) => getOfferTypeLabel(role)).join(" • ") },
  ];

  return (
    <main className="space-y-14">
      <section className="premium-card rounded-[40px] p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <PlayerAvatar avatarPath={profile.avatar_path} displayName={profile.display_name} size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
                {roleProfileLabel(roles)}
              </p>
              <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem]">
                {profile.display_name}
              </h1>
              <p className="mt-4 text-white/68">{subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {roles.map((role: string) => (
                  <span key={role} className="rounded-full border border-[#35e6a5]/20 bg-[#35e6a5]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8ff5cf]">
                    {getOfferTypeLabel(role)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Link href="/app/joueur/profil/edit" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/4">Modifier</Link>
        </div>
      </section>

      <OnboardingCard
        title="Qualité du CV sportif"
        description="Cette jauge indique si ton profil donne assez de matière aux clubs pour te comprendre rapidement. Les critères s’adaptent à ton rôle : joueur, arbitre ou coach / staff."
        score={completion.score}
        checks={completion.checks}
        ctaHref="/app/joueur/parametres"
        ctaLabel="Ajouter avatar ou médias"
      />

      <section className="grid gap-6 lg:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="premium-card rounded-[28px] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{card.label}</p>
            <p className="mt-3 text-white">{card.value}</p>
          </div>
        ))}
        <ContactCounterModal label="Nombre de contacts" contacts={contacts as any} />
      </section>

      <section className="grid gap-16 border-t border-white/5 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">

          {(isReferee || isStaff) && (
            <div className="premium-card rounded-[30px] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Disponibilités élargies</p>
              {isReferee && (
                <div className="mt-5 border-b border-white/5 pb-5">
                  <p className="text-sm font-semibold text-[#8ff5cf]">Arbitrage</p>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {profile.referee_sports || profile.sport || "Sport non renseigné"}
                    {profile.referee_level ? ` • ${profile.referee_level}` : ""}
                    {profile.referee_city ? ` • ${profile.referee_city}` : ""}
                    {profile.referee_radius_km ? ` • ${profile.referee_radius_km} km` : ""}
                  </p>
                  {(profile.referee_availability || profile.referee_experience) && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/55">
                      {[profile.referee_availability, profile.referee_experience].filter(Boolean).join("\n")}
                    </p>
                  )}
                </div>
              )}
              {isStaff && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-[#8bb7ff]">Coach / staff</p>
                  <p className="mt-3 text-sm leading-7 text-white/68">{profile.staff_roles || "Rôle staff non renseigné"}</p>
                  {profile.staff_experience && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/55">{profile.staff_experience}</p>}
                </div>
              )}
            </div>
          )}
          <div className="premium-card rounded-[30px] p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Contact</p>
            <div className="mt-5 space-y-4 text-white/72">
              <p>Email : {profile.contact_email || "Non renseigné"}</p>
              <p>Téléphone : {profile.phone || "Non renseigné"}</p>
              <p>Email visible après accord : {profile.contact_email_visible_after_accept ? "Oui" : "Non"}</p>
              <p>Téléphone visible après accord : {profile.phone_visible_after_accept ? "Oui" : "Non"}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Résumé sportif</p>
          <p className="mt-5 whitespace-pre-line text-base leading-9 text-white/68">{profile.bio || "Aucune bio pour le moment."}</p>
        </div>
      </section>

      <section className="space-y-8 border-t border-white/5 pt-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Médias</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">Temps forts</h2>
        </div>
        {media && media.length > 0 ? <PlayerMediaGrid media={media} /> : <p className="text-white/62">Aucun média pour le moment. Ajoute des photos ou liens depuis les paramètres.</p>}
      </section>
    </main>
  );
}
