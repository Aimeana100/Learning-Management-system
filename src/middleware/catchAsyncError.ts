import { NextFunction, Request, RequestHandler, Response } from 'express';

export const catchAsyncError =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
