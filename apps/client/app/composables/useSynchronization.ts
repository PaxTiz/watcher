import { toast } from "vue-sonner";

const POLL_INTERVAL = 2000;

export const useSynchronization = () => {
  const is_synchronising = useState("synchronization.running", () => false);
  const { forceRefresh: refresh_subscriptions } = useSubscriptions();
  const { t } = useNuxtApp().$i18n;

  const error_message = (error: ApiError) => {
    if (error.status === 409 && error.message === "sync_in_progress") {
      return t("sync.in_progress");
    }

    return error.display_message ?? t("sync.failed");
  };

  const wait_for_sync = async (signal?: AbortSignal): Promise<string | null> => {
    while (!signal?.aborted) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

      const { data, error } = await callApi("/api/subscriptions/sync", { signal });
      if (error) {
        return error_message(error);
      }

      if (data.status === "failed") {
        return data.error === "integration_invalid" ? t("sync.reconnect") : t("sync.failed");
      }

      if (data.status !== "running") {
        return null;
      }
    }

    return null;
  };

  const synchronise = async () => {
    if (is_synchronising.value) {
      return;
    }

    is_synchronising.value = true;
    const toast_id = toast.loading(t("sync.running"));

    const { error } = await callApi("/api/subscriptions/sync", { method: "POST" });
    const failure = error ? error_message(error) : await wait_for_sync();
    if (failure) {
      toast.error(failure, { id: toast_id });
    } else {
      await refresh_subscriptions();
      toast.success(t("sync.done"), { id: toast_id });
    }

    is_synchronising.value = false;
  };

  return { is_synchronising, synchronise, error_message, wait_for_sync };
};
