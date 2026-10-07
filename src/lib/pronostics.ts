/**
 * Fiches pronostics — données éditoriales.
 *
 * Chaque fiche est un objet typé consommé par /pronostics et /pronostics/[slug].
 * Aucune dépendance base de données : le contenu est versionné avec le code.
 */

export type PronosticPick = {
  id: string;
  label: string;
  market: string;
  /** Cote minimale à laquelle le pari garde de la valeur. */
  targetOdds: number;
  /** Cote constatée sur le marché au moment de l'analyse. */
  quotedOdds: number;
  /** Estimation maison (probabilité en décimal). */
  probability: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  stakeUnits: number;
  rationale: string;
  /** false → ligne listée en « à éviter ». */
  recommended: boolean;
};

export type LineupGroup = { line: string; players: string[] };

export type TeamLineup = {
  team: string;
  coach: string;
  note: string;
  groups: LineupGroup[];
  bench?: string[];
};

export type TeamForm = {
  team: string;
  sample: string;
  record: string;
  goalsForPerMatch: number;
  goalsAgainstPerMatch: number;
  winRate: number;
  handicapWinRate: number;
  cornersPerMatch: number;
  overCornersRate: number;
  comment: string;
};

export type H2HRow = {
  date: string;
  fixture: string;
  competition: string;
  score: string;
  goalsLine: string;
  winner: "home" | "away" | "draw";
};

export type OddsPoint = { time: string; home: number; draw: number; away: number };

export type Scenario = { label: string; probability: number; note: string };

export type PronosticAnalysis = {
  slug: string;
  home: string;
  away: string;
  competition: string;
  round: string;
  kickoff: string; // ISO 8601 UTC
  venue: string;
  broadcaster: string;
  analysedAt: string;
  modelXG: { home: number; away: number };
  headline: string;
  verdict: string;
  contextParagraphs: string[];
  keyInfo: { label: string; value: string }[];
  picks: PronosticPick[];
  avoid: string[];
  lineups: { home: TeamLineup; away: TeamLineup };
  forms: TeamForm[];
  h2h: H2HRow[];
  h2hNote: string;
  oddsMovement: OddsPoint[];
  oddsNote: string;
  openingLine: { handicap: string; total: string };
  closingLine: { handicap: string; total: string };
  scenarios: Scenario[];
  risks: string[];
  sources: { label: string; url: string }[];
};

