import { NotFoundError, UnprocessableEntityError } from "@watcher/common";
import { type ColumnDefinitionBuilder, type ExpressionBuilder, sql } from "kysely";

import type { SubscriptionIdentifier } from "../types/subscriptions";
import {
  type DatabaseInterface,
  type TransactionHandle,
  useDatabase,
  wrapTransaction,
} from "./database";

export const defaultUUIDV7 = (c: ColumnDefinitionBuilder) => {
  return c.defaultTo(sql`UUIDV7()`);
};

export async function withTransaction<T>(
  callback: (tx: TransactionHandle) => Promise<T>,
): Promise<T> {
  return useDatabase()
    .transaction()
    .execute((tx) => callback(wrapTransaction(tx)));
}

export function whereSubscriptionIdentifier(identifier: SubscriptionIdentifier) {
  return (eb: ExpressionBuilder<DatabaseInterface, "subscriptions">) =>
    "id" in identifier
      ? eb("subscriptions.id", "=", identifier.id)
      : eb("subscriptions.slug", "=", identifier.slug);
}

export async function findOrFail<T>(
  query: Promise<T>,
  options?: { message?: string },
): Promise<NonNullable<T>> {
  const response: T | undefined = await query;
  if (!response) {
    throw new NotFoundError({ message: options?.message });
  }

  return response;
}

export async function expectNotExists<T>(
  query: Promise<T>,
  options?: { message?: string },
): Promise<void> {
  const response: T | undefined = await query;
  if (response) {
    throw new UnprocessableEntityError({ message: options?.message });
  }
}
