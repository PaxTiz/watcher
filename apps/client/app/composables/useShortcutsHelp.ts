import { ShortcutsHelp } from "#components";

export const useShortcutsHelp = () => {
  const overlay = useWatcherOverlay();

  const open_help = () => {
    overlay.create(ShortcutsHelp).open();
  };

  return { open_help };
};
