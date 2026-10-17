import { defineRoute } from "#framework";
import { videosValidatorsSchema } from "#shared/validators/videos";

const fetch_upstream = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw createError({ statusCode: 502 });
  }

  return response;
};

export default defineRoute({
  query: videosValidatorsSchema.segment.query,
  params: videosValidatorsSchema.segment.params,

  async handler(event, { query, params }) {
    await requireUserSession(event);

    const base_url = query.base_url;
    if (!verify_proxy_url(params.id, base_url, query.signature)) {
      throw createError({ statusCode: 403 });
    }

    const base_path = base_url.slice(0, base_url.lastIndexOf("/"));

    if (params.path.endsWith(".ts")) {
      const response = await fetch_upstream(`${base_path}/${params.path}`);
      return response.blob();
    }

    const quality = base_path.slice(base_path.lastIndexOf("/") + 1);

    const response = await fetch_upstream(base_url);
    const playlist = await response.text();

    return playlist.replaceAll(/((\d+)\.ts)/g, (path: string) =>
      to_proxy_url(params.id, quality, path, base_url),
    );
  },
});
