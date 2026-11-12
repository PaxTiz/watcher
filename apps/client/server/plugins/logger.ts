import { randomUUID } from "node:crypto";

import { getRequestURL, getResponseStatus, type H3Event } from "h3";
import { defineNitroPlugin } from "nitropack/runtime";

import { useLogger } from "#framework";

declare module "nuxt/schema" {
  interface RequestEventContext {
    request_id?: string;
    request_started_at?: number;
  }
}

const IGNORED_PREFIXES = ["/_nuxt/", "/__nuxt", "/api/_nuxt_icon", "/uploads/", "/images/"];

const is_ignored = (path: string) =>
  IGNORED_PREFIXES.some((prefix) => path.startsWith(prefix)) || path === "/favicon.ico";

const level_of = (path: string, status: number) => {
  if (status >= 500) {
    return "error";
  }

  if (status >= 400 && status !== 404) {
    return "warn";
  }

  return path.startsWith("/api/") ? "info" : "debug";
};

const duration_of = (event: H3Event) =>
  event.context.request_started_at ? Date.now() - event.context.request_started_at : undefined;

export default defineNitroPlugin((app) => {
  const logger = useLogger("http");

  app.hooks.hook("request", (event) => {
    event.context.request_id = randomUUID();
    event.context.request_started_at = Date.now();

    event.node.res.setHeader("X-Request-Id", event.context.request_id);
  });

  app.hooks.hook("afterResponse", (event) => {
    const path = getRequestURL(event).pathname;
    if (is_ignored(path)) {
      return;
    }

    const status = getResponseStatus(event);

    logger[level_of(path, status)](
      {
        request_id: event.context.request_id,
        user_id: event.context.user?.id,
        method: event.method,
        path,
        status,
        duration_ms: duration_of(event),
      },
      `${event.method} ${path} ${status}`,
    );
  });

  app.hooks.hook("error", (error, { event }) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500;

    const level = status >= 500 ? "error" : "debug";

    logger[level](
      {
        err: error,
        request_id: event?.context.request_id,
        user_id: event?.context.user?.id,
        method: event?.method,
        path: event ? getRequestURL(event).pathname : undefined,
        status,
      },
      status >= 500 ? "Unhandled error" : "Request failed",
    );
  });
});
