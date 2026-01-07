import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../../shared/errors/http-error';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors → 422
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    const errorMessages: string[] = [];
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
      // Create user-friendly error message
      const fieldName = path.split('.').pop() || path;
      const friendlyFieldName = fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/phone number/i, 'Phone Number')
        .replace(/citizenship number/i, 'Citizenship Number')
        .replace(/service role/i, 'Service Role')
        .replace(/full name/i, 'Full Name');
      errorMessages.push(`${friendlyFieldName}: ${err.message}`);
    });

    // Log validation errors for debugging
    console.error('Validation errors:', formattedErrors);

    res.status(422).json({
      message: errorMessages.length > 0 ? errorMessages.join('. ') : 'Please check your input and try again',
      errors: formattedErrors,
    });
    return;
  }

  // Handle HttpError
  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.code && { code: error.code }),
      ...(error.errors && { errors: error.errors }),
    });
    return;
  }

  // Handle unknown errors → 500
  console.error('Unhandled error:', error);
  console.error('Error stack:', error.stack);
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    }),
  });
}

