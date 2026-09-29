import Link from "next/link";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { HtmlBlock } from "@/components/external";
import {
  ArrowRightIcon,
  CompassIcon,
  DiscIcon,
  SparkIcon,
  VideoIcon,
  UserIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Importer vos designs & fichiers externes",
  description:
    "Guide d'import Maniguadebaby : glisser-déposer, GitHub ou copier-coller de code — où placer vos pages, composants, images, audio et clips dans le projet Next.js.",
};

/* --------------------------- Arborescence réelle --------------------------- */

const IGNORED = new Set(["node_modules", ".next", ".git", "dist", ".turbo", "tsconfig.tsbuildinfo"]);

function buildTree(root: string, prefix = "", depth = 0, maxDepth = 2): string[] {
  if (depth > maxDepth) return [];
  let entries: string[] = [];
  try {
    entries = readdirSync(root).filter((entry) => !IGNORED.has(entry)).sort();
  } catch {
    return [];
  }
  const lines: string[] = [];
  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const full = join(root, entry);
    let isDir = false;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      isDir = false;
    }
    lines.push(`${prefix}${isLast ? "└── " : "├── "}${entry}${isDir ? "/" : ""}`);
    if (isDir) {
      lines.push(...buildTree(full, `${prefix}${isLast ? "    " : "│   "}`, depth + 1, maxDepth));
    }
  });
  return lines;
}

/* ------------------------------ Maquette démo ------------------------------ */

const DEMO_HTML = `<div class="figma-card">
  <p class="figma-kicker">Bloc importé depuis Figma</p>
  <h3 class="figma-title">Nouvelle sortie · « Teranga »</h3>
  <p class="figma-text">Ndèye Fatou — Mbalax · 3:56</p>
</div>`;

const DEMO_CSS = `.figma-card{border:1px solid rgba(255,215,0,.35);border-radius:18px;padding:22px;background:linear-gradient(135deg,#1b150d,#12100a);}
.figma-kicker{margin:0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#FFD700;font-weight:700;}
.figma-title{margin:10px 0 6px;font-size:22px;font-weight:800;color:#FAF4E8;}
.figma-text{margin:0;font-size:13px;color:#D6C7AE;}`;

const METHODS = [
  {
    index: "Méthode 1",
    title: "Glisser-déposer",
    tag: "Le plus simple",
    accent: "#FFD700",
    steps: [
      "Ouvrez l'explorateur de fichiers de l'environnement (colonne de gauche).",
      "Déposez vos fichiers directement dans public/assets/ — images dans images/, MP3 dans audio/, MP4 dans clips/.",
      "Utilisez /api/media/audio/… pour servir un fichier immédiatement, même avant le prochain build.",
      "Les pages React/TSX vont dans src/app/ et les composants dans src/components/.",
      "Rafraîchissez : le lecteur persistant, la recherche et le back-office voient immédiatement les nouveaux contenus.",
    ],
  },
  {
    index: "Méthode 2",
    title: "Import via GitHub",
    tag: "Le plus professionnel",
    accent: "#F2B705",
    steps: [
      "Créez un dépôt sur GitHub et poussez vos fichiers externes (git push).",
      "Connectez le dépôt à l'environnement de développement : toute modification externe est synchronisée.",
      "Gardez le même répartiteur : src/ pour le code, public/ pour les médias.",
      "Utilisez des branches (design/accueil-v2) pour tester une refonte sans casser la production.",
    ],
  },
  {
    index: "Méthode 3",
    title: "Copier-coller du code",
    tag: "Depuis Figma, Locofy ou v0",
    accent: "#FFD97A",
    steps: [
      "Créez le fichier cible, par exemple src/components/external/MonBloc.tsx.",
      "Collez le HTML généré dans un composant <HtmlBlock html={…} css={…} /> (déjà fourni).",
      "Déposez les images exportées dans public/assets/images/ et remplacez les chemins par /assets/images/….",
      "Réutilisez ensuite le composant dans n'importe quelle page : le lecteur audio continue de jouer.",
    ],
  },
];

const CHECKLIST = [
  ["Images & icônes", "public/assets/images/ · public/assets/icons/", "URL publique /assets/images/…"],
  ["Morceaux MP3/WAV", "public/assets/audio/", "À renseigner dans Publier un morceau → URL audio"],
  ["Clips MP4", "public/assets/clips/", "URL publique /assets/clips/…"],
  ["Pages (routes)", "src/app/(site)/…/page.tsx", "Une page = un dossier + page.tsx"],
  ["Composants React", "src/components/", "Composants réutilisables (cards, hero…)"],
  ["Design Figma exporté", "src/components/external/ + <HtmlBlock />", "HTML/CSS collé, sans casser le routeur"],
  ["Couleurs, polices", "src/app/globals.css (@theme)", "Palette or/noir déjà configurée"],
  ["Données de catalogue", "Base PostgreSQL (back-office)", "Artistes, morceaux, albums, clips, articles"],
];

