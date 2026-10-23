import { toast } from "vue-sonner";

const ERRORS: Record<string, string> = {
  // Thrown by the browser when the user dismisses the passkey prompt
  NotAllowedError: "",
  InvalidStateError: "Cette clé d'accès est déjà associée à votre compte",
  unknown_passkey: "Cette clé d'accès n'est associée à aucun compte Watcher",
  challenge_expired: "La demande a expiré, veuillez réessayer",
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

  const login = () =>
    run(
      () => authenticate(),
      "Une erreur est survenue lors de la connexion avec votre clé d'accès",
    );

  const signup = (name: string, passkey_name: string) =>
    run(
      () => register({ userName: name, displayName: name, passkeyName: passkey_name }),
      "Une erreur est survenue lors de la création de votre compte",
    );

  // The server uses the authenticated user's name, the userName is only required by the endpoint
  const add = (user_name: string, passkey_name: string) =>
    run(
      () => register({ userName: user_name, displayName: user_name, passkeyName: passkey_name }),
      "Une erreur est survenue lors de l'ajout de votre clé d'accès",
    );

  return {
    is_supported: isSupported,
    loading,

    login,
    signup,
    add,
  };
};
