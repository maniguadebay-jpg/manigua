/**
 * Helpers d'affichage des fiches pronostics (formatage de dates, statut, confiance).
 * Séparés des données éditoriales pour que celles-ci restent lisibles.
 */

const CAIRO = "Africa/Cairo";
const ABIDJAN = "Africa/Abidjan";

function parts(iso: string, timeZone: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
}

/** Ex. « mercredi 7 octobre 2026, 20:00 (Le Caire) ». */
export function formatKickoffLong(iso: string, timeZone = CAIRO): string {
  return `${parts(iso, timeZone)} (${timeZone === CAIRO ? "Le Caire" : timeZone})`;
}

/** Ex. « 7 octobre 2026, 20:00 Le Caire · 17:00 Abidjan ». */
export function formatKickoffShort(iso: string): string {
  const cairo = new Intl.DateTimeFormat("fr-FR", {
    timeZone: CAIRO,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  const abidjan = new Intl.DateTimeFormat("fr-FR", {
    timeZone: ABIDJAN,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  return `${cairo} (Le Caire) · ${abidjan} GMT (Abidjan)`;
}

export type KickoffStatus = {
  /** Code machine : upcoming | live | finished. */
  code: "upcoming" | "live" | "finished";
  label: string;
  /** true si l'information est encore actionnable. */
  actionable: boolean;
};

/** Statut d'un match à partir du coup d'envoi (durée de match retenue : 2 h). */
export function kickoffStatus(iso: string, now = new Date()): KickoffStatus {
  const start = new Date(iso).getTime();
  const elapsed = now.getTime() - start;
  if (elapsed < 0) {
    const hours = Math.abs(elapsed) / 3_600_000;
    const label =
      hours < 1
        ? `Coup d'envoi dans ${Math.max(1, Math.round(hours * 60))} min`
        : `Coup d'envoi dans ${Math.round(hours)} h`;
    return { code: "upcoming", label, actionable: true };
  }
  if (elapsed < 2 * 3_600_000) return { code: "live", label: "En cours", actionable: false };
  return { code: "finished", label: "Terminé", actionable: false };
}

/** Rang de confiance 1 → 5 sous forme de libellé lisible. */
export function confidenceLabel(confidence: number): string {
  return ["", "Très faible", "Faible", "Moyenne", "Solide", "Très solide"][
    Math.min(Math.max(Math.round(confidence), 0), 5)
  ];
}

/** Rang de confiance en étoiles (ex. « ★★★☆☆ »). */
export function confidenceStars(confidence: number): string {
  const filled = Math.min(Math.max(Math.round(confidence), 0), 5);
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}
