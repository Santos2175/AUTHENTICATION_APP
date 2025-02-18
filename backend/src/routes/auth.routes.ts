import express from 'express';
import {
  handleRegisterUser,
  handleLogin,
  handleVerifyOTP,
  handleResendOTP,
  handleForgotPassword,
} from '../controllers/auth.controller';

const router = express.Router();

// auth routes
router.route('/register').post(handleRegisterUser);

router.route('/login').post(handleLogin);

router.route('/verify-otp').post(handleVerifyOTP);

router.route('/resend-otp').post(handleResendOTP);

// router.route('/get-access-token').post(handleGetAccessToken);

router.route('/forgot-password').post(handleForgotPassword);

// router.route('/reset-password').post(handleResetPassword);

// router.route('/change-password').post(handleChangePassword);

// router.route('/logout').post(handleLogout);

export default router;
