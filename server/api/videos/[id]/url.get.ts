import { internal } from "~~/server/lib/internal";

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, "id");
  const id = Number(param);

  const url = await internal.videos.get_url(id);
  if (!url) {
    throw createError({ statusCode: 404 });
  }

  const response = await fetch(url).then((res) => res.text());
  return response
    .replaceAll(/(.*\.mp4)/g, `$1?base_url=${url}`)
    .replaceAll(/(.*\.ts)/g, `$1?base_url=${url}`);
});
