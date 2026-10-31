// Framework-agnostic domain errors, converted to HTTP errors by `defineRoute` / `withHttpErrors`
export abstract class HttpError extends Error {
  abstract readonly status: number;

  constructor(public params: { message?: string } = {}) {
    super(params.message);
  }
}

export class BadRequestError extends HttpError {
  readonly status = 400;
}

export class UnauthorizedError extends HttpError {
  readonly status = 401;
}

export class ForbiddenError extends HttpError {
  readonly status = 403;
}

export class NotFoundError extends HttpError {
  readonly status = 404;
}

export class ConflictError extends HttpError {
  readonly status = 409;
}

export class UnprocessableEntityError extends HttpError {
  readonly status = 422;
}
