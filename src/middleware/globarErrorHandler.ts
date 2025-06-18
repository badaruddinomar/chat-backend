import httpStatus from 'http-status';
import config from '../config';
import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';

const globalErrorHandler: ErrorRequestHandler = (
  err,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  err.statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  err.message = err.message || 'Internal server error';

  // wrong mongodb id error--
  if (err.name === 'CastError') {
    const message = `Resource not found: ${err.path}`;
    err.statusCode = httpStatus.BAD_REQUEST;
    err.message = message;
  }
  // mongoose duplicate key errors--
  if (err.code === 11000) {
    const message = `Duplicate "${Object.keys(err.keyValue)}" entered`;
    err.statusCode = httpStatus.BAD_REQUEST;
    err.message = message;
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(
      (val) => (val as { message: string }).message,
    );
    const message = `Validation error: ${messages.join('. ')}`;
    err.statusCode = httpStatus.BAD_REQUEST;
    err.message = message;
  }
  // wrong jwt error--
  if (err.name === 'JsonWebTokenError') {
    const message = `json web token is invalid try again`;
    err.statusCode = httpStatus.BAD_REQUEST;
    err.message = message;
  }
  // jwt expires error--
  if (err.name === 'TokenExpiredError') {
    const message = 'Json web token expired';
    err.statusCode = httpStatus.BAD_REQUEST;
    err.message = message;
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: config.node_env === 'development' ? err.stack : null,
  });
};
export default globalErrorHandler;
