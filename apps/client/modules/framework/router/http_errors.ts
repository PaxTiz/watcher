import { HttpError } from "@watcher/common";
import { createError } from "h3";

/**
 * Converts the domain errors thrown by services (`HttpError` from @watcher/common) into H3
 * errors, so their status code and message reach the client. Already wraps every `defineRoute`
 * handler: use it directly only in handlers built otherwise (e.g. nuxt-auth-utils handlers).
 */
export async function withHttpErrors<T>(callback: () => Promise<T>): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof HttpError) {
      throw createError({ statusCode: error.statusCode, message: error.message });
    }

    throw error;
  }
}
