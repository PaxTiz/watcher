import { toast } from "vue-sonner";

// Translation keys, an empty one means the error is silently ignored
const ERRORS: Record<string, string> = {
  // Thrown by the browser when the user dismisses the passkey prompt
  NotAllowedError: "",
  InvalidStateError: "passkeys.errors.already_registered",
  unknown_passkey: "passkeys.errors.unknown",
  challenge_expired: "passkeys.errors.expired",
  user_verification_required: "passkeys.errors.user_verification_required",
  wrong_account: "passkeys.errors.wrong_account",
};

export const usePasskeys = () => {
  const { register, authenticate, isSupported } = useWebAuthn({
    registerEndpoint: "/api/passkeys/register",
    authenticateEndpoint: "/api/passkeys/authenticate",
  });
  const { fetch: refresh_session } = useUserSession();
  const { t } = useNuxtApp().$i18n;
  const { errors } = useFormatter();

  const error_message = (error: unknown, fallback: string) => {
    const data = (error as { data?: { message?: string; data?: { retry_after?: number } } })?.data;
    const key = data?.message ?? (error as Error)?.name ?? "";

    if (key === "too_many_attempts") {
      return errors.too_many_attempts(data?.data?.retry_after);
    }

    const translation_key = ERRORS[key] ?? fallback;

    return translation_key ? t(translation_key) : "";
  };

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
        toast.error(message);
      }

      return false;
    } finally {
      loading.value = false;
    }
  };

  const login = () => run(() => authenticate(), "passkeys.errors.login");

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
    add,
  };
};
