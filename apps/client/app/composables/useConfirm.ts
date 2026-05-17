import { ConfirmationModal } from "#components";

export const useConfirm = ({ title, description }: { title?: string; description?: string }) => {
  return useOverlay().create(ConfirmationModal).open({
    title,
    description,
  }).result;
};
