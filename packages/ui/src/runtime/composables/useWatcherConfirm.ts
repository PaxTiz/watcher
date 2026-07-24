import ConfirmationModal from "../components/ConfirmationModal.vue";
import { useWatcherOverlay } from "./useWatcherOverlay";

export const useWatcherConfirm = (options: {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) => {
  return useWatcherOverlay().create(ConfirmationModal).open(options).result;
};