const ZAMALEK_ZED: PronosticAnalysis = {
  slug: "2026-10-07-zamalek-zed-fc",
  home: "El Zamalek",
  away: "ZED FC",
  competition: "Coupe de la Ligue / Coupe de la Capitale — Égypte",
  round: "Groupe A · 1ʳᵉ journée",
  kickoff: "2026-10-07T17:00:00Z",
  venue: "Stade Osman Ahmed Osman (Al-Mokawloon Al-Arab), Le Caire",
  broadcaster: "ON Sport",
  analysedAt: "2026-10-07T16:35:00Z",
  modelXG: { home: 0.65, away: 1.6 },
  headline: "ZED FC favori, mais la valeur est dans le « les deux ne marquent pas »",
  verdict:
    "Le marché a intégré l'information de composition en quelques heures : Zamalek aligne une équipe réserve et des U19 avant le derby contre Al Ahly, ZED FC sort un onze compétitif. La victoire de ZED est le scénario central, mais à 1.40 la cote ne paie plus le risque : on va chercher la valeur sur BTTS Non, le sous 2.5 buts et le handicap −1.",
  contextParagraphs: [
    "Deux jours avant la rencontre, Zamalek était encore donné favori à 1.91 avec une ligne d'ouverture à +0.5. En quelques heures, le 6 octobre, la cote du club cairote est passée à 6.50 et celle de ZED de 4.00 à 1.40. Ce n'est pas un mouvement de forme : c'est un repriçage massif déclenché par la sortie de la composition.",
    "Le staff de Zamalek a annoncé un onze composé majoritairement de joueurs nés en 2007-2009, encadrés par cinq éléments du groupe professionnel (dont Mahmoud El-Shenawy dans les buts et Seif Gaafar comme capitaine). L'objectif assumé : préserver les cadres avant le derby de Premier League face à Al Ahly le 11 octobre.",
    "En face, ZED FC abaisse beaucoup moins son niveau : Mohamed Rabia, Abdullah Bakri, Abdel Rahman El-Banoubi, Ahmed Atef et Mostafa Saad « Messi » sont titulaires. C'est l'écart de maturité qui explique l'inversion du rapport de force.",
    "Conséquence méthodologique : toutes les statistiques de forme de Zamalek (11 victoires sur 15 matchs, 1.3 but marqué, 0.5 encaissé) décrivent l'équipe A. Elles ne doivent pas être transférées à ce onze-là.",
  ],
  keyInfo: [
    { label: "Coup d'envoi", value: "7 octobre 2026, 17h00 UTC (20h00 au Caire)" },
    { label: "Lieu", value: "Stade Osman Ahmed Osman, Le Caire" },
    { label: "Compétition", value: "Coupe de la Ligue — Groupe A, J1" },
    { label: "Diffusion", value: "ON Sport" },
    { label: "Absents Zamalek", value: "Mohamed El Sayed (pied), Ahmed Hossam (ligaments)" },
    { label: "Prochain match Zamalek", value: "Al Ahly — derby, 11 octobre" },
    { label: "Prochain match ZED", value: "Barrages CAF, finale retour contre Azam" },
  ],
  picks: [
    {
      id: "btts-no",
      label: "BTTS – Non",
      market: "Les deux équipes marquent : Non",
      targetOdds: 1.75,
      quotedOdds: 1.8,
      probability: 0.62,
      confidence: 4,
      stakeUnits: 2,
      rationale:
        "ZED n'est pas une machine offensive (1.1 but par match, environ 3 buts sur ses 4 dernières sorties à l'extérieur). L'attaque B de Zamalek, menée par Adham Hasib, affronte Rabia et Bakri : le scénario où Zamalek ne marque pas est le plus probable du match. Deux « surbuts » seulement sur les 8 confrontations.",
      recommended: true,
    },
    {
      id: "zed-win",
      label: "ZED FC vainqueur",
      market: "1X2",
      targetOdds: 1.55,
      quotedOdds: 1.69,
      probability: 0.66,
      confidence: 4,
      stakeUnits: 1.5,
      rationale:
        "Favori logique, mais la cote a déjà fondu (1.40 chez la plupart des opérateurs). La valeur n'existe que chez les books les plus généreux, autour de 1.55-1.69. En dessous de 1.45, on passe.",
      recommended: true,
    },
    {
      id: "under-25",
      label: "Moins de 2.5 buts",
      market: "Total de buts",
      targetOdds: 1.9,
      quotedOdds: 2.0,
      probability: 0.61,
      confidence: 3,
      stakeUnits: 1,
      rationale:
        "La ligne est passée de 2.25 à 2.00 alors même que le déséquilibre sportif se creusait : le marché anticipe un match fermé. Jeunes groupés derrière, ZED peu prolifique, première journée de coupe.",
      recommended: true,
    },
    {
      id: "zed-ah-minus-1",
      label: "ZED FC –1 (handicap asiatique)",
      market: "Handicap asiatique",
      targetOdds: 2.1,
      quotedOdds: 2.15,
      probability: 0.42,
      confidence: 3,
      stakeUnits: 0.75,
      rationale:
        "Alternative qui paie mieux que le 1X2. Accepte le remboursement sur une victoire 1-0, très fréquente dans ce profil de match (score le plus probable du modèle).",
      recommended: true,
    },
    {
      id: "combo",
      label: "ZED vainqueur + moins de 3.5 buts",
      market: "Combiné sécurisé",
      targetOdds: 1.85,
      quotedOdds: 1.95,
      probability: 0.55,
      confidence: 3,
      stakeUnits: 0.5,
      rationale:
        "Sécurise contre le scénario 3-1 / 2-1 que le handicap −1 encaisse de plein fouet, tout en gardant un gain correct.",
      recommended: true,
    },
  ],
  avoid: [
    "Zamalek vainqueur : la cote ne compense plus le risque d'une équipe U19.",
    "Zamalek +0.5 : aucune marge, la ligne d'ouverture a disparu.",
    "Tout pari « Zamalek marque » (BTTS Oui, plus de 1.5 buts pour Zamalek).",
    "Les marchés de corners (ligne 8.5) : trop instables avec un onze remanié sur le terrain.",
    "Se fier aux modèles automatiques qui affichent encore Zamalek favori : ils n'intègrent pas la composition.",
  ],
  lineups: {
    home: {
      team: "El Zamalek",
      coach: "Ibrahim Salah (intérim) — équipe réserve",
      note: "Rotation massive : seulement 5 éléments du groupe pro, le reste né en 2007-2009.",
      groups: [
        { line: "Gardien", players: ["Mahmoud El-Shenawy"] },
        {
          line: "Défense",
          players: ["Ezzat Mohamed", "Ahmed Hossam", "Khaled El-Sayed", "Mohamed Farag"],
        },
        {
          line: "Milieu",
          players: [
            "El-Sayed Osama",
            "Ziad Medhat",
            "Ahmed Safwat",
            "Hussam Ashour El-Taqi",
            "Seif Gaafar (capitaine)",
          ],
        },
        { line: "Attaque", players: ["Adham Hasib"] },
      ],
      bench: [
        "Omar Abdel Aziz",
        "Mahmoud Gehad",
        "Mohamed Osama",
        "Moaz Mohamed",
        "Omar Yousry",
        "Mohamed Abdel Wanees",
        "Yassin Moussa",
        "Ahmed Ibrahim",
        "Ahmed Hassan",
      ],
    },
    away: {
      team: "ZED FC",
      coach: "Mohamed Shawky",
      note: "Noyau de titulaires habituels aligné, turnover limité avant la finale CAF.",
      groups: [
        { line: "Gardien", players: ["Mohamed Sayed « Mazika »"] },
        {
          line: "Défense",
          players: ["Mohamed Rabia", "Abdullah Bakri", "Moussa Mohamed", "Sameh Ibrahim"],
        },
        { line: "Milieu", players: ["Hamdy Alaa", "Mahmoud Oka", "Abdel Rahman El-Banoubi"] },
        { line: "Attaque", players: ["Mostafa Saad « Messi »", "Ahmed Atef", "Marwan Hegazy"] },
      ],
      bench: [
        "Ali Lotfi",
        "Tarek Alaa",
        "Marwan Haggy",
        "Mohamed Hussein",
        "Mohamed Ibrahim",
        "Mahmoud Nabil",
        "Mohamed Ezz",
        "Ahmed Adel Messi",
        "Raafat Khalil",
      ],
    },
  },
  forms: [
    {
      team: "El Zamalek",
      sample: "15 derniers matchs (équipe A)",
      record: "11 V · 2 N · 2 D",
      goalsForPerMatch: 1.3,
      goalsAgainstPerMatch: 0.5,
      winRate: 0.73,
      handicapWinRate: 0.47,
      cornersPerMatch: 4.5,
      overCornersRate: 0.36,
      comment:
        "Six victoires de rang avant la trêve internationale. Mais ces chiffres concernent l'équipe première, pas le onze aligné ici.",
    },
    {
      team: "ZED FC",
      sample: "15 derniers matchs",
      record: "5 V · 5 N · 5 D",
      goalsForPerMatch: 1.1,
      goalsAgainstPerMatch: 1.1,
      winRate: 0.33,
      handicapWinRate: 0.53,
      cornersPerMatch: 3.7,
      overCornersRate: 0.21,
      comment:
        "Volumes offensifs faibles (1.1 but par match), mais une solidité qui se traduit par 53 % de handicaps gagnés. Peu de corners à l'extérieur.",
    },
  ],
  h2h: [
    {
      date: "24/02/2026",
      fixture: "ZED FC – El Zamalek",
      competition: "Premier League",
      score: "1 : 2",
      goalsLine: "2.0",
      winner: "away",
    },
    {
      date: "11/01/2026",
      fixture: "El Zamalek – ZED FC",
      competition: "Coupe de la Ligue",
      score: "0 : 1",
      goalsLine: "2.0",
      winner: "away",
    },
    {
      date: "27/02/2025",
      fixture: "El Zamalek – ZED FC",
      competition: "Premier League",
      score: "1 : 1",
      goalsLine: "2.0",
      winner: "draw",
    },
    {
      date: "08/08/2024",
      fixture: "ZED FC – El Zamalek",
      competition: "Premier League",
      score: "0 : 1",
      goalsLine: "2.5",
      winner: "away",
    },
    {
      date: "03/11/2023",
      fixture: "El Zamalek – ZED FC",
      competition: "Premier League",
      score: "1 : 2",
      goalsLine: "2.5",
      winner: "away",
    },
  ],
  h2hNote:
    "Duel équilibré sur les 5 dernières oppositions (2 victoires Zamalek, 1 nul, 2 victoires ZED), mais surtout : seulement 2 « surbuts » et 2 « surcorners » sur les 8 confrontations. C'est une affiche historiquement pauvre en buts, avec des lignes de référence autour de 2.0-2.5.",
  oddsMovement: [
    { time: "06/10 06:08", home: 1.909, draw: 2.9, away: 4.0 },
    { time: "06/10 08:07", home: 2.6, draw: 2.75, away: 2.7 },
    { time: "06/10 09:37", home: 6.0, draw: 3.4, away: 1.533 },
    { time: "06/10 11:08", home: 6.5, draw: 3.7, away: 1.444 },
    { time: "06/10 18:06", home: 6.25, draw: 3.9, away: 1.42 },
    { time: "06/10 19:16", home: 5.75, draw: 3.6, away: 1.5 },
    { time: "06/10 20:35", home: 6.5, draw: 4.0, away: 1.38 },
    { time: "07/10 05:15", home: 7.0, draw: 4.2, away: 1.363 },
    { time: "07/10 08:19", home: 7.5, draw: 4.333, away: 1.333 },
    { time: "07/10 14:15", home: 6.25, draw: 4.0, away: 1.42 },
    { time: "07/10 14:39", home: 6.5, draw: 4.0, away: 1.4 },
  ],
  oddsNote:
    "Le mouvement décisif se produit entre 08h07 et 09h37 le 6 octobre : Zamalek passe de 2.60 à 6.00 et ZED de 2.70 à 1.53. C'est la signature d'un repriçage sur information de composition, pas d'un ajustement de forme. Le total de buts, lui, a été baissé de 2.25 à 2.00.",
  openingLine: { handicap: "Zamalek +0.5 / ZED –0.5", total: "2.25" },
  closingLine: { handicap: "ZED –1.25 (marché) / analyse : ZED –1", total: "2.00" },
  scenarios: [
    {
      label: "ZED gagne sans encaisser (0-1, 0-2)",
      probability: 0.4,
      note: "Scénario central, cohérent avec le modèle et l'historique de la confrontation.",
    },
    {
      label: "ZED gagne en encaissant (1-2, 1-3)",
      probability: 0.26,
      note: "Favorable au handicap −1, défavorable au BTTS Non.",
    },
    {
      label: "Match nul (0-0, 1-1)",
      probability: 0.21,
      note: "Un 0-0 récompenserait le bloc bas des jeunes Zamalek ; casse le pari sec.",
    },
    {
      label: "Exploit de Zamalek",
      probability: 0.13,
      note: "Rotation mal exploitée en face + coup de pied arrêté : le principal risque du dossier.",
    },
  ],
  risks: [
    "ZED peut aussi faire tourner : le club joue une finale de barrages de Coupe de la Confédération CAF contre Azam. Si Mohamed Shawky met ses cadres au repos, l'écart se resserre nettement.",
    "Psychologie de première journée de coupe : stade peu rempli, jeunes joueurs en vitrine, rythme faible → match plus fermé et plus accroché que ne le dit la cote.",
    "Le banc de Zamalek contient des seniors (Mahmoud Gehad, Abdel Wanees, Yassin Moussa) : une entrée à l'heure de jeu peut changer le scénario et pénaliser les gros handicaps.",
    "Fourchette de cotes anormalement large sur ZED (1.34 à 1.69 selon les opérateurs) : marché encore instable, les prix bougent jusqu'au coup d'envoi.",
    "Aucune de ces lectures ne garantit un résultat : c'est une opinion argumentée sur des probabilités, pas une prédiction certaine.",
  ],
  sources: [
    { label: "Compositions officielles (Kora Plus)", url: "https://koraplus.com/" },
    { label: "Yallakora — Coupe de la Ligue", url: "https://www.yallakora.com/egyptian-league-cup/3055/" },
    { label: "Masrawy — compositions probables", url: "https://www.masrawy.com/sports" },
    { label: "365Scores — statistiques et forme", url: "https://www.365scores.com/ar" },
    { label: "Relevé de cotes Scoremer", url: "https://www.scoremer.com/fr/match_odds/1654327" },
  ],
};

export const PRONOSTICS: PronosticAnalysis[] = [ZAMALEK_ZED];

export function listPronostics(): PronosticAnalysis[] {
  return [...PRONOSTICS].sort((a, b) => b.kickoff.localeCompare(a.kickoff));
}

export function getPronostic(slug: string): PronosticAnalysis | undefined {
  return PRONOSTICS.find((pronostic) => pronostic.slug === slug);
}

/** Une fiche est considérée archivée si le coup d'envoi est passé. */
export function isArchived(pronostic: PronosticAnalysis, now = new Date()): boolean {
  return new Date(pronostic.kickoff).getTime() < now.getTime();
}

export const BANKROLL_UNITS = 10;

export const RESPONSIBLE_GAMBLING =
  "Analyse et opinion, pas une garantie de résultat. Ne misez que de l'argent dont vous n'avez pas besoin, avec une mise unitaire faible et constante. Paris interdits aux mineurs (18+). Si le jeu devient un problème, faites-vous aider.";
