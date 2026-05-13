type PaginationItem =
  | { type: "page"; page: number }
  | { type: "first" }
  | { type: "previous" }
  | { type: "dots" }
  | { type: "next" }
  | { type: "last" };

export const createPagination = (current: number, last: number, delta = 1) => {
  if (last === 1) return [{ type: "page", page: 1 }];

  const left = current - delta;
  const right = current + delta + 1;
  const range: Array<PaginationItem> = [];

  if (last > 1 && current !== 1) {
    range.push({ type: "first" });
    range.push({ type: "previous" });
  }

  for (let i = 1; i <= last; i++) {
    if (i == 1 || i == last || (i >= left && i < right)) {
      if (i === left && i > 2) {
        range.push({ type: "dots" });
      }

      range.push({ type: "page", page: i });

      if (i === right - 1 && i < last - 1) {
        range.push({ type: "dots" });
      }
    }
  }

  if (last > 1 && current !== last) {
    range.push({ type: "next" });
    range.push({ type: "last" });
  }

  return range;
};
