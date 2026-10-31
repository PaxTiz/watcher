import type { H3Event } from "h3";
import type { RequestEvent } from "nuxt/server";

export const to_h3_event = (event: RequestEvent) => event as unknown as H3Event;
