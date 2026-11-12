export interface CommandItem<T = unknown> {
  id: string | number;
  label: string;
  keywords?: string[];
  group?: string;
  disabled?: boolean;
  data: T;
}
