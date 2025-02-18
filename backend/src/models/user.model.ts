import { Schema, model } from 'mongoose';
import { IUser, UserRole } from '../interface/user';

// user schema
const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: UserRole.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    OTPCode: {
      type: String,
    },
    OTPExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// user model
const User = model('User', userSchema);

export default User;
