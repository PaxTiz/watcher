import { withHttpErrors } from "#framework";
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
    return withHttpErrors(() => services.passkeys.consume_challenge(attempt_id));
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
    const user = get_user(event);

    const { name, passkey_name } = passkeysValidatorsSchema.signup.body.parse({
      name: user?.name ?? body.userName,
      passkey_name: body.passkeyName,
    });

    return { userName: name, displayName: name, passkeyName: passkey_name };
  },

  async excludeCredentials(event) {
    const user = get_user(event);
    if (!user) {
      return [];
    }

    const passkeys = await services.passkeys.list(user.id);

    return passkeys.map((passkey) => ({ id: passkey.id }));
  },

  async onSuccess(event, { user, credential }) {
    const session_user = get_user(event);

    if (session_user) {
      await services.passkeys.create(session_user.id, credential, user.passkeyName);
      return;
    }

    const database_user = await services.users.create({ name: user.userName });

    await services.passkeys.create(database_user.id, credential, user.passkeyName);

    await start_user_session(event, database_user, { integration: "passkey", id: credential.id });
  },
});
