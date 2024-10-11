import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler.js';

// Custom Error handler middleware 
export function customErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.httpCode).json({ success: false, message: err.message });
  } else {
    // Handle other errors here
    console.error("Error :( => ", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// default error handler
export function DefaultErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log("Catch Error :(( => ", err);
  res.status(err.status || 500).send({ message: "Internal server error" });
}