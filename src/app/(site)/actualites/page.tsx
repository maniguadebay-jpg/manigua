import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listArticleCategories, listArticles } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { ArticleCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { NewsIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités musicales — Le journal du mouvement",
  description:
    "Sorties d'albums, tops & charts, interviews, chroniques et analyses de l'industrie musicale ivoirienne et ouest-africaine.",
};

type Props = { searchParams: Promise<{ categorie?: string; q?: string }> };

export default async function ActualitesPage({ searchParams }: Props) {
  const params = await searchParams;
  await ensureSeeded().catch(() => false);
  const categorie = params.categorie ?? "";
  const q = params.q ?? "";

  const [categories, articleRows] = await Promise.all([
    listArticleCategories(),
    listArticles({ category: categorie || undefined, search: q || undefined, limit: 60 }),
  ]);

  const [lead, ...others] = articleRows;

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_25%_0%,rgba(255,197,61,0.18),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-gold-400">
            <NewsIcon width={14} height={14} /> Rédaction
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Actualités <span className="text-mango-500">&</span> potins
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            Le journal du mouvement : chiffres de streaming, sorties de clips, interviews d'artistes et coulisses de
            l'industrie musicale ouest-africaine. {articleRows.length} articles publiés.
          </p>

          <form method="get" action="/actualites" className="mt-7 flex flex-wrap gap-3">
            {categorie && <input type="hidden" name="categorie" value={categorie} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher un article…"
              className="min-w-[240px] flex-1 rounded-full border border-white/15 bg-ink-950/60 px-5 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/70 focus:border-gold-400/70"
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-br from-gold-300 to-mango-500 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
            >
              Rechercher
            </button>
          </form>

          <div className="hide-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/actualites"
              className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                !categorie ? "border-gold-400 bg-gold-400/15 text-gold-300" : "border-white/12 text-cream-dim hover:text-cream"
              }`}
            >
              Toutes les rubriques
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/actualites?categorie=${encodeURIComponent(category)}`}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                  categorie === category
                    ? "border-gold-400 bg-gold-400/15 text-gold-300"
                    : "border-white/12 text-cream-dim hover:text-cream"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        {lead && (
          <Reveal>
            <SectionHeading eyebrow="À la une" title={categorie || "Dernier article"} accent="#FFC53D" />
            <ArticleCard article={lead} featured />
          </Reveal>
        )}

        {others.length > 0 && (
          <>
            <Reveal>
              <div className="mt-12">
                <SectionHeading eyebrow="Le fil" title="Toutes les publications" accent="#FF6A1A" />
              </div>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-2">
              {others.map((article, index) => (
                <Reveal key={article.id} delay={Math.min(index, 8) * 45}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {articleRows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center text-sm text-cream-mute">
            Aucun article trouvé pour ces critères.
          </p>
        )}
      </Section>
    </>
  );
}
