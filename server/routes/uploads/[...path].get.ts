import { createIPX, createIPXH3Handler, ipxFSStorage } from "ipx";
import { join } from "node:path";

const ipx = createIPX({
  storage: ipxFSStorage({ dir: join(process.cwd(), ".storage", "uploads") }),
});

const handler = createIPXH3Handler(ipx);

export default defineEventHandler((event) => {
  const path = getRouterParam(event, "path");
  event._path = `/${path}`;
  return handler(event);
});
