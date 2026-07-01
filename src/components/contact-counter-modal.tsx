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
};

export default function ContactCounterModal({
  label = "Contacts",
  contacts,
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group w-full text-left transition hover:-translate-y-0.5"
      >
        <div className="premium-card rounded-[28px] p-5 transition group-hover:border-[#4f8cff]/35 group-hover:bg-white/[0.045]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{count}</p>
            </div>
            <span className="rounded-full border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-3 py-1 text-[11px] font-medium text-[#8bb7ff]">
              Voir
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            {count > 0 ? "Clique pour voir les contacts débloqués." : "Aucun contact débloqué pour le moment."}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-8">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-default bg-[#02030a]/78 backdrop-blur-xl"
          />

          <section className="premium-card relative z-10 max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-[34px] border border-white/10 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#35e6a5]">Contacts débloqués</p>
                <h2 className="font-display mt-3 text-[2.4rem] uppercase leading-[0.9] text-white">
                  {count} contact{count > 1 ? "s" : ""}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Les profils affichés ici correspondent aux demandes acceptées.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/72 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="mt-7 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
              {count === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5 text-sm leading-7 text-white/62">
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
                        <p className="truncate text-base font-semibold text-white">{contact.name}</p>
                        {contact.subtitle && <p className="mt-1 truncate text-sm text-white/52">{contact.subtitle}</p>}
                      </div>
                      {contact.href && <span className="text-sm font-medium text-[#8bb7ff]">Voir</span>}
                    </div>
                  );

                  if (contact.href) {
                    return (
                      <Link
                        key={`${contact.type}-${contact.id}`}
                        href={contact.href}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-[24px] border border-white/8 bg-white/[0.035] p-4 transition hover:border-[#4f8cff]/30 hover:bg-white/[0.06]"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={`${contact.type}-${contact.id}`} className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4">
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
