import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface ErrorResponse {
  message: string;
  errors?: string[];
  code?: string;
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error Details]:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      message: 'Validation Error',
      errors: err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
      code: 'VALIDATION_ERROR'
    };
    res.status(400).json(response);
    return;
  }

  // Custom application errors
  if (err.name === 'NotFoundError') {
    res.status(404).json({ 
      message: err.message || 'Resource not found',
      code: 'NOT_FOUND'
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ 
      message: err.message || 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  // Default to 500 internal server error
  res.status(500).json({
    message: 'An internal server error occurred',
    code: 'INTERNAL_ERROR'
  });
};