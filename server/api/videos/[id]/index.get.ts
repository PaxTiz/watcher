import { internal } from "#server/lib/internal";

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, "id");
  const id = Number(param);

  return internal.videos.get_by_id(id);
});
