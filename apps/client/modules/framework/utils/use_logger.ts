import { join } from "node:path";

import { useRuntimeConfig } from "nuxt/server";
import pino from "pino";

const _localTransporter = () =>
  pino.transport({
    target: "pino-pretty",
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

let _logger: pino.Logger;
export function useLogger(service: string) {
  const config = useRuntimeConfig();

  _logger ??= pino(
    config.public.environment === "local" ? _localTransporter() : _fileTransporter(),
  );

  return _logger.child(
    { service },
    {
      redact: [
        "*.access_token",
        "*.refresh_token",
        "*.id_token",
        "*.client_secret",
        "*.data.access_token",
        "*.data.refresh_token",
        "*.data.id_token",
        "headers.authorization",
        "headers.cookie",
      ],
    },
  );
}
