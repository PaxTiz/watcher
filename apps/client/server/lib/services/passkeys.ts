import { BadRequestError, type PasskeyResource } from "@watcher/common";
import { passkeys } from "@watcher/database";

import type { WebAuthnCredential } from "#auth-utils";
import { AbstractService } from "#framework";

const CHALLENGE_TTL = 60 * 5; // 5 minutes, in seconds

export type PasskeyCredential = WebAuthnCredential & { userId: string };

export default class PasskeysService extends AbstractService {
  async list(user_id: string): Promise<Array<PasskeyResource>> {
    return passkeys.find_all_by_user({ user_id });
  }

  async find_by_id(id: string): Promise<PasskeyCredential | null> {
    const passkey = await passkeys.find_by_id({ id });

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
    return passkeys.count_by_user({ user_id });
  }

  async create(user_id: string, credential: WebAuthnCredential, name: string) {
    await passkeys.create({
      data: {
        id: credential.id,
        user_id,
        name,
        public_key: credential.publicKey,
        counter: credential.counter,
        backed_up: credential.backedUp,
        transports: credential.transports ?? [],
        aaguid: credential.aaguid ?? null,
      },
    });
  }

  async mark_as_used(id: string, counter: number) {
    await passkeys.mark_as_used({ id, counter });
  }

  async rename(user_id: string, id: string, name: string) {
    return passkeys.rename({ id, user_id, name });
  }

  async delete(user_id: string, id: string) {
    return passkeys.remove({ id, user_id });
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
      throw new BadRequestError({ message: "challenge_expired" });
    }

    return item.challenge;
  }
}
