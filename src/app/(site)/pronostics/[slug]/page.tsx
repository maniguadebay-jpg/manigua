import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import BetCalculator from "@/components/pronostics/bet-calculator";
import { BallIcon, ChartIcon, AlertIcon, WhistleIcon } from "@/components/pronostics/icons";
import {
  asianHandicap,
  expectedValue,
  fairOdds,
  formatOdds,
  formatPercent,
  impliedProbability,
  matchProbabilities,
  noVigProbabilities,
  overround,
} from "@/lib/betting";
import {
  RESPONSIBLE_GAMBLING,
  listPronostics,
  getPronostic,
  type PronosticAnalysis,
  type PronosticPick,
} from "@/lib/pronostics";
import {
  confidenceLabel,
  confidenceStars,
  formatKickoffShort,
  kickoffStatus,
} from "@/lib/pronostics-view";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fiche = getPronostic(slug);
  if (!fiche) return { title: "Analyse introuvable" };
  return {
    title: `${fiche.home} vs ${fiche.away} — pronostic et analyse`,
    description: `${fiche.competition}. ${fiche.headline}`,
    openGraph: {
      title: `${fiche.home} vs ${fiche.away} — pronostic`,
      description: fiche.verdict.slice(0, 180),
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return listPronostics().map((fiche) => ({ slug: fiche.slug }));
}

export default async function PronosticPage({ params }: Props) {
  const { slug } = await params;
  const fiche = getPronostic(slug);
  if (!fiche) notFound();

  const model = matchProbabilities(fiche.modelXG.home, fiche.modelXG.away, {
    topScores: 6,
    lines: [1.5, 2.5, 3.5],
  });
  const status = kickoffStatus(fiche.kickoff);
  const mainPick = fiche.picks.find((pick) => pick.recommended) ?? fiche.picks[0];

  // Consensus du marché 1X2 au moment de l'analyse (dernier point du relevé).
  const lastOdds = fiche.oddsMovement[fiche.oddsMovement.length - 1];
  const marketOdds = [lastOdds.home, lastOdds.draw, lastOdds.away];
  const market = noVigProbabilities(marketOdds);
  const margin = overround(marketOdds);

  const zedHandicaps = [0, -0.5, -1, -1.5, -2].map((line) => ({
    line,
    ...asianHandicap(fiche.modelXG.home, fiche.modelXG.away, line, "away"),
  }));

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* En-tête                                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_120%_at_18%_0%,rgba(255,197,61,0.16),transparent_60%)]" />
        <Section className="relative py-12 md:py-16">
          <Link
            href="/pronostics"
            className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute transition hover:text-mango-400"
          >
            ← Tous les pronostics
          </Link>

          <p className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400">
            <BallIcon width={14} height={14} />
            {fiche.competition}
            <span className="text-cream-mute">· {fiche.round}</span>
          </p>

          <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,4.5rem)] uppercase leading-[0.92] text-cream">
            {fiche.home} <span className="text-mango-500">vs</span> {fiche.away}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cream-dim md:text-base">
            {fiche.headline}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px] text-cream-mute">
            <span
              className={`rounded-full border px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.16em] ${
                status.actionable
                  ? "border-mango-500/50 bg-mango-500/10 text-mango-300"
                  : "border-white/15 bg-white/5"
              }`}
            >
              {status.label}
            </span>
            <span>{formatKickoffShort(fiche.kickoff)}</span>
            <span className="text-cream-mute/60">·</span>
            <span>{fiche.venue}</span>
            <span className="text-cream-mute/60">·</span>
            <span>{fiche.broadcaster}</span>
          </div>
        </Section>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Verdict + sélection principale                                   */}
      {/* ---------------------------------------------------------------- */}
      <Section className="py-10 md:py-14">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <div className="h-full rounded-3xl border border-white/10 bg-ink-900/60 p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mango-400">
                Verdict
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-cream">{fiche.verdict}</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {fiche.keyInfo.map((info) => (
                  <div
                    key={info.label}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2.5"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream-mute">
                      {info.label}
                    </span>
                    <span className="text-right text-[12px] text-cream-dim">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="h-full rounded-3xl border border-mango-500/30 bg-gradient-to-br from-mango-500/12 to-transparent p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mango-300">
                Sélection principale
              </p>
              <p className="mt-2 font-display text-3xl uppercase leading-none text-cream">
                {mainPick.label}
              </p>
              <p className="mt-2 text-[12px] text-cream-mute">{mainPick.market}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
                <Stat label="Cote cible" value={formatOdds(mainPick.targetOdds)} />
                <Stat label="Cote constatée" value={formatOdds(mainPick.quotedOdds)} />
                <Stat label="Proba maison" value={formatPercent(mainPick.probability)} />
                <Stat label="Cote juste" value={formatOdds(fairOdds(mainPick.probability))} />
                <Stat
                  label="Espérance"
                  value={`${expectedValue(mainPick.probability, mainPick.quotedOdds) >= 0 ? "+" : ""}${formatPercent(
                    expectedValue(mainPick.probability, mainPick.quotedOdds),
                  )}`}
                  tone="positive"
                />
                <Stat label="Confiance" value={confidenceStars(mainPick.confidence)} />
              </dl>
              <p className="mt-4 text-[12px] leading-relaxed text-cream-dim">
                {mainPick.rationale}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Tableau des sélections                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Plan de mise"
          title="Sélections et valeur chiffrée"
          description="La cote juste est celle du modèle maison. L'espérance est calculée sur la cote constatée au moment de l'analyse ; sous la cote cible, le pari n'a plus d'intérêt."
        />
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-ink-900/60">
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-cream-mute">
                <th className="px-4 py-3 font-bold">Pari</th>
                <th className="px-4 py-3 font-bold">Cote cible</th>
                <th className="px-4 py-3 font-bold">Cote marché</th>
                <th className="px-4 py-3 font-bold">Proba maison</th>
                <th className="px-4 py-3 font-bold">Proba marché</th>
                <th className="px-4 py-3 font-bold">Cote juste</th>
                <th className="px-4 py-3 font-bold">Espérance</th>
                <th className="px-4 py-3 font-bold">Confiance</th>
                <th className="px-4 py-3 font-bold">Mise</th>
              </tr>
            </thead>
            <tbody>
              {fiche.picks.map((pick) => (
                <PickRow key={pick.id} pick={pick} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-cream-mute">
          Mise exprimée en unités, sur une bankroll de référence de 10 unités. Le total engagé reste
          volontairement sous 6 unités (60 % de la bankroll) pour absorber une série perdante.
        </p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-ink-900/40 p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-cream-dim">
            <AlertIcon width={14} height={14} /> À éviter sur cette rencontre
          </p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {fiche.avoid.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-cream-mute">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cream-mute/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Contexte + compositions                                          */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Contexte"
          title="Ce qui a fait basculer le match"
          description="La composition est l'information la plus lourde de la rencontre : voici la chronologie et les onze alignés."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {fiche.contextParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-[13px] leading-relaxed text-cream-dim">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <LineupCard title={fiche.lineups.home.team} subtitle={fiche.lineups.home.coach} lineup={fiche.lineups.home} />
            <LineupCard title={fiche.lineups.away.team} subtitle={fiche.lineups.away.coach} lineup={fiche.lineups.away} />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Modèle                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Modèle"
          title="Ce que dit le modèle de buts"
          description={`Deux espérances de buts injectées dans une matrice de Poisson : ${fiche.modelXG.home.toFixed(2)} pour ${fiche.home}, ${fiche.modelXG.away.toFixed(2)} pour ${fiche.away}.`}
        />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
              <ChartIcon width={14} height={14} /> Issues du match
            </p>
            <div className="mt-4 space-y-3">
              <ProbabilityBar
                label={`Victoire ${fiche.home}`}
                model={model.homeWin}
                market={market[0]}
              />
              <ProbabilityBar label="Match nul" model={model.draw} market={market[1]} />
              <ProbabilityBar
                label={`Victoire ${fiche.away}`}
                model={model.awayWin}
                market={market[2]}
              />
              <ProbabilityBar label="Les deux marquent : Oui" model={model.bttsYes} />
              <ProbabilityBar label="Les deux marquent : Non" model={model.bttsNo} />
              {["1.5", "2.5", "3.5"].map((line) => (
                <ProbabilityBar
                  key={line}
                  label={`Plus de ${line} buts`}
                  model={model.over[line]}
                />
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-cream-mute">
              Marge du marché sur le 1X2 analysé : {formatPercent(margin, 1)} (overround). Les
              colonnes « marché » utilisent les probabilités débarrassées de cette marge, seule
              lecture comparable au modèle.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
                Scores exacts les plus probables
              </p>
              <ul className="mt-3 space-y-2">
                {model.topScores.map((score) => (
                  <li
                    key={`${score.home}-${score.away}`}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2"
                  >
                    <span className="font-mono text-sm text-cream">
                      {score.home} – {score.away}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-mango-400 to-mango-600"
                          style={{ width: `${Math.min(score.probability * 400, 100)}%` }}
                        />
                      </span>
                      <span className="w-14 text-right font-mono text-[12px] text-cream-dim">
                        {formatPercent(score.probability, 1)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
                Handicap asiatique — {fiche.away}
              </p>
              <table className="mt-3 w-full text-left text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-cream-mute">
                    <th className="py-1.5 font-bold">Ligne</th>
                    <th className="py-1.5 font-bold">Gagné</th>
                    <th className="py-1.5 font-bold">Remboursé</th>
                    <th className="py-1.5 font-bold">Perdu</th>
                    <th className="py-1.5 font-bold">Cote juste</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {zedHandicaps.map(({ line, win, push, lose }) => (
                    <tr key={line} className="border-t border-white/8">
                      <td className="py-1.5 text-cream">{line > 0 ? `+${line}` : line}</td>
                      <td className="py-1.5 text-cream-dim">{formatPercent(win)}</td>
                      <td className="py-1.5 text-cream-mute">{formatPercent(push)}</td>
                      <td className="py-1.5 text-cream-dim">{formatPercent(lose)}</td>
                      <td className="py-1.5 text-mango-300">
                        {formatOdds(fairOdds(win + push / 2))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[12px] leading-relaxed text-cream-mute">
                La cote juste intègre le remboursement partiel : sur une ligne entière, la mise est
                récupérée si l&apos;écart est exactement celui de la ligne.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Forme & confrontations                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Données"
          title="Forme et confrontations directes"
          description="Les statistiques de forme concernent les équipes premières : à lire avec la composition réelle sous les yeux."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          <div className="grid gap-3">
            {fiche.forms.map((form) => (
              <div
                key={form.team}
                className="rounded-3xl border border-white/10 bg-ink-900/60 p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-base font-extrabold text-cream">{form.team}</h3>
                  <span className="font-mono text-[12px] text-mango-300">{form.record}</span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-cream-mute">
                  {form.sample}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-3">
                  <Stat label="Buts marqués" value={formatOdds(form.goalsForPerMatch)} />
                  <Stat label="Buts encaissés" value={formatOdds(form.goalsAgainstPerMatch)} />
                  <Stat label="Victoires" value={formatPercent(form.winRate)} />
                  <Stat label="Handicap gagné" value={formatPercent(form.handicapWinRate)} />
                  <Stat label="Corners / match" value={formatOdds(form.cornersPerMatch, 1)} />
                  <Stat label="Surcorners" value={formatPercent(form.overCornersRate)} />
                </dl>
                <p className="mt-3 text-[12px] leading-relaxed text-cream-mute">{form.comment}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
              Cinq dernières confrontations
            </p>
            <table className="mt-3 w-full min-w-[420px] text-left text-[12px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-cream-mute">
                  <th className="py-1.5 font-bold">Date</th>
                  <th className="py-1.5 font-bold">Affiche</th>
                  <th className="py-1.5 font-bold">Compétition</th>
                  <th className="py-1.5 font-bold">Score</th>
                  <th className="py-1.5 font-bold">Ligne</th>
                </tr>
              </thead>
              <tbody>
                {fiche.h2h.map((row) => (
                  <tr key={`${row.date}-${row.fixture}`} className="border-t border-white/8">
                    <td className="py-2 font-mono text-cream-mute">{row.date}</td>
                    <td className="py-2 text-cream-dim">{row.fixture}</td>
                    <td className="py-2 text-cream-mute">{row.competition}</td>
                    <td className="py-2 font-mono text-cream">{row.score}</td>
                    <td className="py-2 font-mono text-cream-mute">{row.goalsLine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[12px] leading-relaxed text-cream-mute">{fiche.h2hNote}</p>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Marché                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Marché"
          title="Mouvement des cotes"
          description="Ligne d'ouverture, ligne de clôture et relevé horaire du 1X2. C'est le meilleur détecteur d'information non publique."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
                Lignes de référence
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                <div className="rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">
                    Ouverture — handicap
                  </dt>
                  <dd className="mt-1 font-mono text-cream">{fiche.openingLine.handicap}</dd>
                </div>
                <div className="rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">
                    Ouverture — total
                  </dt>
                  <dd className="mt-1 font-mono text-cream">{fiche.openingLine.total}</dd>
                </div>
                <div className="rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">
                    Clôture — handicap
                  </dt>
                  <dd className="mt-1 font-mono text-cream">{fiche.closingLine.handicap}</dd>
                </div>
                <div className="rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">
                    Clôture — total
                  </dt>
                  <dd className="mt-1 font-mono text-cream">{fiche.closingLine.total}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px] leading-relaxed text-cream-mute">{fiche.oddsNote}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-ink-900/60">
            <table className="w-full min-w-[460px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-cream-mute">
                  <th className="px-4 py-3 font-bold">Horodatage</th>
                  <th className="px-4 py-3 font-bold">{fiche.home}</th>
                  <th className="px-4 py-3 font-bold">Nul</th>
                  <th className="px-4 py-3 font-bold">{fiche.away}</th>
                  <th className="px-4 py-3 font-bold">Marge</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {fiche.oddsMovement.map((point) => (
                  <tr key={point.time} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2 text-cream-mute">{point.time}</td>
                    <td className="px-4 py-2 text-cream-dim">{formatOdds(point.home)}</td>
                    <td className="px-4 py-2 text-cream-dim">{formatOdds(point.draw)}</td>
                    <td className="px-4 py-2 text-mango-300">{formatOdds(point.away)}</td>
                    <td className="px-4 py-2 text-cream-mute">
                      {formatPercent(overround([point.home, point.draw, point.away]), 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Scénarios & risques                                              */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
              <WhistleIcon width={14} height={14} /> Scénarios de match
            </p>
            <ul className="mt-4 space-y-3">
              {fiche.scenarios.map((scenario) => (
                <li key={scenario.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-cream">{scenario.label}</span>
                    <span className="font-mono text-[12px] text-mango-300">
                      {formatPercent(scenario.probability)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-mango-400 to-mango-600"
                      style={{ width: `${scenario.probability * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[12px] text-cream-mute">{scenario.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
              <AlertIcon width={14} height={14} /> Risques et angles morts
            </p>
            <ul className="mt-4 space-y-2.5">
              {fiche.risks.map((risk) => (
                <li key={risk} className="flex gap-2 text-[13px] leading-relaxed text-cream-mute">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mango-500/70" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Calculateur                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-12 md:pb-16">
        <SectionHeading
          eyebrow="Outil"
          title="Vérifiez la cote avant de valider"
          description="Pré-rempli avec la sélection principale de la fiche. Changez la cote ou votre estimation : l'espérance et la mise conseillée se recalculent."
        />
        <BetCalculator
          subject={`${fiche.home} vs ${fiche.away}`}
          defaultOdds={mainPick.quotedOdds}
          defaultProbability={mainPick.probability * 100}
          defaultBankroll={10}
        />
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Sources & jeu responsable                                        */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pb-20">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-ink-900/40 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cream-dim">
              Sources
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {fiche.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-[12px] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] leading-relaxed text-cream-mute">
              Analyse figée le {formatKickoffShort(fiche.analysedAt)} — les cotes évoluent jusqu&apos;au
              coup d&apos;envoi : revalidez toujours la cote affichée avant de miser.
            </p>
          </div>
          <div className="rounded-3xl border border-mango-500/20 bg-mango-500/5 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-mango-300">
              Jeu responsable
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-cream-dim">
              {RESPONSIBLE_GAMBLING}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

/* -------------------------------------------------------------------- */
/* Sous-composants                                                       */
/* -------------------------------------------------------------------- */

function PickRow({ pick }: { pick: PronosticPick }) {
  const ev = expectedValue(pick.probability, pick.quotedOdds);
  const marketProbability = impliedProbability(pick.quotedOdds);
  const belowTarget = pick.quotedOdds < pick.targetOdds;

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-4 py-3">
        <span className="block font-heading text-[13px] font-bold text-cream">{pick.label}</span>
        <span className="text-[11px] text-cream-mute">{pick.market}</span>
      </td>
      <td className="px-4 py-3 font-mono text-cream-dim">{formatOdds(pick.targetOdds)}</td>
      <td
        className={`px-4 py-3 font-mono ${belowTarget ? "text-cream-mute" : "text-cream"}`}
        title={belowTarget ? "Sous la cote cible : plus d'intérêt" : undefined}
      >
        {formatOdds(pick.quotedOdds)}
      </td>
      <td className="px-4 py-3 font-mono text-cream">{formatPercent(pick.probability)}</td>
      <td className="px-4 py-3 font-mono text-cream-mute">{formatPercent(marketProbability)}</td>
      <td className="px-4 py-3 font-mono text-cream-dim">
        {formatOdds(fairOdds(pick.probability))}
      </td>
      <td
        className={`px-4 py-3 font-mono ${ev >= 0 ? "text-mango-300" : "text-cream-mute"}`}
      >
        {ev >= 0 ? "+" : ""}
        {formatPercent(ev)}
      </td>
      <td className="px-4 py-3">
        <span className="block font-mono text-[12px] text-mango-300">
          {confidenceStars(pick.confidence)}
        </span>
        <span className="text-[11px] text-cream-mute">{confidenceLabel(pick.confidence)}</span>
      </td>
      <td className="px-4 py-3 font-mono text-cream">{formatOdds(pick.stakeUnits)} u.</td>
    </tr>
  );
}

function ProbabilityBar({
  label,
  model,
  market,
}: {
  label: string;
  model: number;
  market?: number;
}) {
  const gap = market === undefined ? undefined : model - market;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[12px]">
        <span className="text-cream-dim">{label}</span>
        <span className="font-mono text-cream">
          {formatPercent(model)}
          {market !== undefined && (
            <span className="ml-2 text-cream-mute">marché {formatPercent(market)}</span>
          )}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mango-400 to-mango-600"
          style={{ width: `${Math.min(model * 100, 100)}%` }}
        />
      </div>
      {gap !== undefined && (
        <p className="mt-1 font-mono text-[11px] text-cream-mute">
          écart {gap >= 0 ? "+" : ""}
          {formatPercent(gap)}
        </p>
      )}
    </div>
  );
}

function LineupCard({
  title,
  subtitle,
  lineup,
}: {
  title: string;
  subtitle: string;
  lineup: PronosticAnalysis["lineups"]["home"];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-4">
      <h3 className="font-heading text-sm font-extrabold text-cream">{title}</h3>
      <p className="mt-0.5 text-[11px] text-cream-mute">{subtitle}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-mango-300/90">{lineup.note}</p>
      <dl className="mt-3 space-y-2">
        {lineup.groups.map((group) => (
          <div key={group.line}>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream-mute">
              {group.line}
            </dt>
            <dd className="text-[12px] leading-relaxed text-cream-dim">
              {group.players.join(" · ")}
            </dd>
          </div>
        ))}
      </dl>
      {lineup.bench && (
        <p className="mt-3 border-t border-white/8 pt-2 text-[11px] leading-relaxed text-cream-mute">
          <span className="font-bold uppercase tracking-[0.14em]">Banc :</span>{" "}
          {lineup.bench.join(" · ")}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-cream-mute">{label}</dt>
      <dd className={`mt-0.5 font-mono text-[13px] ${tone === "positive" ? "text-mango-300" : "text-cream"}`}>
        {value}
      </dd>
    </div>
  );
}
