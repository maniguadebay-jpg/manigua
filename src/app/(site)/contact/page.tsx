import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { InstagramIcon, MapPinIcon, SparkIcon, UserIcon, WaveIcon, YoutubeIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking & Contact",
  description:
    "Réservez un artiste Maniguadebaby pour votre événement, écrivez à la rédaction ou rejoignez la communauté — Sénégal, Mali, Côte d'Ivoire, Guinée et au-delà.",
};

const CONTACTS = [
  {
    label: "Booking & événements",
    value: "booking@maniguadebaby.ci",
    detail: "Concerts, festivals, mariages, soirées corporate, campagnes de marque.",
    Icon: SparkIcon,
    accent: "#F2B705",
  },
  {
    label: "Rédaction & presse",
    value: "redaction@maniguadebaby.ci",
    label2: "",
    detail: "Sorties d'albums, interviews, guides culturels, partenariats média.",
    Icon: UserIcon,
    accent: "#FFD97A",
  },
  {
    label: "WhatsApp direct",
    value: "Assistance 7j/7 · 8h – 20h (GMT)",
    detail: "La voie la plus rapide pour une demande de booking urgente.",
    Icon: WaveIcon,
    accent: "#2FBF71",
  },
];

export default function ContactPage() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-mango-500/12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_110%_at_25%_0%,rgba(242,183,5,0.22),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-mango-400">
            <MapPinIcon width={14} height={14} /> Booking · Contact
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,7vw,5.2rem)] font-extrabold uppercase leading-[0.9] text-cream">
            Travaillons <span className="gold-text">ensemble</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            Maniguadebaby représente et met en avant les artistes d&apos;Afrique de l&apos;Ouest. Que vous soyez
            organisateur, label, marque ou média, notre équipe répond sous 48 heures ouvrées.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {CONTACTS.map((contact) => (
              <div
                key={contact.label}
                className="rounded-2xl border border-white/10 bg-ink-900/70 p-5 transition hover:-translate-y-1 hover:border-mango-500/40"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${contact.accent}1f`, color: contact.accent }}
                >
                  <contact.Icon width={18} height={18} />
                </span>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute">{contact.label}</p>
                <p className="mt-1 font-heading text-base font-extrabold text-cream">{contact.value}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-cream-dim">{contact.detail}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section className="py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div id="booking" className="scroll-mt-28">
              <ContactForm
                kind="booking"
                title="Demander un booking"
                description="Indiquez votre événement, la date souhaitée et votre budget : nous revenons avec la disponibilité des artistes et un devis détaillé."
                cta="Envoyer la demande"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div id="contact" className="scroll-mt-28">
              <ContactForm
                kind="contact"
                title="Écrire à Maniguadebaby"
                description="Partenariats, presse, idées de collaborations, signalement d'un contenu : la porte est ouverte."
                cta="Envoyer le message"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="py-8 md:py-14">
        <Reveal>
          <SectionHeading eyebrow="Antennes locales" title="Nous rencontrer" accent="#FFD97A" />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { city: "Dakar", country: "Sénégal", note: "Studio principal · Plateau" },
            { city: "Abidjan", country: "Côte d'Ivoire", note: "Rédaction · Cocody" },
            { city: "Bamako", country: "Mali", note: "Coordination artistes · ACI 2000" },
            { city: "Conakry", country: "Guinée", note: "Partenariats · Kaloum" },
          ].map((antenna) => (
            <div key={antenna.city} className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
              <p className="flex items-center gap-2 font-heading text-lg font-extrabold text-cream">
                <MapPinIcon width={16} height={16} className="text-mango-500" />
                {antenna.city}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-mango-400">{antenna.country}</p>
              <p className="mt-2 text-[12.5px] text-cream-dim">{antenna.note}</p>
            </div>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-mango-500/25 bg-gradient-to-br from-ink-850 to-ink-900 p-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase leading-none text-cream sm:text-3xl">
                Artiste ? Rejoignez la vitrine
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-dim">
                L&apos;Espace Artiste ouvre ses portes en Version 2 : auto-publication de vos morceaux, statistiques
                d&apos;écoute et revenus Mobile Money. Inscrivez-vous dès maintenant sur la liste d&apos;attente.
              </p>
            </div>
            <Link
              href="/espace-artiste"
              className="shrink-0 rounded-full bg-gradient-to-b from-[#FFE9B3] via-[#F2B705] to-[#D99B00] px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-[#241900] transition hover:brightness-110"
            >
              Découvrir l&apos;espace artiste
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
