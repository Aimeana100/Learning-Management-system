import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import path from 'path';
import ejs from 'ejs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

import userModel from '../models/user.model';
import { ErrorHandler } from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import { createActionToken } from '../utils/manageTokens';
import { ILoginRequest, ISocialAuth, IUser } from '../types/userTypes';
import sendMail from '../utils/sendMail';
import { IActivationRequest } from '../types/tokenTypes';
import defaultVars from '../config/defaultVars';
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';
import { redis } from '../database/radis';
import userClass from '../services/user.services';

interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

const registerUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as IRegisterUser;
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      throw new ErrorHandler('Email already exist', httpStatus.CONFLICT);
    }

    const user: IRegisterUser = {
      name,
      email,
      password
    };
    const activationToken = createActionToken(user as IUser);
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };

    await ejs.renderFile(path.join(__dirname, '../views/activation.mail.ejs'), data);

    try {
      await sendMail({
        email: user.email,
        subject: 'Activate your account',
        template: 'activation.mail.ejs',
        data
      });

      res.status(httpStatus.CREATED).json({
        status: 'success',
        message: `Please check your email: ${user.email} to activate your account`,
        activationToken: activationToken.token
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, httpStatus.BAD_REQUEST));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, httpStatus.BAD_REQUEST));
  }
});

// activate a user
const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activation_code, activation_token } = req.body as IActivationRequest;

    const newUser: { user: IUser; activationCode: string } = jwt.verify(
      activation_token,
      defaultVars.jwt.activation_secret as jwt.Secret
    ) as { user: IUser; activationCode: string };

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler('Invalid activation code', httpStatus.BAD_REQUEST));
    }

    const { name, email, password } = newUser.user;
    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return next(new ErrorHandler(' Email already exist', httpStatus.BAD_REQUEST));
    }

    const user = await userModel.create({ email, password, name });
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    return next(new ErrorHandler(error.message, httpStatus.BAD_REQUEST));
  }
});

const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as ILoginRequest;

  try {
    if (!email || !password) {
      return next(new ErrorHandler('Please enter email and password', httpStatus.BAD_REQUEST));
    }
    const user = await userModel.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new ErrorHandler('Invalid email or Password', httpStatus.UNAUTHORIZED));
    }
    sendToken(user, httpStatus.OK, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, httpStatus.UNAUTHORIZED));
  }
});

// loggout a user
const logoutUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });
    redis.del(req.user._id);
    res.status(httpStatus.OK).json({ status: 'success', message: 'Logout successfully' });
  } catch (error) {
    return next(new ErrorHandler(error.message, httpStatus.BAD_REQUEST));
  }
});

// update token

const updateToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const decoded = jwt.verify(
      refresh_token,
      defaultVars.jwt.refresh_token as string,
      (err: any, data: any) => {
        if (data) {
          return data;
        } else {
          return new ErrorHandler(err?.message, httpStatus.BAD_REQUEST);
        }
      }
    ) as JwtPayload | undefined;

    const message = `couldn't refresh token`;
    // if(decoded instanceof ErrorHandler){
    //   return next(new ErrorHandler(decoded.message, httpStatus.BAD_REQUEST))
    // }

    if (!decoded) {
      return next(new ErrorHandler(message, httpStatus.BAD_REQUEST));
    }
    const session = await redis.get(decoded.id as string);

    if (!session) {
      return next(new ErrorHandler(message, httpStatus.BAD_REQUEST));
    }
    const user = JSON.parse(session);

    const accessToken = jwt.sign({ id: user._id }, defaultVars.jwt.access_secret as string, {
      expiresIn: '5m'
    });
    const refreshToken = jwt.sign({ id: user._id }, defaultVars.jwt.refresh_token as string, {
      expiresIn: '1min'
    });

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    res.status(httpStatus.OK).json({
      status: 'success',
      refreshToken
    });
  } catch (error) {
    return new ErrorHandler(error.message, httpStatus.BAD_REQUEST);
  }
});

const getUserInfo = catchAsyncError(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const user = await userClass.getUserById(userId);

  return res.status(httpStatus.OK).json({ status: 'success', data: user });
});

// social authentication
const socialAuth = catchAsyncError(async (req: Request, res: Response) => {
  const { email, name, avatar } = req.body as ISocialAuth;
  let user = await userModel.findOne({ email });

  if (!user) {
    user = await userModel.create({ email, name, avatar });
  }
  sendToken(user, httpStatus.OK, res);
});

const UpdateUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, name } = req.body;
  const userId = req.user._id;
  const user = await userClass.getUserById(userId);
  if (user) {
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler(`User ${user.email} already exists`, httpStatus.CONFLICT));
    }
    user.email = email;
  }

  if (name) {
    user.name = name;
  }
  await user.save();
  await redis.set(userId, JSON.stringify(user));

  res.status(httpStatus.OK).json({ status: 'success', data: user });
});

const updatePassword = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body;
  const user = await userClass.getUserById(req.user._id);

  if (user.password === undefined) {
    return next(new ErrorHandler('User does not exist', httpStatus.BAD_REQUEST));
  }
  const isMatchPassword = await user?.comparePassword(oldPassword);
  if (!isMatchPassword) {
    return next(new ErrorHandler('Invalid password', httpStatus.BAD_REQUEST));
  }
  user.password = newPassword;

  await user.save();

  res
    .status(httpStatus.OK)
    .json({ status: 'success', message: 'Password updated successfully', data: user });
});

// update profile picture
const updateProfilePicture = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const  avatar  =  (req.file as Express.Multer.File ).path;
    const user = await userClass.getUserById(req.user._id);
    const public_id = user?.avatar?.public_id;
    
    if(!avatar){
      return next(new ErrorHandler('Image avatar not found', httpStatus.BAD_REQUEST))
    }

    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }

    const myCloud = await cloudinary.uploader.upload(avatar, {
      folder: 'avatars',
      width: 150
    });
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    };
    await user.save();

    await redis.set(user._id, JSON.stringify(user));
    return res.status(httpStatus.OK).json({ status: 'success', data: user });
  }
);
export {
  registerUser,
  activateUser,
  loginUser,
  logoutUser,
  updateToken,
  getUserInfo,
  socialAuth,
  UpdateUserInfo,
  updatePassword,
  updateProfilePicture
};
