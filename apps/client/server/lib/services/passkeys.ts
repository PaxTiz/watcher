import type { PasskeyResource } from "@watcher/common";

import type { WebAuthnCredential } from "#auth-utils";
import { AbstractService } from "#framework";
import { useDatabase } from "#server/database";

const CHALLENGE_TTL = 60 * 5; // 5 minutes, in seconds

export type PasskeyCredential = WebAuthnCredential & { userId: string };

export default class PasskeysService extends AbstractService {
  async list(user_id: string): Promise<Array<PasskeyResource>> {
    const database = useDatabase();

    const passkeys = await database
      .selectFrom("passkeys")
      .select(["id", "name", "backed_up", "created_at", "last_used_at"])
      .where("user_id", "=", user_id)
      .orderBy("created_at", "desc")
      .execute();

    return passkeys;
  }

  async find_by_id(id: string): Promise<PasskeyCredential | null> {
    const database = useDatabase();

    const passkey = await database
      .selectFrom("passkeys")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!passkey) {
      return null;
    }

    return {
      id: passkey.id,
      publicKey: passkey.public_key,
      counter: passkey.counter,
      backedUp: passkey.backed_up,
      transports: passkey.transports,
      aaguid: passkey.aaguid ?? undefined,
      userId: passkey.user_id,
    };
  }

  async count(user_id: string): Promise<number> {
    const database = useDatabase();

    const { count } = await database
      .selectFrom("passkeys")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("user_id", "=", user_id)
      .executeTakeFirstOrThrow();

    return Number(count);
  }

  async create(user_id: string, credential: WebAuthnCredential, name: string) {
    const database = useDatabase();

    await database
      .insertInto("passkeys")
      .values({
        id: credential.id,
        user_id,
        name,
        public_key: credential.publicKey,
        counter: credential.counter,
        backed_up: credential.backedUp,
        transports: JSON.stringify(credential.transports ?? []),
        aaguid: credential.aaguid ?? null,
      })
      .execute();
  }

  async mark_as_used(id: string, counter: number) {
    const database = useDatabase();

    await database
      .updateTable("passkeys")
      .set({ counter, last_used_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();
  }

  async rename(user_id: string, id: string, name: string) {
    const database = useDatabase();

    const result = await database
      .updateTable("passkeys")
      .set({ name })
      .where("user_id", "=", user_id)
      .where("id", "=", id)
      .executeTakeFirst();

    return result.numUpdatedRows > 0n;
  }

  async delete(user_id: string, id: string) {
    const database = useDatabase();

    const result = await database
      .deleteFrom("passkeys")
      .where("user_id", "=", user_id)
      .where("id", "=", id)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  }

  async store_challenge(attempt_id: string, challenge: string) {
    // The memory driver ignores `ttl`, so the expiration is stored alongside the challenge
    await useStorage().setItem(`webauthn:challenges:${attempt_id}`, {
      challenge,
      expires_at: Date.now() + CHALLENGE_TTL * 1000,
    });
  }

  // Challenges are single-use: consuming one removes it from the storage.
  async consume_challenge(attempt_id: string) {
    const storage = useStorage();
    const key = `webauthn:challenges:${attempt_id}`;

    const item = await storage.getItem<{ challenge: string; expires_at: number }>(key);
    await storage.removeItem(key);

    if (!item || item.expires_at < Date.now()) {
      throw createError({ statusCode: 400, message: "challenge_expired" });
    }

    return item.challenge;
  }
}
