import { services } from "#framework/server";
import { passkeysValidatorsSchema } from "#shared/validators/passkeys";

// Registers a passkey: attached to the authenticated user, or creates a new account otherwise.
export default defineWebAuthnRegisterEventHandler<{
  userName: string;
  displayName: string;
  passkeyName: string;
}>({
  async storeChallenge(_event, challenge, attempt_id) {
    await services.passkeys.store_challenge(attempt_id, challenge);
  },

  async getChallenge(_event, attempt_id) {
    return services.passkeys.consume_challenge(attempt_id);
  },

  getOptions() {
    return {
      rpName: "Watcher",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
    };
  },

  async validateUser(body, event) {
    const { user } = await getUserSession(event);

    const { name, passkey_name } = passkeysValidatorsSchema.signup.body.parse({
      name: user?.name ?? body.userName,
      passkey_name: body.passkeyName,
    });

    return { userName: name, displayName: name, passkeyName: passkey_name };
  },

  async excludeCredentials(event) {
    const { user } = await getUserSession(event);
    if (!user) {
      return [];
    }

    const passkeys = await services.passkeys.list(user.id);

    return passkeys.map((passkey) => ({ id: passkey.id }));
  },

  async onSuccess(event, { user, credential }) {
    const { user: session_user } = await getUserSession(event);

    const database_user = session_user
      ? await services.users.find_by_id(session_user.id)
      : await services.users.create({ name: user.userName });

    if (!database_user) {
      throw createError({ statusCode: 500, message: "authenticated_user_not_found" });
    }

    await services.passkeys.create(database_user.id, credential, user.passkeyName);

    await set_user_session(
      event,
      database_user,
      session_user?.login_with ?? { integration: "passkey", id: credential.id },
    );
  },
});
