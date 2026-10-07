/**
 * Tests du moteur de calcul (src/lib/betting.ts).
 * Lancement : npm run test:betting   (Node ≥ 22, aucune dépendance)
 */
import assert from "node:assert/strict";
import test from "node:test";

const {
  impliedProbability,
  fairOdds,
  overround,
  noVigProbabilities,
  expectedValue,
  valueEdge,
  kellyFraction,
  fractionalKelly,
  stakeFromBankroll,
  poissonPmf,
  scoreMatrix,
  matchProbabilities,
  asianHandicap,
  breakEvenOdds,
  formatPercent,
  formatOdds,
} = await import("../src/lib/betting.ts");

const close = (actual, expected, epsilon = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `attendu ≈ ${expected}, obtenu ${actual}`,
  );

test("probabilité implicite et cote juste", () => {
  close(impliedProbability(2), 0.5);
  close(impliedProbability(1.4), 1 / 1.4);
  assert.equal(impliedProbability(1), 0);
  assert.equal(impliedProbability(0.5), 0);
  assert.equal(impliedProbability(NaN), 0);

  close(fairOdds(0.5), 2);
  assert.equal(fairOdds(0), Infinity);
  assert.equal(fairOdds(1), 1);
});

test("marge bookmaker (overround)", () => {
  // 1.40 / 4.00 / 6.50 → marge ≈ 11.8 %
  close(overround([1.4, 4, 6.5]), 0.11813186813186814, 1e-9);
  // Un marché parfaitement équilibré n'a pas de marge.
  close(overround([2, 4, 4]), 0, 1e-12);
});

test("probabilités sans marge normalisées à 1", () => {
  const [home, draw, away] = noVigProbabilities([6.5, 4, 1.4]);
  close(home + draw + away, 1, 1e-12);
  // ZED (cote 1.40) doit dominer largement.
  assert.ok(away > 0.6 && away < 0.68, `ZED attendu ≈ 0.64, obtenu ${away}`);
  assert.ok(home < 0.16, `Zamalek attendu ≈ 0.14, obtenu ${home}`);
});

test("espérance de gain et écart de valeur", () => {
  close(expectedValue(0.62, 1.8), 0.116, 1e-12);
  close(expectedValue(0.5, 1.9), -0.05, 1e-12);
  // Les deux fonctions mesurent le même écart sous deux formes.
  close(valueEdge(0.62, 1.8), 0.62 - 1 / 1.8, 1e-12);
});

test("Kelly : mise fractionnaire cohérente", () => {
  // p = 0.62, cote 1.80 → f* = (0.62 × 1.8 − 1) / 0.8 = 0.145
  close(kellyFraction(0.62, 1.8), 0.145, 1e-12);
  // Pas d'avantage → pas de mise.
  assert.equal(kellyFraction(0.5, 1.8), 0);
  assert.equal(kellyFraction(0.62, 1), 0);
  close(fractionalKelly(0.62, 1.8, 0.25), 0.03625, 1e-12);
  // Une fraction hors bornes est ramenée dans [0, 1].
  close(fractionalKelly(0.62, 1.8, 5), 0.145, 1e-12);
  close(stakeFromBankroll(1000, 0.02), 20, 1e-12);
});

test("cote minimale de rentabilité", () => {
  close(breakEvenOdds(0.62), 1 / 0.62, 1e-12);
  assert.ok(breakEvenOdds(0.62) > 1.6);
  // Avec une marge de sécurité, il faut une cote plus élevée.
  assert.ok(breakEvenOdds(0.62, 0.05) > breakEvenOdds(0.62));
});

test("Poisson : masse totale = 1 et cohérence des moments", () => {
  let total = 0;
  for (let goals = 0; goals <= 40; goals += 1) total += poissonPmf(goals, 1.6);
  close(total, 1, 1e-9);

  let mean = 0;
  for (let goals = 0; goals <= 60; goals += 1) mean += goals * poissonPmf(goals, 1.6);
  close(mean, 1.6, 1e-6);

  assert.equal(poissonPmf(0, 0), 1);
  assert.equal(poissonPmf(3, 0), 0);
  assert.equal(poissonPmf(-1, 1.5), 0);
  assert.equal(poissonPmf(1.5, 1.5), 0);
});

test("matrice des scores : somme ≈ 1 et monotonie", () => {
  const matrix = scoreMatrix(0.65, 1.6, 14);
  const total = matrix.flat().reduce((sum, p) => sum + p, 0);
  close(total, 1, 1e-12);
  // Pénalty de buts attendus : l'extérieur marque plus souvent 1 que 5.
  assert.ok(matrix[0][1] > matrix[0][5]);
});

