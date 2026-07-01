import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/app-sidebar";
import { isAdminEmail } from "@/lib/admin";

export default async function ConnectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const role = user.user_metadata?.role as "player" | "club" | undefined;
  const userId = user.id;

  if (!role || (role !== "player" && role !== "club")) {
    redirect("/connexion");
  }

  let notificationCount = 0;
  let identityLabel = "";
  const isAdmin = isAdminEmail(user.email);

  if (role === "player") {
    const { data: profile } = await supabase
      .from("player_profiles")
      .select("id, display_name")
      .eq("user_id", userId)
      .maybeSingle();

    identityLabel = profile?.display_name || "Profil joueur";

    if (profile) {
      const { count } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("player_profile_id", profile.id)
        .eq("status", "pending")
        .eq("source_role", "club");

      notificationCount = count ?? 0;
    }
  }

  if (role === "club") {
    const { data: club } = await supabase
      .from("clubs")
      .select("id, club_name")
      .eq("user_id", userId)
      .maybeSingle();

    identityLabel = club?.club_name || "Profil club";

    if (club) {
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
    <div className="mx-auto w-full max-w-[1720px] px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-10 xl:grid-cols-[300px_minmax(0,1fr)]">
        <AppSidebar
          role={role}
          notificationCount={notificationCount}
          identityLabel={identityLabel}
          isAdmin={isAdmin}
        />

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}