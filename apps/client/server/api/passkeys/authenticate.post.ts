import { createError, defineEventHandler } from "nuxt/server";

import { useLogger, withHttpErrors } from "#framework";
import { defineWebAuthnAuthenticateEventHandler } from "#framework/auth";
import { services } from "#framework/server";
import { get_client_ip, useRateLimiter } from "#server/lib/rate_limiter";
import { get_user, require_session_id, start_user_session } from "#server/utils/session";
import { require_user_verification, require_webauthn_rp_id } from "#server/utils/webauthn";

const authenticate_handler = defineWebAuthnAuthenticateEventHandler({
  async storeChallenge(_event, challenge, attempt_id) {
    await services.passkeys.store_challenge(attempt_id, challenge);
  },

  async getChallenge(_event, attempt_id) {
    return withHttpErrors(() => services.passkeys.consume_challenge(attempt_id));
  },

  getOptions(event) {
    return { rpID: require_webauthn_rp_id(event), userVerification: "required" };
  },

  async getCredential(_event, credential_id) {
    const credential = await services.passkeys.find_by_id(credential_id);
    if (!credential) {
      useLogger("passkeys.authenticate").warn({ passkey_id: credential_id }, "Unknown passkey");
      throw createError({ status: 401, message: "unknown_passkey" });
    }

    return credential;
  },

  async onSuccess(event, { credential, authenticationInfo }) {
    require_user_verification(authenticationInfo.userVerified);

    await services.passkeys.mark_as_used(credential.id, authenticationInfo.newCounter);

    const session_user = get_user(event);
    if (session_user) {
      if (credential.userId !== session_user.id) {
        useLogger("passkeys.authenticate").warn(
          { passkey_id: credential.id, passkey_user_id: credential.userId },
          "Reauthentication refused: the passkey belongs to another user",
        );
        throw createError({ status: 403, message: "wrong_account" });
      }

      await services.sessions.mark_authenticated(require_session_id(event));
      return;
    }

    const database_user = await services.users.find_by_id(credential.userId);
    if (!database_user) {
      useLogger("passkeys.authenticate").warn(
        { passkey_id: credential.id, passkey_user_id: credential.userId },
        "Passkey of a deleted user",
      );
      throw createError({ status: 401, message: "unknown_passkey" });
    }

    await start_user_session(event, database_user, {
      integration: "passkey",
      id: credential.id,
    });

    useLogger("passkeys.authenticate").info(
      { passkey_id: credential.id, target_user_id: database_user.id },
      "Logged in with a passkey",
    );
  },
});

export default defineEventHandler(async (event) => {
  const ip = get_client_ip(event);
  if (ip) {
    await useRateLimiter("passkeys_authenticate").consume(event, ip);
  }

  return authenticate_handler(event);
});
