import { H3Event } from "h3";

// https://github.com/honojs/hono/blob/fe689eceb7834db653a64ecae5f8d203d9c23b9a/src/middleware/logger/index.ts

const humanize = (times: string[]) => {
  const [delimiter, separator] = [",", "."];

  const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));

  return orderTimes.join(separator);
};

const time = (start: Date) => {
  const delta = Date.now() - start.getTime();
  return humanize([delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s"]);
};

const canLog = (event: H3Event) => {
  if (event.path.startsWith("/__nuxt_island")) {
    return false;
  }
  if (event.path.startsWith("/api/_nuxt_icon")) {
    return false;
  }
  if (event.path.startsWith("/uploads")) {
    return false;
  }
  if (!event.path.startsWith("/api")) {
    return false;
  }

  return true;
};

export default defineNitroPlugin((app) => {
  app.hooks.hook("request", (event) => {
    event.context.__time = new Date();
  });

  app.hooks.hook("afterResponse", (event) => {
    const startDate = event.context.__time as Date;

    if (canLog(event)) {
      console.log(
        `${startDate.toISOString()} ${event.method} ${event.path} ${getResponseStatus(event)} ${time(startDate)}`,
      );
    }
  });
});
