"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type Role = "player" | "club";

type AppSidebarProps = {
  role: Role;
  notificationCount: number;
  identityLabel?: string;
  isAdmin?: boolean;
};

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V20h14V9.8" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
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

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
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

function ClubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
    </svg>
  );
}

function DocumentIcon() {
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
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function PlusIcon() {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function InboxIcon() {
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
      <path d="M4 13.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.5" />
      <path d="M4 13.5 6.5 18a2 2 0 0 0 1.75 1h7.5A2 2 0 0 0 17.5 18l2.5-4.5" />
      <path d="M9 13h6" />
    </svg>
  );
}


function HeartIcon() {
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
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function ContactIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ShieldIcon() {
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
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function FeedbackIcon() {
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
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 8h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function SettingsIcon() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 1-3 0 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 1 0-3 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 1 3 0 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .38.14.74.4 1a1.7 1.7 0 0 1 0 3c-.26.26-.4.62-.4 1Z" />
    </svg>
  );
}

function MenuIcon() {
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
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};

export default function AppSidebar({
  role,
  notificationCount,
  identityLabel,
  isAdmin = false,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const playerItems: NavItem[] = [
    { label: "Accueil", href: "/app/joueur/feed", icon: <HomeIcon /> },
    { label: "Fil d’actualité", href: "/app/joueur/fil", icon: <DocumentIcon /> },
    { label: "Mon profil", href: "/app/joueur/profil", icon: <UserIcon /> },
    { label: "Notifications", href: "/app/joueur/notifications", icon: <BellIcon />, badge: notificationCount },
    { label: "Demandes", href: "/app/joueur/demandes", icon: <InboxIcon /> },
    { label: "Contacts", href: "/app/joueur/contacts", icon: <ContactIcon /> },
    { label: "Favoris", href: "/app/joueur/favoris", icon: <HeartIcon /> },
    { label: "Retour bêta", href: "/app/retour-beta", icon: <FeedbackIcon /> },
    { label: "Clubs", href: "/app/joueur/clubs", icon: <ClubIcon /> },
    { label: "Opportunités", href: "/app/joueur/opportunites", icon: <DocumentIcon /> },
    { label: "Paramètres", href: "/app/joueur/parametres", icon: <SettingsIcon /> },
  ];

  const clubItems: NavItem[] = [
    { label: "Accueil", href: "/app/club/feed", icon: <HomeIcon /> },
    { label: "Fil d’actualité", href: "/app/club/fil", icon: <DocumentIcon /> },
    { label: "Ma fiche", href: "/app/club/profil", icon: <UserIcon /> },
    { label: "Notifications", href: "/app/club/notifications", icon: <BellIcon />, badge: notificationCount },
    { label: "Demandes", href: "/app/club/demandes", icon: <InboxIcon /> },
    { label: "Contacts", href: "/app/club/contacts", icon: <ContactIcon /> },
    { label: "Favoris", href: "/app/club/favoris", icon: <HeartIcon /> },
    { label: "Retour bêta", href: "/app/retour-beta", icon: <FeedbackIcon /> },
    { label: "Joueurs", href: "/app/club/joueurs", icon: <ClubIcon /> },
    { label: "Mes annonces", href: "/app/club/annonces", icon: <DocumentIcon /> },
    { label: "Paramètres", href: "/app/club/parametres", icon: <SettingsIcon /> },
  ];

  const items = role === "player" ? playerItems : clubItems;

  if (isAdmin) {
    items.push({ label: "Admin", href: "/app/admin", icon: <ShieldIcon /> });
  }

  const renderNav = () => (
    <nav className="mt-5 grid gap-1.5">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "group flex items-center justify-between rounded-[16px] px-3 py-2.5 transition",
              isActive
                ? "border border-white/10 bg-white/[0.075] font-medium text-white"
                : "border border-transparent text-white/62 hover:border-white/8 hover:bg-white/[0.045] hover:text-white",
            ].join(" ")}
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/15">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </span>

            {item.badge && item.badge > 0 ? (
              <span
                className={[
                  "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  isActive
                    ? "bg-white text-[#08111f]"
                    : "bg-white/12 text-white",
                ].join(" ")}
              >
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition hover:border-[#4f8cff]/30 hover:bg-[#4f8cff]/10"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10">
            <MenuIcon />
          </span>
          <span>Menu</span>
        </button>
      </div>

      <div
        className={[
          "fixed inset-0 z-[70] bg-[#050612]/82 backdrop-blur-md transition duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div
          className={[
            "absolute left-0 top-0 h-dvh w-[86vw] max-w-[380px] overflow-y-auto overscroll-contain border-r border-white/10 bg-[#0d1020]/96 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-[0_28px_110px_rgba(0,0,0,0.55)] transition duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                {role === "player" ? "Espace joueur" : "Espace club"}
              </p>
              <p className="mt-3 font-display text-[2rem] leading-none text-white">
                {identityLabel || (role === "player" ? "Espace joueur" : "Espace club")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white transition hover:bg-white/[0.06]"
              aria-label="Fermer le menu"
            >
              <CloseIcon />
            </button>
          </div>

          {renderNav()}
        </div>
      </div>

      <aside className="hidden w-full lg:block">
        <div className="sticky top-[102px] max-h-[calc(100dvh-118px)] overflow-y-auto overscroll-contain pr-1">
          <div className="premium-card rounded-[30px] p-5">
            <div className="border-b border-white/8 pb-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                {role === "player" ? "Espace joueur" : "Espace club"}
              </p>
              <p className="mt-3 font-display text-[2rem] leading-none text-white">
                {identityLabel || (role === "player" ? "Espace joueur" : "Espace club")}
              </p>
            </div>

            {renderNav()}
          </div>
        </div>
      </aside>
    </>
  );
}