import { defineRoute } from "#framework";
import { videosValidatorsSchema } from "#shared/validators/videos";

const get_last_slash = (str: string, start_position?: number) => {
  const start = start_position ?? str.length;

  for (let index = start; index > 0; index--) {
    if (str[index] === "/") {
      return index;
    }
  }

  return -1;
};

export default defineRoute({
  query: videosValidatorsSchema.segment.query,
  params: videosValidatorsSchema.segment.params,

  async handler(event, { query, params }) {
    const base_url = query.base_url;

    if (/(\/api\/videos\/(\d+)\/segments\/(.*)\/(\d+)\.ts).*/.test(event.path)) {
      const last_slash = base_url.lastIndexOf("/");
      const base_path = base_url.slice(0, last_slash);
      const real_path = `${base_path}/${params.path}`;
      return fetch(real_path).then((res) => res.blob());
    }

    const last_slash = get_last_slash(base_url);
    const second_last_slash = get_last_slash(base_url, last_slash - 1);
    const quality = base_url.slice(second_last_slash + 1, last_slash);

    const response = await fetch(base_url).then((res) => res.text());
    return response.replaceAll(
      /((\d+)\.ts)/g,
      `/api/videos/${params.id}/segments/${quality}/$1?base_url=${base_url}`,
    );
  },
});
