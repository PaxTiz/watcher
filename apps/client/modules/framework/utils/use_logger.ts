import { join } from "node:path";

import { useRuntimeConfig } from "nuxt/server";
import pino from "pino";

const _localTransporter = () =>
  pino.transport({
    target: "pino-pretty",
  });

const _fileTransporter = () => {
  const now = new Date();
  const directory = join(
    process.cwd(),
    ".storage",
    "logs",
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString(),
    now.getDate().toString(),
  );

  return pino.transport({
    targets: [
      {
        target: "pino/file",
        level: "error",
        options: { destination: join(directory, "error.log"), mkdir: true },
      },
      {
        target: "pino/file",
        level: "info",
        options: { destination: join(directory, "info.log"), mkdir: true },
      },
      {
        target: "pino/file",
        level: "debug",
        options: { destination: join(directory, "debug.log"), mkdir: true },
      },
    ],
  });
};

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
        "*.client_secret",
        "headers.authorization",
        "headers.cookie",
      ],
    },
  );
}
