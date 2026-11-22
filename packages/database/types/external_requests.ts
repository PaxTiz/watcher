import type { RepositoryContext } from "../src/database";

export type ExternalRequestsCounts = {
  requests: number;
  failures: number;
  rate_limited: number;
};

export type AddInput = {
  hour: string;
  counts: Array<{ name: string } & ExternalRequestsCounts>;
  options?: RepositoryContext;
};
export type AddOutput = void;

export type TotalsInput = { since: string };
export type TotalsOutput = Array<{ name: string } & ExternalRequestsCounts>;

export type RemoveOlderThanInput = { before: string; options?: RepositoryContext };
export type RemoveOlderThanOutput = number;
