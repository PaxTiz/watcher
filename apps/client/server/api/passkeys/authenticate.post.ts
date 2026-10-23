import { services } from "#framework/server";

export default defineWebAuthnAuthenticateEventHandler({
  async storeChallenge(_event, challenge, attempt_id) {
    await services.passkeys.store_challenge(attempt_id, challenge);
  },

  async getChallenge(_event, attempt_id) {
    return services.passkeys.consume_challenge(attempt_id);
  },

  getOptions() {
    return { userVerification: "preferred" };
  },

  async getCredential(_event, credential_id) {
    const credential = await services.passkeys.find_by_id(credential_id);
    if (!credential) {
      throw createError({ statusCode: 401, message: "unknown_passkey" });
    }

    return credential;
  },

  async onSuccess(event, { credential, authenticationInfo }) {
    await services.passkeys.mark_as_used(credential.id, authenticationInfo.newCounter);

    const database_user = await services.users.find_by_id(credential.userId);
    if (!database_user) {
      throw createError({ statusCode: 401, message: "unknown_passkey" });
    }

    await set_user_session(event, database_user, { integration: "passkey", id: credential.id });
  },
});