test("probabilités de match cohérentes", () => {
  const p = matchProbabilities(0.65, 1.6);
  close(p.homeWin + p.draw + p.awayWin, 1, 1e-12);
  close(p.bttsYes + p.bttsNo, 1, 1e-12);
  close(p.over["2.5"] + p.under["2.5"], 1, 1e-12);
  // Modèle : ZED (extérieur) favori sur ce match précis.
  assert.ok(p.awayWin > p.homeWin, "l'extérieur doit être favori");
  assert.ok(p.awayWin > 0.55 && p.awayWin < 0.65, `ZED attendu ≈ 0.6, obtenu ${p.awayWin}`);
  // Les lignes de buts sont bien ordonnées.
  assert.ok(p.over["1.5"] > p.over["2.5"] && p.over["2.5"] > p.over["3.5"]);
  // Les scores les plus probables sont triés par probabilité décroissante.
  const probabilities = p.topScores.map((s) => s.probability);
  assert.deepEqual(probabilities, [...probabilities].sort((a, b) => b - a));
  assert.equal(p.topScores.length, 6);
});

test("handicap asiatique : les issues somment à 1", () => {
  for (const line of [0, -0.5, -1, 1, 0.5, -1.5]) {
    const outcome = asianHandicap(0.65, 1.6, line, "away");
    close(outcome.win + outcome.push + outcome.lose, 1, 1e-12);
  }
});

test("handicap asiatique : lignes entières et demi-lignes", () => {
  // Sur une demi-ligne, jamais de remboursement.
  const half = asianHandicap(0.65, 1.6, -0.5, "away");
  assert.equal(half.push, 0);

  // ZED -1 (entier) : remboursé si ZED gagne par exactement 1 but.
  const whole = asianHandicap(0.65, 1.6, -1, "away");
  assert.ok(whole.push > 0.2, `remboursement attendu > 20 %, obtenu ${whole.push}`);
  // Gagner par 2+ buts est plus rare que gagner tout court.
  const win = asianHandicap(0.65, 1.6, 0, "away");
  assert.ok(whole.win < win.win);
});

test("handicap asiatique : une ligne quart = moyenne des deux demi-lignes", () => {
  const quarter = asianHandicap(0.65, 1.6, -0.25, "home");
  const a = asianHandicap(0.65, 1.6, -0.5, "home");
  const b = asianHandicap(0.65, 1.6, 0, "home");
  close(quarter.win, (a.win + b.win) / 2, 1e-9);
  close(quarter.lose, (a.lose + b.lose) / 2, 1e-9);
  // La ligne quart de l'autre côté est le miroir exact.
  const mirrored = asianHandicap(0.65, 1.6, 0.25, "away");
  close(mirrored.win, quarter.lose, 1e-9);
});

test("handicap asiatique : symétrie domicile / extérieur", () => {
  const home = asianHandicap(1.2, 1.2, -0.5, "home");
  const away = asianHandicap(1.2, 1.2, 0.5, "away");
  close(home.win, away.lose, 1e-9);
  close(home.lose, away.win, 1e-9);
});

test("formatage francophone", () => {
  assert.equal(formatPercent(0.62), "62 %");
  assert.equal(formatPercent(0.6165, 1), "61,7 %");
  assert.equal(formatOdds(1.8), "1,80");
  assert.equal(formatOdds(Infinity), "—");
});

test("scénario de référence — Zamalek / ZED FC", () => {
  // Lecture retenue dans la fiche : rotation massive côté Zamalek.
  const homeXG = 0.65;
  const awayXG = 1.6;
  const p = matchProbabilities(homeXG, awayXG);
  const modelOdds = {
    away: fairOdds(p.awayWin),
    bttsNo: fairOdds(p.bttsNo),
    under25: fairOdds(p.under["2.5"]),
  };

  // Le modèle doit trouver de la valeur sur BTTS Non à 1.80 et sous 2.5 à 2.00,
  // mais pas sur la victoire sèche de ZED à 1.40.
  assert.ok(expectedValue(p.bttsNo, 1.8) > 0.05, "valeur attendue sur BTTS Non");
  assert.ok(expectedValue(p.under["2.5"], 2.0) > 0.05, "valeur attendue sur le sous");
  assert.ok(expectedValue(p.awayWin, 1.4) < 0.15, "pas de valeur énorme sur le 1X2");

  // Kelly ne doit jamais recommander de miser gros sur une seule ligne.
  assert.ok(kellyFraction(p.bttsNo, 1.8) < 0.25);

  // Cohérence des cotes modèles : elles traduisent bien l'ordre des probabilités.
  close(modelOdds.away, 1 / p.awayWin, 1e-9);
  assert.ok(modelOdds.away > 1.6 && modelOdds.away < 1.7, `cote ZED modèle = ${modelOdds.away}`);
  assert.ok(modelOdds.bttsNo < modelOdds.away, "BTTS Non est plus probable que la victoire sèche");
  assert.ok(modelOdds.under25 < modelOdds.away, "le sous 2.5 est plus probable que la victoire sèche");
  // Le modèle maison juge la victoire ZED à 1.40 insuffisamment payée.
  assert.ok(expectedValue(p.awayWin, 1.4) < 0, "pas de valeur sur ZED à 1.40");
});
