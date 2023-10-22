import dotenv from 'dotenv';
dotenv.config();
import { Response } from 'express';

import { redis } from '../database/radis';
import { IUser } from '../types/userTypes';
import defaultVars from '../config/defaultVars';

interface ITokenOption {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none' | undefined;
  secure?: boolean;
}

// parse envirnrment variables to integrate with fallbacks
export const accessTokenExpires = parseInt(defaultVars.jwt.access_expires);
export const refreshTokenExpires = parseInt(defaultVars.jwt.refresh_expires);

// options for cookies
export const accessTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000),
  maxAge: accessTokenExpires * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax'
};

export const refreshTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + refreshTokenExpires * 60 * 1000),
  maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax'
};

export const sendToken = (user: IUser, status: number, res: Response) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();

  // upload session to redis
  redis.set(user._id, JSON.stringify(user));

  // only set secure to true in production

  if (defaultVars.env === 'production') {
    accessTokenOptions.secure = true;
  }
  res.cookie('access_token', accessToken, accessTokenOptions);
  res.cookie('refresh_token', refreshToken, refreshTokenOptions);
  res.status(status).json({
    status: 'success',
    user,
    accessToken
  });
};
