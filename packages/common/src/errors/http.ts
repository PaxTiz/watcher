// Framework-agnostic domain errors, converted to HTTP errors by `defineRoute` / `withHttpErrors`
export abstract class HttpError extends Error {
  abstract readonly statusCode: number;

  constructor(public params: { message?: string } = {}) {
    super(params.message);
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400;
}

export class UnauthorizedError extends HttpError {
  readonly statusCode = 401;
}

export class ForbiddenError extends HttpError {
  readonly statusCode = 403;
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
}

export class ConflictError extends HttpError {
  readonly statusCode = 409;
}

export class UnprocessableEntityError extends HttpError {
  readonly statusCode = 422;
}
