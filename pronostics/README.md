# Pronostics — dossier

Deux livrables complémentaires :

| Fichier / route | Rôle |
|---|---|
| `pronostics/2026-10-07-zamalek-vs-zed-fc.md` | Version longue de l'analyse, archive lisible hors site (contexte, marché, modèle, plan de mise). |
| **`/pronostics`** (page du site) | Rubrique publique : méthode, liste des fiches, calculateur de valeur. |
| **`/pronostics/[slug]`** | Fiche complète d'une rencontre, calculée au rendu (modèle de buts, handicaps, cotes justes). |
| **`/api/pronostics`** | Export JSON des fiches et du modèle. |
| `src/lib/betting.ts` | Moteur de calcul réutilisable (cotes, marge, EV, Kelly, Poisson, handicap asiatique). |
| `scripts/test-betting.mjs` | 15 tests du moteur — `npm run test:betting`. |

## Le moteur de calcul

`src/lib/betting.ts` est un module **pur** (aucune dépendance), utilisable côté serveur
(fiches, routes API) et côté client (calculateur). Il expose :

- **Cotes** : `impliedProbability`, `fairOdds`, `overround` (marge du book), `noVigProbabilities` (consensus sans marge).
- **Valeur** : `expectedValue` (EV = p × cote − 1), `valueEdge`, `breakEvenOdds`.
- **Mise** : `kellyFraction`, `fractionalKelly` (demi / quart de Kelly), `stakeFromBankroll`, `flatStake`.
- **Modèle de buts** : `poissonPmf`, `scoreMatrix` (matrice renormalisée), `matchProbabilities` (1X2, BTTS, sur/sous 1.5-3.5, scores exacts).
- **Handicap asiatique** : `asianHandicap` — gère les lignes quart (x.25 / x.75) en décomposant en deux demi-mises, et distingue gagné / remboursé / perdu.

Exemple :

```ts
import { expectedValue, fractionalKelly } from "@/lib/betting";

expectedValue(0.62, 1.8);        // 0.116 → +11,6 % d'espérance
fractionalKelly(0.62, 1.8, 0.25); // 0.036 → 3,6 % du bankroll en quart de Kelly
```

### Lancer les tests

```bash
npm run test:betting   # node --test, aucune dépendance externe (Node ≥ 22)
```

Les tests couvrent la normalisation des probabilités, la marge, l'EV, Kelly, les moments
de la loi de Poisson, la cohérence de la matrice de scores, les lignes entières /
demi-lignes / quart du handicap asiatique, et un scénario de bout en bout sur la fiche
Zamalek – ZED FC.

## L'API

```bash
# Liste des fiches
curl "/api/pronostics"

# Une fiche complète
curl "/api/pronostics?slug=2026-10-07-zamalek-zed-fc"

# Sortie brute du modèle pour deux espérances de buts
curl "/api/pronostics?homeXG=0.65&awayXG=1.6"
```

La réponse du modèle contient : 1X2, BTTS, sur/sous 0.5 → 4.5, les 10 scores exacts les plus
probables, les cotes justes correspondantes et les handicaps asiatiques du camp à domicile.

## Publier une nouvelle fiche

1. **Données** : ajouter un objet `PronosticAnalysis` dans `PRONOSTICS`
   (`src/lib/pronostics.ts`). Les champs sont typés, le compilateur signale les manquants.
2. **Rien d'autre** : `generateStaticParams` génère la route, la liste `/pronostics` se met à jour
   automatiquement et le lien apparaît dans le plan de mise.
3. **Archive** (optionnel) : déposer la version longue en markdown dans ce dossier.

Champs à renseigner en priorité : `picks` (cote cible, cote constatée, probabilité estimée,
confiance 1-5, mise en unités), `modelXG` (les deux espérances de buts du modèle),
`oddsMovement` (relevé horaire : c'est la preuve d'un repriçage), `risks`, `sources`.

## Règles éditoriales

- Une fiche ne sort que si l'information d'équipe est disponible (compositions ou absences confirmées).
- Chaque sélection affiche sa **cote cible** : en dessous, le pari n'a plus d'intérêt et la page l'indique.
- Mise totale plafonnée à 60 % d'une bankroll de 10 unités, aucune martingale.
- Mention « jeu responsable » sur la liste et sur chaque fiche (18+, jamais d'argent nécessaire).

## Notes techniques

- Les pages `/pronostics` sont **statiques avec revalidation toutes les 5 minutes** (`export const revalidate = 300`) :
  le statut « coup d'envoi dans X » et l'état « terminé » se rafraîchissent sans redéploiement.
- Aucune dépendance à la base de données : la rubrique fonctionne même sans PostgreSQL configuré.
- Le thème Tailwind (couleurs `ink` / `cream` / `mango` / `gold` / `baobab`, polices, motif `wax-pattern`,
  grain) est défini dans `src/app/globals.css`, et le layout racine dans `src/app/layout.tsx`.
