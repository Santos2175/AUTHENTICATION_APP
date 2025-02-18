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

    res.status(201).json({
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

    //check if email is verified
    if (!user.isEmailVerified) {
      res.status(401).json({
        success: false,
        error: `Email is not verified. Please verify it`,
      });
      return;
    }

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

// verify otp handler
export const handleVerifyOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { OTPCode, email, action } = req.body;

    // check if user with email exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `User with given email doesn't exist.`,
      });
      return;
    }

    // check if the OTP is correct
    if (OTPCode !== user.OTPCode) {
      res.status(400).json({ success: false, error: `Invalid OTP code` });
      return;
    }

    // check if OTP is expired
    const currentTime = new Date();
    const OTPExpirationTime = new Date(user.OTPExpiry);

    if (currentTime > OTPExpirationTime) {
      res.status(400).json({
        success: false,
        error: `OTP Expired. Please request new one.`,
      });
      return;
    }

    // check action and follow the desired procedure
    switch (action) {
      case 'verifyEmail':
        if (user.isEmailVerified) {
          res
            .status(400)
            .json({ success: false, error: `Email is already verified.` });
          return;
        }

        // verify email and update it
        await user.updateOne({
          OTPCode: null,
          OTPExpiry: null,
          isEmailVerified: true,
        });

        res
          .status(200)
          .json({ success: true, message: 'Email verified successfully.' });
        return;

      case 'resetPassword':
        res.status(200).json({
          success: true,
          message: 'OTP verified. Proceed to change password',
          OTPCode,
          email,
        });
        return;

      default:
        res.status(400).json({ success: false, error: `Invalid action` });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// resend OTP code handler
export const handleResendOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // check if user with email exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `User with email: ${email} does not exist.`,
      });
      return;
    }

    // generate OTP and OTP expiry time
    const OTPCode = await generateUniqueOTP(6);
    const OTPExpiry = generateOTPExpiryTime();

    // for email
    const to = email;
    const subject = 'Verify OTP';
    const type = 'verifyOTP';
    const context = {
      fullName: user.fullName,
      OTPCode,
    };

    sendEmail({ to, subject, type, context });

    // update user
    await user.updateOne({ $set: { OTPCode, OTPExpiry } });

    res.status(200).json({
      success: true,
      message: `OTP sent to your email. Please verify it.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
