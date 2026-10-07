import { NextResponse } from "next/server";
import { asianHandicap, fairOdds, matchProbabilities } from "@/lib/betting";
import { getPronostic, listPronostics } from "@/lib/pronostics";

export const dynamic = "force-dynamic";

/**
 * API publique des fiches pronostics.
 *
 *  GET /api/pronostics                  → liste des fiches
 *  GET /api/pronostics?slug=…           → une fiche complète
 *  GET /api/pronostics?homeXG=0.65&awayXG=1.6
 *                                       → sortie brute du modèle de buts
 *                                         (1X2, BTTS, lignes, scores, handicaps)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const homeXG = Number.parseFloat(searchParams.get("homeXG") ?? "");
  const awayXG = Number.parseFloat(searchParams.get("awayXG") ?? "");

  if (Number.isFinite(homeXG) && Number.isFinite(awayXG)) {
    if (homeXG < 0 || awayXG < 0 || homeXG > 8 || awayXG > 8) {
      return NextResponse.json(
        { error: "Les espérances de buts doivent être comprises entre 0 et 8." },
        { status: 400 },
      );
    }

    const model = matchProbabilities(homeXG, awayXG, { topScores: 10, lines: [0.5, 1.5, 2.5, 3.5, 4.5] });
    const handicaps = [0, -0.5, -1, -1.5, -2].map((line) => {
      const home = asianHandicap(homeXG, awayXG, line, "home");
      return {
        line,
        home: { ...home, fairOdds: fairOdds(home.win + home.push / 2) },
      };
    });

    return NextResponse.json({
      model: "poisson-independence",
      input: { homeXG, awayXG },
      probabilities: {
        homeWin: model.homeWin,
        draw: model.draw,
        awayWin: model.awayWin,
        bttsYes: model.bttsYes,
        bttsNo: model.bttsNo,
        over: model.over,
        under: model.under,
        topScores: model.topScores,
      },
      fairOdds: {
        homeWin: fairOdds(model.homeWin),
        draw: fairOdds(model.draw),
        awayWin: fairOdds(model.awayWin),
        bttsNo: fairOdds(model.bttsNo),
        under25: fairOdds(model.under["2.5"]),
      },
      handicapsHomeReference: handicaps,
    });
  }

  if (slug) {
    const fiche = getPronostic(slug);
    if (!fiche) {
      return NextResponse.json({ error: `Aucune fiche pour « ${slug} »` }, { status: 404 });
    }
    return NextResponse.json({ pronostic: fiche });
  }

  return NextResponse.json({
    count: listPronostics().length,
    pronostics: listPronostics().map((fiche) => ({
      slug: fiche.slug,
      home: fiche.home,
      away: fiche.away,
      competition: fiche.competition,
      kickoff: fiche.kickoff,
      headline: fiche.headline,
      picks: fiche.picks,
    })),
  });
}
