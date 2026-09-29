import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listArticles, listArtists } from "@/lib/queries";
import { Section, SectionHeading, ViewAllLink } from "@/components/section";
import { ArticleCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { NewsIcon, SparkIcon, MicIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magazine — Dossiers culturels & portraits",
  description:
    "Le magazine Maniguadebaby : portraits d'artistes, histoire du mbalax, du mandingue et du coupé-décalé, scènes de Dakar à Conakry.",
};

const DOSSIERS = [
  {
    title: "Mbalax : comment le sabar de Dakar a conquis le monde",
    theme: "Dossier",
    read: "12 min de lecture",
    excerpt:
      "Du xalam des griots aux machines de studio : généalogie d'un tempo qui ne lâche jamais, porté par Youssou N'Dour puis par la nouvelle génération.",
  },
  {
    title: "Mandingue : la kora, ce téléphone avec les ancêtres",
    theme: "Entretien",
    read: "9 min de lecture",
    excerpt:
      "De Kéla à Conakry, les maîtres de la kora transmettent encore leurs vingt-et-une cordes. Rencontre avec ceux qui l'adaptent aux boîtes à rythmes.",
  },
  {
    title: "Coupé-décalé : vingt ans de pas de danse",
    theme: "Rétrospective",
    read: "15 min de lecture",
    excerpt:
      "Né dans les maquis d'Abidjan, exporté jusqu'à Paris, réinventé par les ambianceurs d'aujourd'hui : histoire d'un genre qui ne vieillit pas.",
  },
  {
    title: "Highlife : les guitares du Ghana qui ont écrit l'Afrique",
    theme: "Archives",
    read: "11 min de lecture",
    excerpt:
      "Des ballables d'Accra aux fanfares d'Osibi : le highlife reste la matrice de la pop ouest-africaine.",
  },
];

export default async function MagazinePage() {
  await ensureSeeded().catch(() => false);
  const [articles, artists] = await Promise.all([listArticles({ limit: 12 }), listArtists({ limit: 8 })]);
  const [lead, ...rest] = articles ?? [];

  return (
    <>
      <div className="relative overflow-hidden border-b border-mango-500/12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_110%_at_80%_0%,rgba(242,183,5,0.2),transparent_60%),radial-gradient(60%_100%_at_10%_20%,rgba(245,197,66,0.12),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-mango-400">
            <NewsIcon width={14} height={14} /> Magazine
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,7vw,5.2rem)] font-extrabold uppercase leading-[0.9] text-cream">
            Le magazine de la <span className="gold-text">culture ouest-africaine</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            Dossiers de fond, portraits, histoire des genres et enquêtes sur l&apos;industrie : de Dakar à Conakry, le
            magazine raconte la musique dans son contexte — terroir, migration, studios et scènes.
          </p>
        </Section>
      </div>

      <Section className="py-14 md:py-18">
        <Reveal>
          <SectionHeading eyebrow="Nos dossiers culturels" title="À lire en profondeur" accent="#FFD97A" />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {DOSSIERS.map((dossier, index) => (
            <Reveal key={dossier.title} delay={index * 60}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition duration-500 hover:-translate-y-1 hover:border-mango-500/40">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-mango-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-mango-400">
                    {dossier.theme}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-cream-mute">{dossier.read}</span>
                </div>
                <h2 className="mt-4 font-heading text-xl font-extrabold leading-tight text-cream transition group-hover:text-mango-300">
                  {dossier.title}
                </h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-cream-dim">{dossier.excerpt}</p>
                <p className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400">
                  Lire le dossier
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {lead && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow="Le fil du moment" title="Dernières publications" accent="#F2B705" action={<ViewAllLink href="/actualites" label="Fil d'actualité" />} />
          </Reveal>
          <Reveal>
            <ArticleCard article={lead} featured />
          </Reveal>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.slice(0, 6).map((article, index) => (
              <Reveal key={article.id} delay={index * 55}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Portraits"
            title="Les artistes du magazine"
            accent="#F2B705"
            action={<ViewAllLink href="/artistes" label="Tous les artistes" />}
          />
        </Reveal>
        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artistes/${artist.slug}`}
              className="group flex min-w-[240px] shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-ink-900/60 p-4 transition hover:-translate-y-1 hover:border-mango-500/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artist.coverUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
              <span className="min-w-0">
                <span className="block truncate font-heading text-base font-extrabold text-cream">{artist.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-cream-mute">
                  {artist.city}, {artist.country}
                </span>
                <span className="mt-1 block items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-mango-400">
                  <MicIcon width={11} height={11} className="mr-1 inline" />
                  Lire le portrait
                </span>
              </span>
            </Link>
          ))}
        </div>
        <Reveal delay={100}>
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-mango-500/25 bg-ink-900/60 p-6">
            <SparkIcon width={20} height={20} className="text-mango-400" />
            <p className="max-w-2xl text-sm leading-relaxed text-cream-dim">
              Vous êtes journaliste, photographe ou passionné de culture ouest-africaine ? Le magazine accueille les
              contributions : enquêtes, portraits et récits de scène.
            </p>
            <Link
              href="/contact#contact"
              className="ml-auto rounded-full border border-mango-500/60 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-mango-400 transition hover:bg-mango-500/10"
            >
              Proposer un sujet
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
