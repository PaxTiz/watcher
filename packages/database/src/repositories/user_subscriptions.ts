import type { UpdateObject } from "kysely";

import type { SubscriptionIdentifier } from "../../types/subscriptions";
import type {
  AttachInput,
  AttachOutput,
  HideInput,
  HideOutput,
  ShowInput,
  ShowOutput,
  ToggleFavoriteInput,
  ToggleFavoriteOutput,
} from "../../types/user_subscriptions";
import { type DatabaseInterface, resolveDatabase, useDatabase } from "../database";
import { whereSubscriptionIdentifier } from "../helpers";

export async function attach({
  user_id,
  subscription_id,
  options,
}: AttachInput): Promise<AttachOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("user_subscriptions")
    .values({ user_id, subscription_id })
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function update_user_state(
  user_id: string,
  identifier: SubscriptionIdentifier,
  values: UpdateObject<
    DatabaseInterface,
    "user_subscriptions" | "subscriptions",
    "user_subscriptions"
  >,
): Promise<void> {
  await useDatabase()
    .updateTable("user_subscriptions")
    .from("subscriptions")
    .set(values)
    .whereRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
    .where("user_subscriptions.user_id", "=", user_id)
    .where(whereSubscriptionIdentifier(identifier))
    .execute();
}

export async function toggle_favorite({
  user_id,
  identifier,
}: ToggleFavoriteInput): Promise<ToggleFavoriteOutput> {
  await update_user_state(user_id, identifier, {
    is_favorite: (c) => c.not(c.ref("user_subscriptions.is_favorite")),
  });
}

export async function hide({ user_id, identifier }: HideInput): Promise<HideOutput> {
  await update_user_state(user_id, identifier, { is_favorite: false, is_hidden: true });
}

export async function show({ user_id, identifier }: ShowInput): Promise<ShowOutput> {
  await update_user_state(user_id, identifier, { is_hidden: false });
}
