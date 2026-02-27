import { defineRoute } from "#framework";
import { videosValidatorsSchema } from "#shared/validators/videos";

export default defineRoute({
  query: videosValidatorsSchema.segment.query,
  params: videosValidatorsSchema.segment.params,

  async handler(event, { query, params }) {
    const base_url = query.base_url;

    const last_slash = base_url.lastIndexOf("/");
    const base_path = base_url.slice(0, last_slash);
    const real_path = `${base_path}/${params.path}`;

    return fetch(real_path).then((res) => res.blob());
  },
});
