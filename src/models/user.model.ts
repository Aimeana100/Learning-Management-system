import mongoose, { Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
require('dotenv').config();

import { IUser } from '../types/userTypes';
import defaultVars from '../config/defaultVars';

const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name']
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: 'Please enter your email'
      }
    },
    password: {
      type: String,
      minlength: [6, ' Password must be at least 6 characters'],
      select: false
    },
    avatar: {
      public_id: String,
      url: String
    },
    role: {
      type: String,
      default: 'User'
    },
    isVerfied: {
      type: Boolean,
      default: false
    },
    courses: [
      {
        courseId: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
userSchema.methods.comparePassword = async function (enterPassword: string): Promise<boolean> {
  return await bcrypt.compare(enterPassword, this.password);
};

// sign in access token
userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, defaultVars.jwt.access_secret, {
    expiresIn: '5m'
  });
};

// sign refresh token
userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, defaultVars.jwt.refresh_token, { expiresIn: '3d' });
};
const userModel: Model<IUser> = mongoose.model('User', userSchema);

export default userModel;
