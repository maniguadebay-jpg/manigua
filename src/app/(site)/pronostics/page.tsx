import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/section";
import { BallIcon } from "@/components/pronostics/icons";
import { Reveal } from "@/components/reveal";
import BetCalculator from "@/components/pronostics/bet-calculator";
import { fairOdds, formatOdds, formatPercent, expectedValue } from "@/lib/betting";
import {
  BANKROLL_UNITS,
  RESPONSIBLE_GAMBLING,
  listPronostics,
  type PronosticAnalysis,
} from "@/lib/pronostics";
import { formatKickoffLong, kickoffStatus } from "@/lib/pronostics-view";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Pronostics football — méthode, valeur et gestion de mise",
  description:
    "Fiches d'analyse football : lecture des compositions, cotes sans marge, modèle de buts et mise fractionnée. Un calculateur de valeur attendue est fourni pour vérifier chaque pari.",
  keywords: [
    "pronostic football",
    "valeur attendue",
    "cotes sans marge",
    "gestion de bankroll",
    "Kelly fractionné",
    "modèle Poisson",
  ],
};

const METHOD_STEPS = [
  {
    title: "L'information avant la forme",
    body: "Une composition d'équipe réserve pèse plus que quinze matchs de statistiques. On cherche le fait nouveau — blessures, turnover, turnover adverse — et on regarde si le marché l'a déjà intégré.",
  },
  {
    title: "Comparer à cote juste",
    body: "On retire la marge du bookmaker pour retrouver le consensus du marché, puis on confronte notre estimation à cette référence. La différence, c'est l'écart de valeur.",
  },
  {
    title: "Un modèle, pas une intuition",
    body: "Le moteur convertit deux espérances de buts en matrice de scores : 1X2, les deux équipes marquent, lignes de buts, handicaps asiatiques et scores exacts.",
  },
  {
    title: "Mise fractionnée, jamais de rattrapage",
    body: `Bankroll de référence : ${BANKROLL_UNITS} unités. Plafond de 2 unités par pari, quart de Kelly pour les marchés secondaires, et aucune augmentation de mise pour se refaire.`,
  },
];

export default function PronosticsPage() {
  const fiches = listPronostics();

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_20%_0%,rgba(255,106,26,0.22),transparent_62%)]" />
        <div className="wax-pattern pointer-events-none absolute inset-0 opacity-10" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-gold-400">
            <BallIcon width={14} height={14} /> Salle des marchés
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,7vw,4.5rem)] uppercase leading-[0.92] text-cream">
            Pronostics
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-dim md:text-base">
            Des fiches d&apos;analyse écrites à la main : on lit la composition, on démonte la cote,
            on modélise les buts — puis on regarde froidement si la valeur est encore là. Aucun pari
            n&apos;est recommandé sans un écart chiffré face au marché.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {fiches[0] && (
              <Link
                href={`/pronostics/${fiches[0].slug}`}
                className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
              >
                Dernière fiche d&apos;analyse
              </Link>
            )}
            <a
              href="#calculateur"
              className="rounded-full border border-white/20 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
            >
              Calculateur de valeur
            </a>
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <SectionHeading
          eyebrow="Méthode"
          title="Comment on travaille"
          description="Quatre étapes, toujours dans le même ordre. Si une étape manque de matière, la fiche ne sort pas."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {METHOD_STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-ink-900/60 p-5">
                <span className="font-mono text-[11px] font-bold text-mango-400">
                  0{index + 1}
                </span>
                <h3 className="mt-2 font-heading text-base font-extrabold text-cream">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-cream-mute">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Fiches"
          title="Analyses publiées"
          description="Une fiche par rencontre. Les cotes cibles sont celles au moment de la rédaction : si le marché est en dessous, on ne prend pas."
        />
        <div className="grid gap-4">
          {fiches.map((fiche) => (
            <PronosticCard key={fiche.slug} fiche={fiche} />
          ))}
        </div>
      </Section>

      <Section className="pb-14 md:pb-20">
        <div id="calculateur" className="scroll-mt-24">
          <SectionHeading
            eyebrow="Outil"
            title="Calculateur de valeur"
            description="Entrez la cote proposée et votre probabilité estimée : le calculateur affiche l'espérance, la cote juste et la mise recommandée."
          />
          <BetCalculator />
        </div>
        <p className="mt-4 max-w-3xl text-[12px] leading-relaxed text-cream-mute">
          Le moteur de calcul est disponible côté serveur dans{" "}
          <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-cream-dim">
            src/lib/betting.ts
          </code>{" "}
          (probabilités implicites, marge, espérance de gain, Kelly, loi de Poisson, handicap
          asiatique) et testé par{" "}
          <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-cream-dim">
            npm run test:betting
          </code>
          .
        </p>
      </Section>

      <Section className="pb-20">
        <div className="rounded-3xl border border-mango-500/20 bg-mango-500/5 p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mango-300">
            Jeu responsable
          </p>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-cream-dim">
            {RESPONSIBLE_GAMBLING}
          </p>
        </div>
      </Section>
    </>
  );
}

function PronosticCard({ fiche }: { fiche: PronosticAnalysis }) {
  const mainPick = fiche.picks.find((pick) => pick.recommended) ?? fiche.picks[0];
  const status = kickoffStatus(fiche.kickoff);
  const edge = expectedValue(mainPick.probability, mainPick.quotedOdds);

  return (
    <Reveal>
      <Link
        href={`/pronostics/${fiche.slug}`}
        className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-ink-900/60 p-5 transition hover:-translate-y-0.5 hover:border-mango-500/50 sm:p-6 lg:flex-row lg:items-center"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-cream-dim">
              {status.label}
            </span>
            <span className="font-heading text-[11px] uppercase tracking-[0.16em] text-gold-400">
              {fiche.competition}
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl uppercase leading-none text-cream md:text-3xl">
            {fiche.home} <span className="text-mango-500">vs</span> {fiche.away}
          </h3>
          <p className="mt-2 text-[13px] text-cream-mute">{formatKickoffLong(fiche.kickoff)}</p>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-cream-dim">
            {fiche.headline}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-white/10 bg-ink-950/60 p-4 lg:w-72">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute">
            Sélection principale
          </p>
          <p className="mt-1 font-heading text-sm font-extrabold text-cream">{mainPick.label}</p>
          <div className="mt-3 flex items-center justify-between text-[12px]">
            <span className="text-cream-mute">Cote marché</span>
            <span className="font-mono text-cream">{formatOdds(mainPick.quotedOdds)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px]">
            <span className="text-cream-mute">Cote juste (modèle)</span>
            <span className="font-mono text-cream-dim">
              {formatOdds(fairOdds(mainPick.probability))}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px]">
            <span className="text-cream-mute">Espérance</span>
            <span className="font-mono text-mango-300">
              {edge >= 0 ? "+" : ""}
              {formatPercent(edge)}
            </span>
          </div>
          <p className="mt-3 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400 transition group-hover:text-mango-300">
            Lire l&apos;analyse →
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
