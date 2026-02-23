import { internal } from "~~/server/lib/internal";

export default defineEventHandler(async (event) => {
  return internal.videos.find_all({ page: 1 });
});
