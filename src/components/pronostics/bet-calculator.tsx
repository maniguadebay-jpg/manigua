"use client";

import { useMemo, useState } from "react";
import {
  expectedValue,
  fairOdds,
  impliedProbability,
  kellyFraction,
  valueEdge,
} from "@/lib/betting";

type Props = {
  defaultOdds?: number;
  defaultProbability?: number;
  defaultBankroll?: number;
  /** Titre du bloc, affiché au-dessus des champs. */
  subject?: string;
};

const KELLY_CHOICES = [
  { value: 1, label: "Kelly pleine (100 %)" },
  { value: 0.5, label: "Demi-Kelly (50 %)" },
  { value: 0.25, label: "Quart de Kelly (25 %)" },
];

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits).replace(".", ",")} %`;
const dec = (value: number, digits = 2) => value.toFixed(digits).replace(".", ",");

export default function BetCalculator({
  defaultOdds = 1.8,
  defaultProbability = 62,
  defaultBankroll = 10,
  subject = "Calcul de valeur",
}: Props) {
  const [odds, setOdds] = useState(defaultOdds);
  const [probabilityPercent, setProbabilityPercent] = useState(defaultProbability);
  const [bankroll, setBankroll] = useState(defaultBankroll);
  const [kellyFactor, setKellyFactor] = useState(0.25);
  const [flatUnits, setFlatUnits] = useState(1);
  const [mode, setMode] = useState<"kelly" | "flat">("kelly");

  const result = useMemo(() => {
    const probability = Math.min(Math.max(probabilityPercent / 100, 0.001), 0.999);
    const ev = expectedValue(probability, odds);
    const kelly = kellyFraction(probability, odds);
    const fraction = kelly * kellyFactor;
    const units = mode === "kelly" ? fraction * bankroll : flatUnits;
    return {
      probability,
      ev,
      kelly,
      fraction,
      units,
      potentialProfit: units * (odds - 1),
      breakEven: fairOdds(probability),
      implied: impliedProbability(odds),
      edge: valueEdge(probability, odds),
      hasValue: ev > 0,
    };
  }, [odds, probabilityPercent, bankroll, kellyFactor, flatUnits, mode]);

  return (
    <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mango-400">
            Calculateur
          </p>
          <h3 className="mt-1 font-display text-2xl uppercase leading-none text-cream">{subject}</h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.16em] ${
            result.hasValue
              ? "border-mango-500/50 bg-mango-500/10 text-mango-300"
              : "border-white/15 bg-white/5 text-cream-mute"
          }`}
        >
          {result.hasValue ? "Valeur détectée" : "Pas de valeur"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim">
            Cote proposée
          </span>
          <input
            type="number"
            min="1.01"
            step="0.01"
            value={odds}
            onChange={(event) => setOdds(Number(event.target.value))}
            className="rounded-xl border border-white/12 bg-ink-950/70 px-3 py-2.5 font-mono text-sm text-cream outline-none transition focus:border-mango-500/70"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim">
            Ma probabilité estimée (%)
          </span>
          <input
            type="number"
            min="0.1"
            max="99.9"
            step="0.5"
            value={probabilityPercent}
            onChange={(event) => setProbabilityPercent(Number(event.target.value))}
            className="rounded-xl border border-white/12 bg-ink-950/70 px-3 py-2.5 font-mono text-sm text-cream outline-none transition focus:border-mango-500/70"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim">
            Bankroll (unités)
          </span>
          <input
            type="number"
            min="0.1"
            step="1"
            value={bankroll}
            onChange={(event) => setBankroll(Number(event.target.value))}
            className="rounded-xl border border-white/12 bg-ink-950/70 px-3 py-2.5 font-mono text-sm text-cream outline-none transition focus:border-mango-500/70"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim">
            Méthode de mise
          </span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as "kelly" | "flat")}
            className="rounded-xl border border-white/12 bg-ink-950/70 px-3 py-2.5 font-mono text-sm text-cream outline-none transition focus:border-mango-500/70"
          >
            <option value="kelly">Kelly fractionnée</option>
            <option value="flat">Mise plate</option>
          </select>
        </label>

        {mode === "kelly" ? (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim">
              Fraction de Kelly appliquée
            </span>
            <select
              value={kellyFactor}
              onChange={(event) => setKellyFactor(Number(event.target.value))}
              className="rounded-xl border border-white/12 bg-ink-950/70 px-3 py-2.5 font-mono text-sm text-cream outline-none transition focus:border-mango-500/70"
            >
              {KELLY_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim">
              Mise plate (unités)
            </span>
            <input
              type="number"
              min="0"
              step="0.25"
              value={flatUnits}
              onChange={(event) => setFlatUnits(Number(event.target.value))}
              className="rounded-xl border border-white/12 bg-ink-950/70 px-3 py-2.5 font-mono text-sm text-cream outline-none transition focus:border-mango-500/70"
            />
          </label>
        )}
      </div>

      <dl
        aria-live="polite"
        className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 md:grid-cols-4"
      >
        <Metric label="Probabilité implicite" value={pct(result.implied)} />
        <Metric label="Cote juste" value={dec(result.breakEven)} />
        <Metric
          label="Espérance (EV)"
          value={`${result.ev >= 0 ? "+" : ""}${pct(result.ev)}`}
          tone={result.hasValue ? "positive" : "negative"}
        />
        <Metric
          label="Écart de valeur"
          value={`${result.edge >= 0 ? "+" : ""}${pct(result.edge)}`}
          tone={result.edge >= 0 ? "positive" : "negative"}
        />
        <Metric label="Kelly pleine" value={pct(result.kelly)} />
        <Metric
          label="Mise conseillée"
          value={`${dec(result.units, 2)} u.`}
          tone={result.units > 0 ? "positive" : "muted"}
        />
        <Metric label="Gain net si gagné" value={`+${dec(result.potentialProfit, 2)} u.`} />
        <Metric
          label="Part du bankroll"
          value={bankroll > 0 ? pct(result.units / bankroll, 2) : "—"}
        />
      </dl>

      <p className="mt-4 text-[12px] leading-relaxed text-cream-mute">
        EV = probabilité × cote − 1. La cote juste est la cote minimale de rentabilité. La mise
        conseillée applique la fraction de Kelly choisie : en dessous de 1 % du bankroll, arrondissez
        simplement à la mise minimale du marché.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "muted";
}) {
  const toneClass =
    tone === "positive"
      ? "text-mango-300"
      : tone === "negative"
        ? "text-cream-dim"
        : tone === "muted"
          ? "text-cream-mute"
          : "text-cream";

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-950/50 px-3 py-2.5">
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream-mute">{label}</dt>
      <dd className={`mt-1 font-mono text-sm font-semibold ${toneClass}`}>{value}</dd>
    </div>
  );
}
