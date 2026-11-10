import { shortcuts, type ShortcutDefinition, type ShortcutName } from "~/utils/shortcuts";

const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

const useIsMac = () => {
  return useState("shortcuts:is_mac", () => {
    const user_agent = import.meta.server ? useRequestHeader("user-agent") : navigator.userAgent;
    return /Mac|iPhone|iPad/.test(user_agent ?? "");
  });
};

const matches = (event: KeyboardEvent, definition: ShortcutDefinition, is_mac: boolean) => {
  if (event.key.toLowerCase() !== definition.key || event.altKey) {
    return false;
  }

  if (/^[a-z]$/.test(definition.key) && event.shiftKey !== !!definition.shift) {
    return false;
  }

  const mod = is_mac ? event.metaKey : event.ctrlKey;
  const other = is_mac ? event.ctrlKey : event.metaKey;

  return mod === !!definition.mod && !other;
};

export const useShortcut = (name: ShortcutName, handler: (event: KeyboardEvent) => void) => {
  const is_mac = useIsMac();
  const definition: ShortcutDefinition = shortcuts[name];

  useEventListener("keydown", (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || event.isComposing) {
      return;
    }

    if (!matches(event, definition, is_mac.value)) {
      return;
    }

    if (document.querySelector('[aria-modal="true"]')) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!definition.editable && target?.closest(EDITABLE)) {
      return;
    }

    event.preventDefault();
    handler(event);
  });
};

export const useShortcutHints = () => {
  const is_mac = useIsMac();

  const label = (name: ShortcutName) => {
    const definition: ShortcutDefinition = shortcuts[name];
    const parts = [
      definition.mod && (is_mac.value ? "⌘" : "Ctrl"),
      definition.shift && (is_mac.value ? "⇧" : "Shift"),
      definition.key.toUpperCase(),
    ].filter(Boolean);

    return parts.join(is_mac.value ? "" : "+");
  };

  const hint = (text: string, name: ShortcutName) => `${text} (${label(name)})`;

  return { label, hint };
};
