import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "../../../../db/seed";
import { getArticleBySlug, listArticles } from "../../../../lib/queries";
import { Section, SectionHeading } from "../../../../components/section";
import { ArticleCard, FavoriteButton } from "../../../../components/cards";
import { Reveal } from "../../../../components/reveal";
import { ClockIcon, EyeIcon, NewsIcon } from "../../../../components/icons";
import { formatCompactNumber, formatDate, readingTime } from "../../../../lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  await ensureSeeded().catch(() => false);
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = (await listArticles({ limit: 6 })).filter((item) => item.slug !== article.slug).slice(0, 3);
  const paragraphs = article.content
    .split(/\n{1,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverUrl ? [article.coverUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: [{ "@type": "Person", name: article.author }],
    publisher: { "@type": "Organization", name: "Maniguadebaby" },
    articleSection: article.category,
    wordCount: article.content.split(/\s+/).length,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.coverUrl} alt="" className="h-full w-full animate-kenburns object-cover opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,10,0.8),#08060a)]" />
        </div>
        <Section className="relative py-14 md:py-20">
          <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream-mute">
            <Link href="/actualites" className="transition hover:text-gold-400">
              Actualités
            </Link>
            <span>/</span>
            <Link href={`/actualites?categorie=${encodeURIComponent(article.category)}`} className="transition hover:text-gold-400">
              {article.category}
            </Link>
          </nav>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400">
            <NewsIcon width={13} height={13} /> {article.category}
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-[clamp(2rem,5.6vw,4.4rem)] uppercase leading-[0.94] text-cream">
            {article.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-cream-dim md:text-lg">{article.excerpt}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
            <span className="font-heading text-sm font-bold normal-case tracking-normal text-cream">{article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-2">
              <ClockIcon width={13} height={13} /> {readingTime(article.content)} min de lecture
            </span>
            <span className="flex items-center gap-2">
              <EyeIcon width={13} height={13} /> {formatCompactNumber(article.views)} lectures
            </span>
            <FavoriteButton itemType="article" itemId={article.id} size={16} className="-my-2" />
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Reveal>
            <article className="max-w-3xl">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`mb-6 leading-relaxed text-cream-dim ${
                    index === 0
                      ? "border-l-2 border-mango-500 pl-5 font-heading text-xl leading-snug text-cream" :"text-[15px]"
                  }`}
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-900/70 p-6">
                <div>
                  <p className="font-heading text-base font-extrabold text-cream">Cet article vous a plu ?</p>
                  <p className="mt-1 text-sm text-cream-mute">
                    Enregistrez-le dans vos favoris et retrouvez-le à tout moment.
                  </p>
                </div>
                <FavoriteButton itemType="article" itemId={article.id} size={20} className="border border-white/15" />
              </div>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <aside className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cream-mute">Rubrique</p>
                  <p className="mt-1 font-heading text-lg font-extrabold text-cream">{article.category}</p>
                  <p className="mt-3 text-sm leading-relaxed text-cream-dim">{article.excerpt}</p>
                  <Link
                    href={`/actualites?categorie=${encodeURIComponent(article.category)}`}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-cream-dim transition hover:border-gold-400/60 hover:text-gold-300"
                  >
                    Plus d'articles de la rubrique
                  </Link>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </Section>

      {related.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow="Continuer la lecture" title="Articles liés" accent="#FF6A1A" />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ArticleCard article={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
