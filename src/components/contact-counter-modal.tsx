"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ClubLogo from "@/components/club-logo";
import PlayerAvatar from "@/components/player-avatar";

type ContactItem = {
  id: string;
  name: string;
  subtitle?: string | null;
  imagePath?: string | null;
  href?: string;
  type: "player" | "club";
};

type ContactCounterModalProps = {
  label?: string;
  contacts: ContactItem[];
  variant?: "card" | "stat";
};

export default function ContactCounterModal({
  label = "Contacts",
  contacts,
  variant = "card",
}: ContactCounterModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const uniqueContacts = useMemo(() => {
    const map = new Map<string, ContactItem>();
    for (const contact of contacts) {
      if (!contact?.id) continue;
      map.set(contact.id, contact);
    }
    return Array.from(map.values());
  }, [contacts]);

  const count = uniqueContacts.length;

  const trigger =
    variant === "stat" ? (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="profile-stat text-left transition hover:border-[color:var(--line-strong)]"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{label}</p>
        <p className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">{count}</p>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group w-full text-left transition hover:-translate-y-0.5"
      >
        <div className="premium-card rounded-[28px] p-5 transition group-hover:border-[color:var(--line-strong)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{count}</p>
            </div>
            <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1 text-[11px] font-medium text-[color:var(--primary)]">
              Voir
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
            {count > 0 ? "Clique pour voir les contacts débloqués." : "Aucun contact débloqué pour le moment."}
          </p>
        </div>
      </button>
    );

  return (
    <>
      {trigger}

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-8">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-md"
          />

          <section className="premium-card relative z-10 max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-[28px] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.30)] sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--success)]">Contacts débloqués</p>
                <h2 className="font-display mt-3 text-[2.2rem] leading-[0.96] text-[color:var(--text-main)]">
                  {count} contact{count > 1 ? "s" : ""}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">
                  Les profils affichés ici correspondent aux demandes acceptées.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] text-lg text-[color:var(--text-soft)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--text-main)]"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="mt-7 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
              {count === 0 ? (
                <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-5 text-sm leading-7 text-[color:var(--text-muted)]">
                  Aucun contact débloqué pour le moment. Dès qu’une demande est acceptée, le contact apparaîtra ici.
                </div>
              ) : (
                uniqueContacts.map((contact) => {
                  const content = (
                    <div className="flex min-w-0 items-center gap-4">
                      {contact.type === "club" ? (
                        <ClubLogo logoPath={contact.imagePath} clubName={contact.name} size="md" />
                      ) : (
                        <PlayerAvatar avatarPath={contact.imagePath} displayName={contact.name} size="md" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-[color:var(--text-main)]">{contact.name}</p>
                        {contact.subtitle && <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">{contact.subtitle}</p>}
                      </div>
                      {contact.href && <span className="text-sm font-medium text-[color:var(--primary)]">Voir</span>}
                    </div>
                  );

                  if (contact.href) {
                    return (
                      <Link
                        key={`${contact.type}-${contact.id}`}
                        href={contact.href}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4 transition hover:border-[color:var(--line-strong)]"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={`${contact.type}-${contact.id}`} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4">
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
