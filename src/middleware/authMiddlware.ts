import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';

import { catchAsyncError } from './catchAsyncError';
import { ErrorHandler } from '../utils/errorHandler';
import defaultVars from '../config/defaultVars';
import { redis } from '../database/radis';

// autenticated user
export const isAuthenticated = catchAsyncError(
  async (req: Request, _res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(
        new ErrorHandler('Please login to access this resource', httpStatus.UNAUTHORIZED)
      );
    }
    const decoded = jwt.verify(
      access_token,
      defaultVars.jwt.access_secret as jwt.Secret
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler('access token not valid', httpStatus.UNAUTHORIZED));
    }
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler('user not found', httpStatus.UNAUTHORIZED));
    }

    req.user = JSON.parse(user);
    next();
  }
);

// validate user role
export const authorizeRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(
        new ErrorHandler(
          `Role ${req.user?.role} is allowed to access this resources`,
          httpStatus.FORBIDDEN
        )
      );
    }
    next();
  };
};
