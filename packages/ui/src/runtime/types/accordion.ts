export type AccordionItem = {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content?: string;
  /**
   * Name of a custom slot to use for this item's content, instead of the
   * shared `content` slot. Falls back to `content` (then `item.content`) when unset.
   */
  slot?: string;
};
