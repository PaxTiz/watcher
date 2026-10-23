import { toast } from "vue-sonner";

export const useSynchronization = () => {
  const is_synchronising = useState("synchronization.running", () => false);
  const { forceRefresh: refresh_subscriptions } = useSubscriptions();
  const { t } = useNuxtApp().$i18n;

  const synchronise = async () => {
    if (is_synchronising.value) {
      return;
    }

    is_synchronising.value = true;
    const toast_id = toast.loading(t("sync.running"));

    const { error } = await callApi("/api/subscriptions/sync", { method: "POST" });
    if (error) {
      toast.error(t("sync.failed"), { id: toast_id });
    } else {
      await refresh_subscriptions();
      toast.success(t("sync.done"), { id: toast_id });
    }

    is_synchronising.value = false;
  };

  return { is_synchronising, synchronise };
};
