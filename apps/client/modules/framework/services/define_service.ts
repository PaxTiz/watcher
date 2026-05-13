export abstract class AbstractService {}

export abstract class AbstractCacheService<
  T extends { key: object; options?: object },
> extends AbstractService {
  abstract key(args: T["key"], options: T["options"]): string;
}
