import { type Kysely } from "kysely";

import { defaultUUIDV7 } from "../helpers";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("subscriptions")
    .addColumn("id", "uuid", (c) => defaultUUIDV7(c.primaryKey()))
    .addColumn("service_id", "varchar", (c) => c.notNull())
    .addColumn("service", "varchar", (c) => c.notNull())
    .addColumn("url", "varchar", (c) => c.notNull())
    .addColumn("logo", "varchar", (c) => c.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("subscriptions").execute();
}
