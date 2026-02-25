export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, "path");
  const query = getQuery(event);

  const base_url = query.base_url as string;

  const last_slash = base_url.lastIndexOf("/");
  const base_path = base_url.slice(0, last_slash);
  const real_path = `${base_path}/${path}`;

  return fetch(real_path).then((res) => res.blob());
});
