import Link from "next/link";
import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { LogoCalabash } from "@/components/brand-hero";
import {
  ArrowRightIcon,
  ClockIcon,
  DashboardIcon,
  MicIcon,
  SparkIcon,
  WaveIcon,
  VideoIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Espace Artiste",
  description:
    "Publiez vos morceaux, suivez vos écoutes et encaissez en Mobile Money : l'Espace Artiste Maniguadebaby arrive en Version 2.",
};

const BENEFITS = [
  {
    title: "Auto-publication",
    detail: "Déposez un morceau, une pochette et un clip depuis votre téléphone : validation éditoriale sous 24 h.",
    Icon: MicIcon,
  },
  {
    title: "Statistiques en temps réel",
    detail: "Écoutes, villes, playlists qui vous diffusent, morceaux les plus partagés : vos chiffres, sans intermédiaire.",
    Icon: DashboardIcon,
  },
  {
    title: "Revenus Mobile Money",
    detail: "Wave, Orange Money, MTN MoMo et Moov : vos royalties tombent directement sur votre numéro.",
    Icon: WaveIcon,
  },
  {
    title: "Clips & sessions",
    detail: "Hébergement vidéo intégrale, mise en avant sur la page d'accueil et dans les playlists éditoriales.",
    Icon: VideoIcon,
  },
];

const STEPS = [
  { step: "01", title: "Créez votre compte", detail: "Inscription gratuite avec votre email ou votre numéro de téléphone." },
  { step: "02", title: "Rattachez votre profil", detail: "L'équipe vérifie votre identité et relie votre compte à votre fiche artiste." },
  { step: "03", title: "Publiez", detail: "Mise en ligne de vos titres, pochettes et clips après validation éditoriale." },
  { step: "04", title: "Encaissez", detail: "Tableau de bord des écoutes et versements Mobile Money chaque mois." },
];

export default function EspaceArtistePage() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-mango-500/12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_110%_at_50%_10%,rgba(242,183,5,0.24),transparent_62%)]" />
        <div className="wax-pattern pointer-events-none absolute inset-0 opacity-[0.12]" />
        <Section className="relative py-16 md:py-22">
          <div className="flex flex-col items-center text-center">
            <LogoCalabash className="h-24 w-24 animate-float drop-shadow-[0_18px_40px_rgba(242,183,5,0.35)]" />
            <p className="mt-7 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-mango-400">
              <SparkIcon width={13} height={13} /> Version 2 · bientôt disponible
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.3rem,7vw,5rem)] font-extrabold uppercase leading-[0.9]">
              <span className="gold-text">Espace Artiste</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim md:text-lg">
              Maniguadebaby ouvre bientôt son auto-publication : déposez vos morceaux, suivez vos écoutes, encaissez en
              Mobile Money — depuis un seul tableau de bord, pensé pour les artistes d&apos;Afrique de l&apos;Ouest.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact#booking"
                className="flex items-center gap-2.5 rounded-full bg-gradient-to-b from-[#FFE9B3] via-[#F2B705] to-[#D99B00] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-[#241900] shadow-[0_16px_44px_-16px_rgba(242,183,5,0.85)] transition hover:brightness-110 active:scale-95"
              >
                Rejoindre la liste d&apos;attente <ArrowRightIcon width={15} height={15} />
              </Link>
              <Link
                href="/artistes"
                className="rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
              >
                Voir les artistes actuels
              </Link>
            </div>
          </div>
        </Section>
      </div>

      <Section className="py-14 md:py-18">
        <Reveal>
          <SectionHeading eyebrow="Ce que vous pourrez faire" title="Un studio, une banque, un public" accent="#F2B705" />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 55}>
              <article className="h-full rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition duration-500 hover:-translate-y-1 hover:border-mango-500/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mango-500/15 text-mango-400">
                  <benefit.Icon width={19} height={19} />
                </span>
                <h2 className="mt-4 font-heading text-lg font-extrabold text-cream">{benefit.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-cream-dim">{benefit.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-8 md:py-12">
        <Reveal>
          <SectionHeading eyebrow="Comment ça marche" title="Quatre étapes, zéro commission cachée" accent="#FFD97A" />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((item, index) => (
            <Reveal key={item.step} delay={index * 55}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                <span className="font-display text-5xl font-extrabold text-mango-500/25">{item.step}</span>
                <h2 className="mt-3 font-heading text-lg font-extrabold text-cream">{item.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-cream-dim">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-mango-500/25 bg-gradient-to-br from-ink-850 to-ink-900 p-8 md:p-10">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-mango-400">
                  <ClockIcon width={13} height={13} /> Calendrier
                </p>
                <h2 className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight text-cream sm:text-3xl">
                  Ouverture prévue : Version 2 — d&apos;ici 2 à 3 mois
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-dim">
                  En attendant, l&apos;équipe éditoriale publie et met en avant vos projets gratuitement : envoyez vos
                  morceaux, vos clips et vos dates de tournée via la page Booking, nous nous occupons de la vitrine.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact#booking"
                  className="rounded-full bg-gradient-to-b from-[#FFE9B3] via-[#F2B705] to-[#D99B00] px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-[#241900] transition hover:brightness-110"
                >
                  Envoyer mon projet
                </Link>
                <Link
                  href="/projet"
                  className="rounded-full border border-white/20 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
                >
                  Voir la feuille de route
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
