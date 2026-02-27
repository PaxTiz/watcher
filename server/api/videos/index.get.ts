import { services } from "#framework/server";

export default defineEventHandler(async (event) => {
  return services.videos.find_all({ page: 1 });
});
