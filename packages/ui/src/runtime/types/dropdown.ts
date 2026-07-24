export type DropdownItem<K extends string = string, T extends string = string> = {
  key: K;
  label: string;
  type?: "item" | "label" | "divider";
  value?: T;
  icon?: string;
  disabled?: boolean;
  allowSearch?: boolean;
  on_select?: () => Promise<unknown>;
  children?: Array<{
    label: string;
    value: T;
    disabled?: boolean;
    icon?: string;
  }>;
};