export default function ImporterPage() {
  const root = process.cwd();
  const tree = [
    "maniguadebaby/",
    ...buildTree(join(root, "src"), "", 0, 2),
    ...buildTree(join(root, "public"), "", 0, 1).map((line) => line),
  ];
  const hasAssets = existsSync(join(root, "public", "assets"));

  return (
    <>
      <div className="relative overflow-hidden border-b border-mango-500/12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_110%_at_25%_0%,rgba(242,183,5,0.22),transparent_62%)]" />
        <div className="wax-pattern pointer-events-none absolute inset-0 opacity-[0.10]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-mango-400">
            <CompassIcon width={14} height={14} /> Guide technique
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,6.6vw,4.8rem)] font-extrabold uppercase leading-[0.9] text-cream">
            Importer vos designs <span className="gold-text">externes</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-cream-dim">
            Code brut HTML/CSS, export Figma/Locofy/v0, ou dépôt GitHub : voici où chaque fichier doit atterrir dans
            Maniguadebaby pour ne rien casser — ni le routeur, ni le lecteur audio persistant.
          </p>

          {/* Réponses aux deux questions */}
          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-mango-500/30 bg-ink-900/70 p-6">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-mango-400">
                <SparkIcon width={12} height={12} /> Question 1 — vos fichiers externes
              </p>
              <h2 className="mt-3 font-heading text-lg font-extrabold text-cream">
                Code brut ou maquette Figma ? Les deux sont pris en charge.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-cream-dim">
                Le design de référence actuel est votre <strong className="text-cream">maquette or/noir</strong>, déjà
                codée dans le projet (hero, lecteur, navigation). Pour un nouveau visuel :
              </p>
              <ul className="mt-3 space-y-1.5 text-[13px] text-cream-dim">
                <li>• <strong className="text-cream">Code brut (HTML/CSS/JS)</strong> → collez-le dans <code className="font-mono text-mango-400">&lt;HtmlBlock /&gt;</code> ou convertissez-le en composant React.</li>
                <li>• <strong className="text-cream">Export Figma / Locofy / v0</strong> → HTML + CSS + images : composant dans <code className="font-mono text-mango-400">src/components/external/</code>, images dans <code className="font-mono text-mango-400">public/assets/images/</code>.</li>
                <li>• <strong className="text-cream">Simple image de maquette</strong> → envoyez-la, je la code en pages réelles.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-6">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-mango-400">
                <DiscIcon width={12} height={12} /> Question 2 — framework configuré
              </p>
              <h2 className="mt-3 font-heading text-lg font-extrabold text-cream">
                Next.js 16 (App Router) · React 19 · TypeScript
              </h2>
              <dl className="mt-3 space-y-2 text-[13px]">
                {[
                  ["Routage", "App Router — src/app/(site)/ pour le public, src/app/admin/ pour le back-office"],
                  ["Styles", "Tailwind CSS v4 — tokens or/noir dans src/app/globals.css"],
                  ["Base de données", "PostgreSQL + Drizzle ORM (modèle UUID, script Supabase fourni)"],
                  ["Authentification", "Sessions HMAC + Supabase Auth (bascule automatique)"],
                  ["Lecteur", "Contexte global monté dans le layout racine — survit à la navigation"],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-wrap items-baseline gap-2">
                    <dt className="min-w-[130px] text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">{label}</dt>
                    <dd className="flex-1 text-cream-dim">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>
      </div>

      {/* Méthodes */}
      <Section className="py-14 md:py-18">
        <Reveal>
          <SectionHeading
            eyebrow="Trois voies, un seul résultat"
            title="Comment injecter vos fichiers"
            accent="#FFD700"
          />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          {METHODS.map((method, index) => (
            <Reveal key={method.title} delay={index * 70}>
              <article
                className="h-full rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition duration-500 hover:-translate-y-1 hover:border-mango-500/40"
                style={{ boxShadow: `inset 3px 0 0 0 ${method.accent}` }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm uppercase tracking-[0.16em]" style={{ color: method.accent }}>
                    {method.index}
                  </span>
                  <span className="ml-auto rounded-full border border-white/12 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-cream-mute">
                    {method.tag}
                  </span>
                </div>
                <h2 className="mt-3 font-heading text-xl font-extrabold text-cream">{method.title}</h2>
                <ol className="mt-4 space-y-3">
                  {method.steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-3 text-[13px] leading-relaxed text-cream-dim">
                      <span
                        className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-ink-950"
                        style={{ background: method.accent }}
                      >
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Répartition des fichiers */}
      <Section className="py-8 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Reveal>
            <SectionHeading
              eyebrow="Répartiteur"
              title="Quel fichier, quel dossier"
              description="Suivez ce tableau et aucun import ne cassera le système de routes ni le lecteur audio."
              accent="#FFD97A"
            />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      {["Contenu", "Emplacement", "Ce qu'il en résulte"].map((head) => (
                        <th key={head} className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CHECKLIST.map(([content, place, result]) => (
                      <tr key={content} className="border-b border-white/5 transition hover:bg-white/[0.04]">
                        <td className="px-5 py-3 font-heading text-[13px] font-bold text-cream">{content}</td>
                        <td className="px-5 py-3 font-mono text-[12px] text-mango-400">{place}</td>
                        <td className="px-5 py-3 text-[12.5px] text-cream-mute">{result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <SectionHeading
              eyebrow={hasAssets ? "dossiers créés ✓" : "structure"}
              title="Votre projet, tel qu'il est"
              accent="#F2B705"
            />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-mango-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-cream-mute/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-baobab-500/60" />
                <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-cream-mute">
                  arborescence générée à la volée
                </span>
              </div>
              <pre className="hide-scrollbar max-h-[420px] overflow-auto px-5 py-4 font-mono text-[11.5px] leading-[1.7] text-cream-dim">
                <code>{tree.join("\n")}</code>
              </pre>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Démonstration HtmlBlock */}
      <Section className="py-8 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Méthode 3 en action"
              title="Un bloc Figma, déjà branché"
              description="Ce visuel ci-dessous n'est pas codé à la main : c'est le composant HtmlBlock qui rend un extrait HTML/CSS externe, exactement comme le ferait votre export de design."
              accent="#FFD700"
            />
            <HtmlBlock html={DEMO_HTML} css={DEMO_CSS} blockId="demo-figma" />
            <p className="mt-4 text-[12.5px] leading-relaxed text-cream-mute">
              Vos exports suivent le même chemin : <code className="font-mono text-mango-400">src/components/external/</code>{" "}
              pour le code, <code className="font-mono text-mango-400">public/assets/images/</code> pour les visuels.
            </p>
          </Reveal>

          <Reveal delay={110}>
            <SectionHeading
              eyebrow="Checklist avant import"
              title="Les 5 règles qui évitent les erreurs"
              accent="#FFD97A"
            />
            <ol className="space-y-3">
              {[
                "Médias dans public/ — jamais dans src/ : sinon le bundler les écrase. URL : /assets/… ou /api/media/… pour un service immédiat.",
                "Une route = un dossier avec page.tsx dans src/app/(site)/ — ne renommez pas les pages existantes.",
                "Le lecteur vit dans le layout racine : ne placez jamais un second composant <audio> dans vos imports.",
                "Couleurs et polices : passez par les tokens de src/app/globals.css pour rester cohérent avec l'identité or/noir.",
                "Après chaque import, lancez la validation : npx tsc --noEmit puis npm run build.",
              ].map((rule, index) => (
                <li key={rule} className="flex gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-[13px] leading-relaxed text-cream-dim">
                  <span className="font-display text-lg text-mango-500">{String(index + 1).padStart(2, "0")}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-mango-500/25 bg-gradient-to-br from-ink-850 to-ink-900 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase leading-tight text-cream sm:text-3xl">
                Envoyez votre design, je l&apos;intègre
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-dim">
                Maquette, export Figma ou fichiers bruts : indiquez ce que vous avez, et je le convertis en pages réelles
                branchées sur le lecteur, la recherche et le back-office.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact#contact"
                className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#FFE9B3] via-[#F2B705] to-[#D99B00] px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-[#241900] transition hover:brightness-110"
              >
                Décrire mon fichier <ArrowRightIcon width={15} height={15} />
              </Link>
              <Link
                href="/admin/publier"
                className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
              >
                <UserIcon width={15} height={15} /> Publier un morceau
              </Link>
              <Link
                href="/projet"
                className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
              >
                <VideoIcon width={15} height={15} /> Architecture
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
