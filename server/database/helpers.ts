import { ColumnDefinitionBuilder, sql } from "kysely";

export const defaultUUIDV7 = (c: ColumnDefinitionBuilder) => {
  return c.defaultTo(sql`UUIDV7()`);
};
