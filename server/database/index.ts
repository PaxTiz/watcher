import type { Database } from "./schema";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

let _db: Kysely<Database>;

export const useDatabase = () => {
  if (!_db) {
    const config = useRuntimeConfig();

    _db = new Kysely<Database>({
      log: ["error", "query"],
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
