/**
 * Module `db` — bouchon de développement.
 *
 * Aucune base n'est branchée par défaut : toutes les requêtes sont chaînables et
 * se résolvent en tableau vide, ce qui permet de faire tourner l'application
 * (pages, API, healthcheck) sans PostgreSQL.
 *
 * Le bouchon est « thenable » : `await db.select().from(table)` comme
 * `await db.select().from(table).where(...).limit(10)` renvoient un tableau.
 *
 * Pour brancher la vraie base : remplacer ce fichier par une instance Drizzle
 * (`drizzle(pool)`), les signatures utilisées par le reste du code étant
 * identiques.
 */

type Row = Record<string, unknown>;

/** Objet chaînable et awaitable qui se résout en `rows`. */
function makeChain(rows: Row[] = []): any {
  const promise = Promise.resolve(rows);
  const chain: Record<string, unknown> = {
    where: () => makeChain(rows),
    orderBy: () => makeChain(rows),
    groupBy: () => makeChain(rows),
    having: () => makeChain(rows),
    limit: () => makeChain(rows),
    offset: () => makeChain(rows),
    innerJoin: () => makeChain(rows),
    leftJoin: () => makeChain(rows),
    rightJoin: () => makeChain(rows),
    fullJoin: () => makeChain(rows),
    returning: () => makeChain(rows),
    values: () => makeChain(rows),
    set: () => makeChain(rows),
    onConflictDoNothing: () => makeChain(rows),
    onConflictDoUpdate: () => makeChain(rows),
    // Rend l'objet awaitable à n'importe quel niveau de la chaîne.
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  return chain;
}

export const db = {
  select: (_fields?: unknown) => ({ from: (_table: unknown) => makeChain() }),
  insert: (_table: unknown) => makeChain(),
  update: (_table: unknown) => makeChain(),
  delete: (_table: unknown) => makeChain(),
  /** `db.execute(sql\`select 1\`)` — healthcheck et migrations. */
  execute: (_query?: unknown) => makeChain(),
  transaction: async <T,>(callback: (tx: unknown) => Promise<T>): Promise<T> =>
    callback({ select: db.select, insert: db.insert, update: db.update, delete: db.delete }),
} as any;

export default db;
