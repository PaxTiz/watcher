export type Page<T> = {
  items: Array<T>;
  has_more: boolean;
};

export type Paginated<T> = Page<T> & {
  total: number;
};
