import type { Kysely } from "kysely";

import { defaultUUIDV7 } from "../helpers";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("videos")
    .addColumn("id", "uuid", (c) => defaultUUIDV7(c.primaryKey()))
    .addColumn("service", "varchar", (c) => c.notNull())
    .addColumn("subscription_id", "varchar", (c) => c.notNull())
    .addColumn("title", "varchar", (c) => c.notNull())
    .addColumn("description", "varchar", (c) => c.notNull())
    .addColumn("duration", "integer", (c) => c.notNull())
    .addColumn("url", "varchar", (c) => c.notNull())
    .addColumn("thumbnail", "varchar", (c) => c.notNull())
    .addColumn("created_at", "timestamptz", (c) => c.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("videos").execute();
}
