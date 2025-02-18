import { Request, Response } from 'express';
import User from '../models/user.model';
import { UserRole } from '../interface/user';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/token';
import { generateOTPExpiryTime, generateUniqueOTP } from '../utils/otp';
import { sendEmail } from '../utils/sendEmail';

// user register handler
export const handleRegisterUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fullName, email, password, role, gender } = req.body;

    // check if user with email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: `User with provided email already exists`,
      });
      return;
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    //create user
    const user = await User.create({
      fullName,
      email,
      gender,
      role: role || UserRole.USER,
      password: hashedPassword,
    });

    // generat otp and otp expiry time
    const OTPCode = await generateUniqueOTP(6);
    const OTPExpiry = generateOTPExpiryTime();

    // send email
    const to = user.email;
    const subject = 'Email Verification';
    const type = 'emailVerification';
    const context = {
      fullName,
      OTPCode,
    };

    sendEmail({ to, subject, type, context });

    // update user with otp code and otp expiry time
    await user.updateOne({ $set: { OTPCode, OTPExpiry } });

    res
      .status(201)
      .json({
        success: true,
        message: `User registered successfully. Please check your email to verify OTP`,
      });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// user login handler
export const handleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // check if user with provided email and password exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, error: 'Invalid Credentials' });
      return;
    }

    // check password
    const isPasswordMatched = await comparePassword(password, user.password);

    if (!isPasswordMatched) {
      res.status(400).json({ success: false, error: `Invalid Credentials` });
      return;
    }

    // todo check if email is verified

    // if everything is correct then generate tokens and login

    const payload = { _id: user._id.toString(), role: user.role };

    const accessToken = generateToken(payload, 'accessToken');

    const refreshToken = generateToken(payload, 'refreshToken');

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
