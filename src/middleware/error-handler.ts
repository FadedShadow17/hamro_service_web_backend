import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/http-error';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors → 422
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    res.status(422).json({
      message: 'Validation error',
      errors: formattedErrors,
    });
    return;
  }

  // Handle HttpError
  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.errors && { errors: error.errors }),
    });
    return;
  }

  // Handle unknown errors → 500
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Internal server error',
  });
}

