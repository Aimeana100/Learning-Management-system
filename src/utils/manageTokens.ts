import jwt from 'jsonwebtoken';
import defaultVars from '../config/defaultVars';
import { IActivationToken } from '../types/tokenTypes';
import { IUser } from '../types/userTypes';

export const createActionToken = (user: IUser): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign({ user, activationCode }, defaultVars.jwt.activation_secret, {
    expiresIn: '5m'
  });
  return {
    token,
    activationCode
  };
};
