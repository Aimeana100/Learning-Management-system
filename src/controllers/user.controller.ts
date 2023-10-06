import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import path from 'path';
import ejs from 'ejs';
import jwt from 'jsonwebtoken';

import userModel from '../../src/models/user.model';
import { ErrorHandler } from '../utils/errorHandler';
import { catchAsyncError } from '../../src/middleware/catchAsyncError';
import { createActionToken } from '../utils/manageTokens';
import { IUser } from '../../src/types/userTypes';
import sendMail from '../utils/sendMail';
import { IActivationRequest } from '../types/tokenTypes';
import defaultVars from '../config/defaultVars';

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

    const html = await ejs.renderFile(path.join(__dirname, '../views/activation.mail.ejs'), data);

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

    const { name, email, password} = newUser.user
    const existUser = await userModel.findOne({ email})

    if(existUser){
      return next(new ErrorHandler(' Email already exist', httpStatus.BAD_REQUEST));
    }

    const user = await userModel.create({ email, password, name})
    res.status(200).json({status: 'success' , data: user})

  } catch (error) {
    return next(new ErrorHandler(error.message, httpStatus.BAD_REQUEST));
  }
});

export { registerUser, activateUser };
