import { join } from "node:path";

import { useEvent } from "nitropack/runtime";
import { useRuntimeConfig } from "nuxt/server";
import pino from "pino";

const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

const REDACTED_KEYS = [
  "access_token",
  "refresh_token",
  "id_token",
  "client_secret",
  "secretAccessKey",
  "password",
  "signature",
  "challenge",
  "authorization",
  "cookie",
];

const REDACTED_PATHS = REDACTED_KEYS.flatMap((key) => [
  key,
  `*.${key}`,
  `*.*.${key}`,
  `*.*.*.${key}`,
]);

const _localTransporter = () =>
  pino.transport({
    target: "pino-pretty",
    options: { ignore: "pid,hostname" },
  });

const _fileTarget = (level: pino.Level) => ({
  target: "pino-roll",
  level,
  options: {
    file: join(process.cwd(), ".storage", "logs", level),
    extension: ".log",
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    size: "100m",
    limit: { count: 30 },
    mkdir: true,
  },
});

const _fileTransporter = () =>
  pino.transport({
    targets: [_fileTarget("error"), _fileTarget("info"), _fileTarget("debug")],
  });

const _level = (configured: string, environment: string): pino.Level => {
  if ((LOG_LEVELS as ReadonlyArray<string>).includes(configured)) {
    return configured as pino.Level;
  }

  return environment === "local" ? "debug" : "info";
};

const _requestContext = () => {
  try {
    const { context } = useEvent();

    return { request_id: context.request_id, user_id: context.user?.id };
  } catch {
    return {};
  }
};

let _logger: pino.Logger;
const _children = new Map<string, pino.Logger>();

export function useLogger(service: string) {
  if (!_logger) {
    const config = useRuntimeConfig();
    const level = _level(config.logLevel, config.public.environment);

    _logger = pino(
      {
        level,
        redact: { paths: REDACTED_PATHS, censor: "[redacted]" },
        mixin: _requestContext,
      },
      config.public.environment === "local" ? _localTransporter() : _fileTransporter(),
    );
  }

  let child = _children.get(service);
  if (!child) {
    child = _logger.child({ service });
    _children.set(service, child);
  }

  return child;
}
