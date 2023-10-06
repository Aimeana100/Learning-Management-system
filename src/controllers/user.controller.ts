import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import path from 'path';
import ejs from 'ejs';

import userModel from '../../src/models/user.model';
import { ErrorHandler } from '../utils/errorHandler';
import { catchAsyncError } from '../../src/middleware/catchAsyncError';
import { createActionToken } from '../utils/createActionToken';
import { IUser } from '../../src/types/userTypes';

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
    const activationToken = createActionToken(user as IUser)
    const activationCode = activationToken.activationCode
    const data  = { user: { name: user.name}, activationCode}

    const html = await ejs.renderFile(path.join(__dirname, '../views/activation.mail.ejs'))
      
  } catch (error) {
    throw new ErrorHandler('Could not register user', httpStatus.BAD_REQUEST)
  }
});
