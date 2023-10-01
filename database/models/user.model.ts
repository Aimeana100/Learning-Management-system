import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerfied: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
}

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
      required: [true, 'Please enter your password'],
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

const userModel: Model<IUser> = mongoose.model('User', userSchema);

export default userModel;
