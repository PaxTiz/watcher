import { DeduplicateJoinsPlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DatabaseInterface } from "./types";

export type Database = Kysely<DatabaseInterface>;

declare const TRANSACTION_HANDLE: unique symbol;

/**
 * Opaque handle for an in-flight transaction. Carries no query-builder methods, so a
 * service can only forward it into repository functions, never query with it directly.
 */
export type TransactionHandle = {
  readonly [TRANSACTION_HANDLE]: true;
};

export type RepositoryContext = {
  tx?: TransactionHandle;
};

let _database: Database | null = null;

// Reads the same `NUXT_DATABASE_*` variables Nuxt would expose through `runtimeConfig`, so the
// package stays usable outside of Nitro (migrations, scripts).
export function useDatabase(): Database {
  if (!_database) {
    _database = new Kysely<DatabaseInterface>({
      log: ["error", "query"],
      plugins: [new DeduplicateJoinsPlugin()],
      dialect: new PostgresDialect({
        pool: new Pool({
          host: process.env.NUXT_DATABASE_HOST,
          port: Number(process.env.NUXT_DATABASE_PORT),
          user: process.env.NUXT_DATABASE_USER,
          password: process.env.NUXT_DATABASE_PASS,
          database: process.env.NUXT_DATABASE_NAME,
          keepAlive: true,
          max: 10,
        }),
      }),
    });
  }

  return _database;
}

// The functions below are not re-exported from index.ts: only repository code (inside this
// package) may convert a handle back into a queryable Database.
export function unwrapTransaction(handle: TransactionHandle): Database {
  return handle as unknown as Database;
}

export function wrapTransaction(tx: Database): TransactionHandle {
  return tx as unknown as TransactionHandle;
}

export function resolveDatabase(options?: RepositoryContext): Database {
  return options?.tx ? unwrapTransaction(options.tx) : useDatabase();
}

/**
 * Joins the caller's transaction when one was passed through `options.tx`, otherwise starts
 * a new one. Lets a repository function that needs several statements to be atomic still be
 * composed into a larger transaction started elsewhere.
 */
export async function withResolvedTransaction<T>(
  options: RepositoryContext | undefined,
  callback: (tx: Database) => Promise<T>,
): Promise<T> {
  if (options?.tx) {
    return callback(unwrapTransaction(options.tx));
  }

  return useDatabase().transaction().execute(callback);
}

export * from "./types";
