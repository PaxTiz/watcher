import { externalRequests, type repositoryTypes } from "@watcher/database";

import { useLogger } from "#framework";

type Counts = repositoryTypes.externalRequests.ExternalRequestsCounts;

const HOUR = 60 * 60 * 1000;

let pending = new Map<string, Map<string, Counts>>();

const hour_of = (date: number) => new Date(Math.floor(date / HOUR) * HOUR).toISOString();

const add_counts = (hour: string, name: string, counts: Counts) => {
  let names = pending.get(hour);
  if (!names) {
    names = new Map();
    pending.set(hour, names);
  }

  const current = names.get(name) ?? { requests: 0, failures: 0, rate_limited: 0 };
  current.requests += counts.requests;
  current.failures += counts.failures;
  current.rate_limited += counts.rate_limited;
  names.set(name, current);
};

export const record_external_request = (name: string, status: number | null) => {
  add_counts(hour_of(Date.now()), name, {
    requests: 1,
    failures: status === null || status >= 400 ? 1 : 0,
    rate_limited: status === 429 ? 1 : 0,
  });
};

export const flush_external_requests = async () => {
  const flushed = pending;
  pending = new Map();

  for (const [hour, names] of flushed) {
    try {
      await externalRequests.add({
        hour,
        counts: [...names].map(([name, counts]) => ({ name, ...counts })),
      });
    } catch (error) {
      useLogger("server.lib.external_requests").warn(
        { err: error, hour },
        "Failed to save the external requests stats",
      );

      for (const [name, counts] of names) {
        add_counts(hour, name, counts);
      }
    }
  }
};
