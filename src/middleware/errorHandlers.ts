import createError from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler.js';

// catch 404 and forward to error handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
}

// Custom Error handler middleware 
export function customErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.httpCode).json({ error: err.message });
  } else {
    // Handle other errors here
    console.log("Error :( => ", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

// default error handler
export function DefaultErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send({ error: err.message });
}