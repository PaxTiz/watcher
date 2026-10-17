import { toast } from "vue-sonner";

// Manual sync of the subscriptions and their videos, shared by the account menu and the settings
export const useSynchronization = () => {
  const is_synchronising = useState("synchronization.running", () => false);
  const { forceRefresh: refresh_subscriptions } = useSubscriptions();

  const synchronise = async () => {
    if (is_synchronising.value) {
      return;
    }

    is_synchronising.value = true;
    const toast_id = toast.loading("Synchronisation en cours…");

    try {
      await $fetch("/api/subscriptions/sync", { method: "POST" });
      await refresh_subscriptions();
      toast.success("Synchronisation terminée", { id: toast_id });
    } catch {
      toast.error("La synchronisation a échoué, réessayez dans quelques minutes", { id: toast_id });
    } finally {
      is_synchronising.value = false;
    }
  };

  return { is_synchronising, synchronise };
};
