import { toast } from "vue-sonner";

// Translation keys, an empty one means the error is silently ignored
const ERRORS: Record<string, string> = {
  // Thrown by the browser when the user dismisses the passkey prompt
  NotAllowedError: "",
  InvalidStateError: "passkeys.errors.already_registered",
  unknown_passkey: "passkeys.errors.unknown",
  challenge_expired: "passkeys.errors.expired",
};

const error_message = (error: unknown, fallback: string) => {
  const key =
    (error as { data?: { message?: string } })?.data?.message ?? (error as Error)?.name ?? "";

  return ERRORS[key] ?? fallback;
};

export const usePasskeys = () => {
  const { register, authenticate, isSupported } = useWebAuthn({
    registerEndpoint: "/api/passkeys/register",
    authenticateEndpoint: "/api/passkeys/authenticate",
  });
  const { fetch: refresh_session } = useUserSession();
  const { t } = useNuxtApp().$i18n;

  const loading = ref(false);

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    loading.value = true;

    try {
      await action();
      await refresh_session();
      return true;
    } catch (error) {
      const message = error_message(error, fallback);
      if (message) {
        toast.error(t(message));
      }

      return false;
    } finally {
      loading.value = false;
    }
  };

  const login = () => run(() => authenticate(), "passkeys.errors.login");

  const signup = (name: string, passkey_name: string) =>
    run(
      () => register({ userName: name, displayName: name, passkeyName: passkey_name }),
      "passkeys.errors.signup",
    );

  // The server uses the authenticated user's name, the userName is only required by the endpoint
  const add = (user_name: string, passkey_name: string) =>
    run(
      () => register({ userName: user_name, displayName: user_name, passkeyName: passkey_name }),
      "passkeys.errors.add",
    );

  return {
    is_supported: isSupported,
    loading,

    login,
    signup,
    add,
  };
};
