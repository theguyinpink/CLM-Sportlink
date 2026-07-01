import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import PlayerAvatar from "@/components/player-avatar";
import FavoriteButton from "@/components/favorite-button";

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function getRoleLabels(profile: any) {
  const labels: Record<string, string> = { player: "Joueur", referee: "Arbitre", staff: "Coach / staff" };
  const roles = Array.isArray(profile.roles_available)
    ? profile.roles_available
    : String(profile.roles_available || "player").split(",").map((item) => item.trim()).filter(Boolean);
  return roles.map((role: string) => labels[role] || role).join(" • ");
}

export default async function ClubFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: saved } = await supabase
    .from("saved_items")
    .select("id, target_type, target_id, created_at")
    .eq("user_id", user.id)
    .eq("target_type", "player_profile")
    .order("created_at", { ascending: false });

  const profileIds = unique((saved || []).map((item: any) => item.target_id));
  const { data: profiles } = profileIds.length
    ? await supabase
        .from("player_profiles")
        .select("id, display_name, sport, position, level, city, region, avatar_path, bio, roles_available")
        .in("id", profileIds)
    : { data: [] } as any;

  const profilesById = new Map((profiles || []).map((profile: any) => [profile.id, profile]));
  const items = (saved || []).map((item: any) => ({ ...item, profile: profilesById.get(item.target_id) })).filter((item: any) => item.profile);

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Favoris</p>
        <h1 className="font-display mt-2 text-[2.4rem] leading-tight text-[color:var(--text-main)]">Profils sauvegardés</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
          Garde les joueurs, arbitres et profils staff intéressants sous la main avant de les contacter.
        </p>
      </section>

      {items.length === 0 ? (
        <EmptyState eyebrow="Aucun favori" title="Aucun profil sauvegardé" description="Sauvegarde un profil sportif pour le retrouver ici plus tard." ctaHref="/app/club/joueurs" ctaLabel="Voir les profils" />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {items.map(({ id, target_id, profile }: any, index: number) => (
            <article key={id} className="premium-card animate-fade-up rounded-[26px] p-5" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="flex items-start gap-4">
                <PlayerAvatar avatarPath={profile.avatar_path} displayName={profile.display_name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{getRoleLabels(profile)}</p>
                  <h2 className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">{profile.display_name}</h2>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{[profile.sport, profile.position, profile.level, profile.city || profile.region].filter(Boolean).join(" • ")}</p>
                </div>
              </div>
              <p className="mt-5 line-clamp-3 text-sm leading-7 text-[color:var(--text-soft)]">{profile.bio || "Aucune bio."}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/app/club/joueurs/${profile.id}`} className="btn-secondary rounded-full px-4 py-2.5 text-sm font-medium">Voir le profil</Link>
                <FavoriteButton targetType="player_profile" targetId={target_id} initialSaved compact />
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
