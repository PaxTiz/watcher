import { join } from "node:path";
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

export function useLogger(service: string) {
  const config = useRuntimeConfig();

  const logger = pino(
    config.public.environment === "local" ? _localTransporter() : _fileTransporter(),
  );

  return logger.child({ service });
}
