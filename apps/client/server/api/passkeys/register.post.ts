import { withHttpErrors } from "#framework";
import { services } from "#framework/server";
import { passkeysValidatorsSchema } from "#shared/validators/passkeys";

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

  getOptions(event) {
    return {
      rpID: require_webauthn_rp_id(to_h3_event(event)),
      rpName: "Watcher",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
    };
  },

  async validateUser(body, event) {
    const user = require_user(to_h3_event(event));

    const { name } = passkeysValidatorsSchema.name.body.parse({ name: body.passkeyName });

    return { userName: user.name, displayName: user.name, passkeyName: name };
  },

  async excludeCredentials(event) {
    const user = require_user(to_h3_event(event));

    const passkeys = await services.passkeys.list(user.id);

    return passkeys.map((passkey) => ({ id: passkey.id }));
  },

  async onSuccess(event, { user, credential, registrationInfo }) {
    const session_user = require_user(to_h3_event(event));

    require_user_verification(registrationInfo.userVerified);

    await services.passkeys.create(session_user.id, credential, user.passkeyName);
  },
});
