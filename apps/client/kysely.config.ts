import { PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";

export default defineConfig({
  destroyOnExit: true,

  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.NUXT_DATABASE_HOST,
      port: Number(process.env.NUXT_DATABASE_PORT),
      user: process.env.NUXT_DATABASE_USER,
      password: process.env.NUXT_DATABASE_PASS,
      database: process.env.NUXT_DATABASE_NAME,
    }),
  }),

  migrations: {
    migrationFolder: "./server/database/migrations",
  },

  seeds: {
    seedFolder: "./server/database/seeds",
  },
});
