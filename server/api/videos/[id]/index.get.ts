import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, "id");
  const id = Number(param);

  return services.videos.get_by_id(id);
});
