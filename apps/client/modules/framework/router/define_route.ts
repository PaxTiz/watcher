import {
  createError,
  defineEventHandler,
  getRouterParams,
  getValidatedQuery,
  readValidatedBody,
  type RequestEvent,
} from "nuxt/server";
import { type ZodMiniType, type infer as zodInfer } from "zod/mini";

import { withHttpErrors } from "./http_errors";

type RouteHandler<
  Body extends ZodMiniType,
  Query extends ZodMiniType,
  Params extends ZodMiniType,
> = {
  body: zodInfer<Body>;

  query: zodInfer<Query>;

  params: zodInfer<Params>;
};

type Route<
  Body extends ZodMiniType = never,
  Query extends ZodMiniType = never,
  Params extends ZodMiniType = never,
  O extends unknown = unknown,
> = {
  body?: Body;

  query?: Query;

  params?: Params;

  handler: (event: RequestEvent, input: RouteHandler<Body, Query, Params>) => Promise<O>;
};

// `nuxt/server` has no `getValidatedRouterParams`: same error as `getValidatedQuery`/`readValidatedBody`
const validate_params = async <Params extends ZodMiniType>(event: RequestEvent, schema: Params) => {
  const result = await schema["~standard"].validate(getRouterParams(event));

  if (result.issues) {
    throw createError({
      status: 400,
      statusText: "Validation failed",
      message: "Validation failed",
      data: { issues: result.issues, message: "Validation failed" },
    });
  }

  return result.value as zodInfer<Params>;
};

export const defineRoute = <
  Body extends ZodMiniType = never,
  Query extends ZodMiniType = never,
  Params extends ZodMiniType = never,
  O = unknown,
>(
  route: Route<Body, Query, Params, O>,
) => {
  return defineEventHandler(async (event) => {
    const [body, query, params] = await Promise.all([
      route.body ? readValidatedBody(event, route.body) : Promise.resolve(null),
      route.query ? getValidatedQuery(event, route.query) : Promise.resolve(null),
      route.params ? validate_params(event, route.params) : Promise.resolve(null),
    ]);

    return withHttpErrors(() =>
      route.handler(event, {
        body: body as Body extends undefined ? never : zodInfer<Body>,
        query: query as Query extends undefined ? never : zodInfer<Query>,
        params: params as Params extends undefined ? never : zodInfer<Params>,
      }),
    );
  });
};
