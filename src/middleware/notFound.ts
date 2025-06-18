import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

const notFound = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API route not found',
  });
};

export default notFound;
