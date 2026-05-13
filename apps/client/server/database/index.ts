import { DeduplicateJoinsPlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./schema";

let _db: Kysely<Database>;

export const useDatabase = () => {
  if (!_db) {
    const config = useRuntimeConfig();

    _db = new Kysely<Database>({
      log: ["error", "query"],
      plugins: [new DeduplicateJoinsPlugin()],
      dialect: new PostgresDialect({
        pool: new Pool({
          database: config.database.name,
          host: config.database.host,
          user: config.database.user,
          password: config.database.pass,
          port: Number(config.database.port),
          keepAlive: true,
          max: 10,
        }),
      }),
    });
  }

  return _db;
};
