import { toast } from "vue-sonner";

import { LazyReauthenticationModal } from "#components";

export const useReauthentication = () => {
  const { t } = useNuxtApp().$i18n;

  const confirm_identity = async () => {
    const { data, error } = await callApi("/api/auth/reauthentication");
    if (error) {
      toast.error(t("reauthentication.failed"));
      return false;
    }

    if (!data.required) {
      return true;
    }

    const confirmed = await useWatcherOverlay().create(LazyReauthenticationModal).open({
      hasPasskeys: data.has_passkeys,
    }).result;

    return !!confirmed;
  };

  return { confirm_identity };
};
