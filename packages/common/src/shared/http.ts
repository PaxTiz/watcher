import type { FetchOptions } from "ofetch";

// Transient failures. Timeouts and network errors are retried too: ofetch treats them as a 500.
const RETRY_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504];

export type RequestOptionsOverrides = {
  timeout?: number; // in ms
  retry?: number;
  retry_delay?: number; // in ms, doubled after each attempt
};

// `null` status: the request never got a response (network error, timeout)
export type RequestRecorder = (name: string, status: number | null) => void;

let recorder: RequestRecorder | null = null;

export const set_request_recorder = (callback: RequestRecorder | null) => {
  recorder = callback;
};

// Options of every outgoing request, spread explicitly in each call so its behavior is visible
// there. `name` identifies the endpoint in the request stats (`<service>.<api>.<endpoint>`): every
// attempt is counted, retries included. Override what a call needs, e.g. `{ retry: 0 }` for a
// request that must never be sent twice (a token refresh rotates the refresh token).
export const request_options = (
  name: string,
  { timeout = 10_000, retry = 3, retry_delay = 500 }: RequestOptionsOverrides = {},
) =>
  ({
    timeout,
    retry,
    // `context.options.retry` is the number of retries left: 500 ms, 1 s, 2 s...
    retryDelay: (context) => retry_delay * 2 ** (retry - Number(context.options.retry ?? retry)),
    retryStatusCodes: RETRY_STATUS_CODES,
    onResponse: (context) => {
      recorder?.(name, context.response.status);
    },
    onRequestError: (context) => {
      recorder?.(name, null);

      // ofetch (1.5.1) stores the timeout's abort signal in the options, and a retry reuses them:
      // without this, the retry of a timed out request is aborted right away
      if (context.error?.name === "TimeoutError") {
        context.options.signal = undefined;
      }
    },
  }) satisfies FetchOptions;
