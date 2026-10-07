/**
 * Moteur de calcul cotes / probabilités / valeur.
 *
 * Module pur (aucune dépendance, aucun effet de bord) : utilisable côté serveur
 * (rendu des fiches, routes API) comme côté client (calculateur interactif).
 *
 * Conventions :
 *  - `odds` : cote décimale européenne (1.75 = 1,75 pour 1).
 *  - `probability` : probabilité en décimal (0.62 = 62 %).
 *  - `line`   : ligne de handicap asiatique, exprimée du point de vue du camp
 *               choisi (line = -1 → ce camp doit gagner par 2 buts d'écart pour
 *               être payé pleinement). Les lignes quart (x.25 / x.75) sont
 *               décomposées en deux demi-mises automatiquement.
 */

/* ------------------------------------------------------------------ */
/* 1. Cotes & probabilités                                             */
/* ------------------------------------------------------------------ */

/** Probabilité implicite brute d'une cote décimale. */
export function impliedProbability(odds: number): number {
  if (!Number.isFinite(odds) || odds <= 1) return 0;
  return 1 / odds;
}

/** Cote « juste » (sans marge) correspondant à une probabilité. */
export function fairOdds(probability: number): number {
  if (probability <= 0) return Infinity;
  if (probability >= 1) return 1;
  return 1 / probability;
}

/** Marge du bookmaker (overround) d'un marché : 0.05 = 5 % de marge. */
export function overround(oddsList: number[]): number {
  return oddsList.reduce((sum, odds) => sum + impliedProbability(odds), 0) - 1;
}

/**
 * Probabilités débarrassées de la marge, normalisées à 1.
 * Utile pour retrouver l'estimation « consensus » du marché.
 */
export function noVigProbabilities(oddsList: number[]): number[] {
  const raw = oddsList.map(impliedProbability);
  const total = raw.reduce((sum, p) => sum + p, 0);
  if (total <= 0) return raw.map(() => 0);
  return raw.map((p) => p / total);
}

/* ------------------------------------------------------------------ */
/* 2. Valeur attendue & mise                                           */
/* ------------------------------------------------------------------ */

/**
 * Espérance de gain par unité misée (EV).
 * EV = p × cote − 1. Un EV de 0.116 = +11,6 % d'espérance.
 */
export function expectedValue(probability: number, odds: number): number {
  return probability * odds - 1;
}

/** Écart entre la probabilité estimée et la probabilité implicite du marché. */
export function valueEdge(probability: number, odds: number): number {
  return probability - impliedProbability(odds);
}

/**
 * Fraction de Kelly pleine (0 = pas de mise).
 * f* = (p × cote − 1) / (cote − 1)
 */
export function kellyFraction(probability: number, odds: number): number {
  if (odds <= 1) return 0;
  const edge = probability * odds - 1;
  if (edge <= 0) return 0;
  return edge / (odds - 1);
}

/** Fraction de Kelly réduite (1/2, 1/4…), la pratique recommandée. */
export function fractionalKelly(probability: number, odds: number, fraction = 0.25): number {
  return kellyFraction(probability, odds) * Math.min(Math.max(fraction, 0), 1);
}

/** Mise en unités pour un bankroll donné et une fraction (ex. 0.02 = 2 %). */
export function stakeFromBankroll(bankroll: number, fraction: number): number {
  return bankroll * Math.max(fraction, 0);
}

/** Mise plate : unités fixes, indépendantes de la cote. */
export function flatStake(units: number, unitValue = 1): number {
  return units * unitValue;
}

/* ------------------------------------------------------------------ */
/* 3. Modèle de buts (loi de Poisson)                                  */
/* ------------------------------------------------------------------ */

/** Probabilité d'exactement `goals` buts pour une moyenne `lambda`. */
export function poissonPmf(goals: number, lambda: number): number {
  if (goals < 0 || !Number.isInteger(goals) || lambda < 0) return 0;
  if (lambda === 0) return goals === 0 ? 1 : 0;
  let logP = -lambda + goals * Math.log(lambda);
  for (let i = 2; i <= goals; i += 1) logP -= Math.log(i);
  return Math.exp(logP);
}

/**
 * Matrice des scores exacts [buts domicile][buts extérieur] pour deux
 * espérances de buts (xG). Hypothèse : indépendance des deux attaques.
 */
export function scoreMatrix(homeXG: number, awayXG: number, maxGoals = 12): number[][] {
  const home = Array.from({ length: maxGoals + 1 }, (_, goals) => poissonPmf(goals, homeXG));
  const away = Array.from({ length: maxGoals + 1 }, (_, goals) => poissonPmf(goals, awayXG));
  const matrix = home.map((ph) => away.map((pa) => ph * pa));
  // La troncature à `maxGoals` retire une masse infime mais non nulle :
  // on renormalise pour que la matrice somme exactement à 1.
  const total = matrix.reduce((sum, row) => sum + row.reduce((s, p) => s + p, 0), 0);
  if (total > 0) {
    matrix.forEach((row, i) => {
      row.forEach((p, j) => {
        matrix[i][j] = p / total;
      });
    });
  }
  return matrix;
}

