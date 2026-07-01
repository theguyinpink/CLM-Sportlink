import { createClient } from "@/lib/supabase/server";
import SiteNavbarClient from "@/components/site-navbar-client";

export default async function SiteNavbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const role = user?.user_metadata?.role as "player" | "club" | undefined;
  const userId = user?.id ?? null;

  let homeHref = "/";
  let profileHref = "/connexion";
  let notificationsHref = "/connexion";
  let notificationCount = 0;
  let identityLabel = "";
  let defaultSport: string | null = null;
  let defaultCity: string | null = null;
  let defaultRegion: string | null = null;

  if (role === "player" && userId) {
    homeHref = "/app/joueur/feed";
    profileHref = "/app/joueur/profil";
    notificationsHref = "/app/joueur/notifications";

    const { data: profile } = await supabase
      .from("player_profiles")
      .select("id, display_name, sport, city, region")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      identityLabel = profile.display_name || "Profil joueur";
      defaultSport = profile.sport || null;
      defaultCity = profile.city || null;
      defaultRegion = profile.region || null;

      const { count } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("player_profile_id", profile.id)
        .eq("status", "pending")
        .eq("source_role", "club");

      notificationCount = count ?? 0;
    }
  }

  if (role === "club" && userId) {
    homeHref = "/app/club/feed";
    profileHref = "/app/club/profil";
    notificationsHref = "/app/club/notifications";

    const { data: club } = await supabase
      .from("clubs")
      .select("id, club_name, sport, city, region")
      .eq("user_id", userId)
      .maybeSingle();

    if (club) {
      identityLabel = club.club_name || "Fiche club";
      defaultSport = club.sport || null;
      defaultCity = club.city || null;
      defaultRegion = club.region || null;

      const { count } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("club_id", club.id)
        .eq("status", "pending")
        .eq("source_role", "player");

      notificationCount = count ?? 0;
    }
  }

  return (
    <SiteNavbarClient
      isAuthenticated={isAuthenticated}
      homeHref={homeHref}
      profileHref={profileHref}
      notificationsHref={notificationsHref}
      notificationCount={notificationCount}
      role={role}
      identityLabel={identityLabel}
      defaultSport={defaultSport}
      defaultCity={defaultCity}
      defaultRegion={defaultRegion}
    />
  );
}