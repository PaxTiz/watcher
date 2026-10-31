import { toast } from "vue-sonner";

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

  const synchronise = async () => {
    if (is_synchronising.value) {
      return;
    }

    is_synchronising.value = true;
    const toast_id = toast.loading(t("sync.running"));

    const { error } = await callApi("/api/subscriptions/sync", { method: "POST" });
    if (error) {
      toast.error(error_message(error), { id: toast_id });
    } else {
      await refresh_subscriptions();
      toast.success(t("sync.done"), { id: toast_id });
    }

    is_synchronising.value = false;
  };

  return { is_synchronising, synchronise, error_message };
};
