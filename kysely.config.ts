import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { defineConfig } from "kysely-ctl";

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
