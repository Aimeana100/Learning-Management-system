import httpStatus from 'http-status';
import userModel from '../models/user.model';
import { ErrorHandler } from '../utils/errorHandler';

class UserClass {
  // get user by Id
  async getUserById(userId: string) {
    const user = await userModel.findById(userId).select('+password');
    if (!user) {
      throw new ErrorHandler('User not found', httpStatus.NOT_FOUND);
    }
    return user;
  }
}

export default new UserClass();
