export class HttpError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  code?: string;

  constructor(status: number, message: string, errors?: Record<string, string[]>, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
