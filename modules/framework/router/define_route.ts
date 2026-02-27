import {
  H3Event,
  defineEventHandler,
  readValidatedBody,
  getValidatedQuery,
  getValidatedRouterParams,
} from "h3";
import { type ZodMiniType, type infer as zodInfer } from "zod/mini";

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

  handler: (event: H3Event, input: RouteHandler<Body, Query, Params>) => Promise<O>;
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
      route.body ? readValidatedBody(event, route.body.parse) : Promise.resolve(null),
      route.query ? getValidatedQuery(event, route.query.parse) : Promise.resolve(null),
      route.params ? getValidatedRouterParams(event, route.params.parse) : Promise.resolve(null),
    ]);

    return route.handler(event, {
      body: body as Body extends undefined ? never : zodInfer<Body>,
      query: query as Query extends undefined ? never : zodInfer<Query>,
      params: params as Params extends undefined ? never : zodInfer<Params>,
    });
  });
};