export type ScoreLine = { home: number; away: number; probability: number };

export type MatchProbabilities = {
  homeWin: number;
  draw: number;
  awayWin: number;
  bttsYes: number;
  bttsNo: number;
  over: Record<string, number>;
  under: Record<string, number>;
  /** Écart de buts le plus probable (positif = victoire domicile). */
  topScores: ScoreLine[];
};

/**
 * Toutes les probabilités d'un match dérivées de la matrice de Poisson
 * (1X2, BTTS, sur/sous 1.5 / 2.5 / 3.5, scores exacts les plus probables).
 */
export function matchProbabilities(
  homeXG: number,
  awayXG: number,
  options: { maxGoals?: number; topScores?: number; lines?: number[] } = {},
): MatchProbabilities {
  const maxGoals = options.maxGoals ?? 12;
  const lineList = options.lines ?? [1.5, 2.5, 3.5];
  const topCount = options.topScores ?? 6;
  const matrix = scoreMatrix(homeXG, awayXG, maxGoals);

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let bttsYes = 0;
  const totals = new Map<number, number>();
  const scores: ScoreLine[] = [];

  matrix.forEach((row, home) => {
    row.forEach((probability, away) => {
      if (home > away) homeWin += probability;
      else if (home === away) draw += probability;
      else awayWin += probability;
      if (home > 0 && away > 0) bttsYes += probability;
      totals.set(home + away, (totals.get(home + away) ?? 0) + probability);
      scores.push({ home, away, probability });
    });
  });

  const over: Record<string, number> = {};
  const under: Record<string, number> = {};
  lineList.forEach((line) => {
    let overProbability = 0;
    totals.forEach((probability, goals) => {
      if (goals > line) overProbability += probability;
    });
    over[String(line)] = overProbability;
    under[String(line)] = 1 - overProbability;
  });

  scores.sort((a, b) => b.probability - a.probability);

  return {
    homeWin,
    draw,
    awayWin,
    bttsYes,
    bttsNo: 1 - bttsYes,
    over,
    under,
    topScores: scores.slice(0, topCount),
  };
}

/* ------------------------------------------------------------------ */
/* 4. Handicap asiatique                                               */
/* ------------------------------------------------------------------ */

export type HandicapOutcome = { win: number; push: number; lose: number };

/**
 * Issue d'un handicap asiatique pour un camp donné.
 *
 * @param homeXG  buts attendus de l'équipe à domicile
 * @param awayXG  buts attendus de l'équipe à l'extérieur
 * @param line    ligne appliquée au camp `side` (ex. -1 = « donne 1 but »)
 * @param side    camp sur lequel porte le pari
 */
export function asianHandicap(
  homeXG: number,
  awayXG: number,
  line: number,
  side: "home" | "away" = "home",
  maxGoals = 12,
): HandicapOutcome {
  const fraction = Math.abs(line % 1);
  // Lignes quart (x.25 / x.75) : deux demi-mises sur les deux lignes encadrantes.
  if (Math.abs(fraction - 0.25) < 1e-9 || Math.abs(fraction - 0.75) < 1e-9) {
    const a = asianHandicapSingle(homeXG, awayXG, line - 0.25, side, maxGoals);
    const b = asianHandicapSingle(homeXG, awayXG, line + 0.25, side, maxGoals);
    return { win: (a.win + b.win) / 2, push: (a.push + b.push) / 2, lose: (a.lose + b.lose) / 2 };
  }
  return asianHandicapSingle(homeXG, awayXG, line, side, maxGoals);
}

function asianHandicapSingle(
  homeXG: number,
  awayXG: number,
  line: number,
  side: "home" | "away",
  maxGoals: number,
): HandicapOutcome {
  const matrix = scoreMatrix(homeXG, awayXG, maxGoals);
  let win = 0;
  let push = 0;
  let lose = 0;

  matrix.forEach((row, home) => {
    row.forEach((probability, away) => {
      const margin = (side === "home" ? home - away : away - home) + line;
      if (margin > 0) win += probability;
      else if (margin === 0) push += probability;
      else lose += probability;
    });
  });

  return { win, push, lose };
}

/* ------------------------------------------------------------------ */
/* 5. Formatage (helpers d'affichage)                                  */
/* ------------------------------------------------------------------ */

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits).replace(".", ",")} %`;
}

export function formatOdds(odds: number, digits = 2): string {
  if (!Number.isFinite(odds)) return "—";
  return odds.toFixed(digits).replace(".", ",");
}

export function formatSigned(value: number, digits = 1, suffix = ""): string {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toString().replace(".", ",")}${suffix}`;
}

/** Cote minimale pour qu'un pari conserve un EV positif. */
export function breakEvenOdds(probability: number, marginOfSafety = 0): number {
  const target = Math.min(Math.max(probability - marginOfSafety, 0.0001), 0.9999);
  return 1 / target;
}
