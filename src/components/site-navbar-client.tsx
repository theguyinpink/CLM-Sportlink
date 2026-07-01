"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CreateContentMenu from "@/components/create-content-menu";
import ThemeToggle from "@/components/theme-toggle";

type SiteNavbarClientProps = {
  isAuthenticated: boolean;
  homeHref: string;
  profileHref: string;
  notificationsHref: string;
  notificationCount: number;
  role?: "player" | "club" | null;
  identityLabel?: string;
  defaultSport?: string | null;
  defaultCity?: string | null;
  defaultRegion?: string | null;
};

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 17a2 2 0 0 0 4 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-4 w-5">
      <span
        className={[
          "absolute left-0 top-0 h-[1.5px] w-5 bg-current transition-all duration-300",
          open ? "top-[7px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[7px] h-[1.5px] w-5 bg-current transition-all duration-300",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[14px] h-[1.5px] w-5 bg-current transition-all duration-300",
          open ? "top-[7px] -rotate-45" : "",
        ].join(" ")}
      />
    </div>
  );
}

export default function SiteNavbarClient({
  isAuthenticated,
  homeHref,
  profileHref,
  notificationsHref,
  notificationCount,
  role,
  identityLabel,
  defaultSport,
  defaultCity,
  defaultRegion,
}: SiteNavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const links = useMemo(
    () =>
      isAuthenticated
        ? []
        : [
            { href: homeHref, label: "Accueil" },
            { href: "/comment-ca-marche", label: "Fonctionnement" },
            { href: "/tarifs", label: "Tarifs" },
            { href: "/faq", label: "FAQ" },
            { href: "/contact", label: "Contact" },
          ],
    [homeHref, isAuthenticated]
  );

  const connectedModeLabel = homeHref.includes("/club/")
    ? "Espace club"
    : "Espace joueur";

  const closeMenu = () => setOpen(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    const target = isAuthenticated
      ? role === "club"
        ? "/app/club/joueurs"
        : "/app/joueur/opportunites"
      : "/joueurs";

    router.push(`${target}?q=${encodeURIComponent(query)}`);
    setSearch("");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--nav-bg)] backdrop-blur-xl">
        <div className="relative flex h-[72px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 2xl:px-10">
          <Link
            href={homeHref}
            className="group relative z-10 flex min-w-0 items-center gap-3"
            onClick={closeMenu}
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.035]">
              <div className="absolute inset-0 bg-white/[0.02] opacity-80 transition group-hover:opacity-100" />
              <Image
                src="/logo.png"
                alt="CLM SportLink"
                width={36}
                height={36}
                className="relative h-8 w-8 object-contain"
                priority
              />
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="font-display text-[1.38rem] leading-none text-[color:var(--text-main)] lg:text-[1.55rem]">
                CLM SportLink
              </p>
            </div>
          </Link>

          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[min(780px,calc(100vw-520px))] min-w-[420px] -translate-x-1/2 -translate-y-1/2 items-center justify-center lg:flex">
            <form
              onSubmit={handleSearch}
              className="pointer-events-auto flex w-full items-center justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-2 shadow-sm transition focus-within:border-[color:var(--line-strong)] focus-within:bg-[color:var(--surface-strong)]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 text-[color:var(--text-muted)]">
                <SearchIcon />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    isAuthenticated
                      ? role === "club"
                        ? "Rechercher un joueur, un poste, une ville..."
                        : "Rechercher une opportunité, un club, une ville..."
                      : "Rechercher un talent, un club, une ville..."
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--text-main)] outline-none placeholder:text-[color:var(--text-dim)]"
                />
              </div>

              {!isAuthenticated ? (
                <nav className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={[
                        "rounded-full px-3.5 py-2 text-sm transition",
                        isActive(link.href)
                          ? "bg-[color:var(--text-main)] text-[color:var(--bg)] font-medium"
                          : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text-main)]",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              ) : (
                <button
                  type="submit"
                  className="rounded-full border border-[color:var(--text-main)] bg-[color:var(--text-main)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--bg)] transition hover:opacity-90"
                >
                  Rechercher
                </button>
              )}
            </form>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-2.5">
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <Link
                  href="/connexion"
                  className="hidden rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-sm text-[color:var(--text-soft)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--text-main)] sm:inline-flex"
                >
                  Connexion
                </Link>

                <Link
                  href="/inscription/role"
                  className="btn-primary hidden px-4 py-2.5 text-sm sm:inline-flex"
                >
                  Créer un profil
                </Link>
              </>
            ) : (
              <>
                {role && (
                  <CreateContentMenu
                    role={role}
                    authorLabel={identityLabel || (role === "club" ? "Fiche club" : "Profil joueur")}
                    defaultSport={defaultSport}
                    defaultCity={defaultCity}
                    defaultRegion={defaultRegion}
                  />
                )}

                <Link
                  href={notificationsHref}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--text-soft)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--text-main)]"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#35e6a5] px-1 text-[10px] font-bold text-[#050612] shadow-[0_0_20px_rgba(53,230,165,0.35)]">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Link>

                <Link
                  href={profileHref}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--text-soft)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--text-main)]"
                  aria-label="Mon compte"
                >
                  <UserIcon />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={[
                "h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white transition hover:bg-white/[0.06] lg:hidden",
                isAuthenticated ? "hidden" : "inline-flex",
              ].join(" ")}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-40 bg-[#050612]/82 backdrop-blur-md transition duration-300 lg:hidden",
          !isAuthenticated && open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-x-4 top-[94px] overflow-hidden rounded-[30px] border border-white/10 bg-[#0d1020]/96 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.5)] transition duration-300",
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(155,92,255,0.14),transparent_38%)]" />
          <div className="relative space-y-2">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={[
                  "block rounded-full px-4 py-3 text-sm transition animate-fade-up",
                  isActive(link.href)
                    ? "bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] font-semibold text-[#050612]"
                    : "text-white/78 hover:bg-white/[0.05] hover:text-white",
                ].join(" ")}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="mt-4 grid gap-2 border-t border-white/8 pt-4">
                <Link
                  href="/connexion"
                  onClick={closeMenu}
                  className="block rounded-full border border-white/10 px-4 py-3 text-sm text-white/78"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription/role"
                  onClick={closeMenu}
                  className="block rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-4 py-3 text-sm font-bold text-[#050612]"
                >
                  Créer un profil
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
