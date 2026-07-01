"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PostComposer from "@/components/post-composer";

type CreateContentMenuProps = {
  role: "player" | "club";
  authorLabel: string;
  defaultSport?: string | null;
  defaultCity?: string | null;
  defaultRegion?: string | null;
};

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function SparkIcon() {
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
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function DocumentIcon() {
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
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function CreateContentMenu({
  role,
  authorLabel,
  defaultSport,
  defaultCity,
  defaultRegion,
}: CreateContentMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setComposerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (composerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [composerOpen]);

  function openComposer() {
    setMenuOpen(false);
    setComposerOpen(true);
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#4f8cff]/25 bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] text-[#050612] shadow-[0_14px_45px_rgba(79,140,255,0.24)] transition hover:-translate-y-0.5"
          aria-label="Créer un contenu"
          aria-expanded={menuOpen}
        >
          <PlusIcon />
        </button>

        <div
          className={[
            "absolute right-0 top-12 z-[70] w-[260px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1020]/98 p-2 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition duration-200",
            menuOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(155,92,255,0.14),transparent_38%)]" />

          <div className="relative grid gap-1">
            <button
              type="button"
              onClick={openComposer}
              className="flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm text-white/82 transition hover:bg-white/[0.06] hover:text-white"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#00d4ff]">
                <SparkIcon />
              </span>
              <span>
                <span className="block font-medium">
                  {role === "club" ? "Nouvelle actualité" : "Nouvelle publication"}
                </span>
                <span className="mt-0.5 block text-xs text-white/45">
                  Publier dans le fil d’actualité
                </span>
              </span>
            </button>

            {role === "club" && (
              <Link
                href="/app/club/annonces/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm text-white/82 transition hover:bg-white/[0.06] hover:text-white"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9b5cff]">
                  <DocumentIcon />
                </span>
                <span>
                  <span className="block font-medium">Nouvelle annonce</span>
                  <span className="mt-0.5 block text-xs text-white/45">
                    Créer une offre de recrutement
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {mounted &&
        composerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto px-4 py-6 sm:py-10">
            <div
              className="fixed inset-0 bg-[#050612]/88 backdrop-blur-xl"
              onClick={() => setComposerOpen(false)}
              aria-hidden="true"
            />

            <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl items-start justify-center">
              <div className="relative w-full animate-fade-up overflow-hidden rounded-[34px] border border-white/10 bg-[#0d1020] shadow-[0_32px_100px_rgba(0,0,0,0.68)]">
                <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(155,92,255,0.12),transparent_34%)]" />

                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#07080f]/90 text-white transition hover:bg-white/[0.06]"
                  aria-label="Fermer"
                >
                  <CloseIcon />
                </button>

                <div className="relative z-10 p-4 pt-16 sm:p-6 sm:pt-16">
                  <PostComposer
                    authorType={role}
                    authorLabel={authorLabel}
                    defaultSport={defaultSport}
                    defaultCity={defaultCity}
                    defaultRegion={defaultRegion}
                    mode="modal"
                    onSuccess={() => setComposerOpen(false)}
                    onCancel={() => setComposerOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
