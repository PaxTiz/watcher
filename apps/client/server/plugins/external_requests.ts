import { set_request_recorder } from "@watcher/common";
import { defineNitroPlugin } from "nitropack/runtime";

import { flush_external_requests, record_external_request } from "#server/lib/external_requests";

const FLUSH_INTERVAL = 60_000;

export default defineNitroPlugin((nitro) => {
  set_request_recorder(record_external_request);

  const interval = setInterval(() => void flush_external_requests(), FLUSH_INTERVAL);
  interval.unref();

  nitro.hooks.hook("close", async () => {
    clearInterval(interval);
    await flush_external_requests();
  });
});
