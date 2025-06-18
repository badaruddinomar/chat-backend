import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ZodSchema } from 'zod';

const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((error) => {
        return `${error.path.join('.')}: ${error.message}`;
      });

      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: formattedErrors.join(', '),
      });
      return;
    }

    req.body = result.data;
    next();
  };

export default validateRequest;
