import User from '../models/user.model';

// generate OTPCode
const generateOTP = (n: number): string => {
  const digits = '1234567890';
  let OTPCode = '';

  for (let i = 0; i < n; i++) {
    OTPCode += digits[Math.floor(Math.random() * 10)];
  }

  return OTPCode;
};

// generate unique OTPCode
export const generateUniqueOTP = async (n: number): Promise<string> => {
  try {
    let isInvalid = true;
    let OTPCode = generateOTP(n);

    // it generates unique otp code
    while (isInvalid) {
      const existingOTP = await User.findOne({ OTPCode });

      if (!existingOTP) {
        isInvalid = !isInvalid;
      } else {
        OTPCode = generateOTP(n);
      }
    }

    return OTPCode;
  } catch (error: any) {
    throw error;
  }
};

// generate OTP expiry time
export const generateOTPExpiryTime = () => {
  const now = new Date();

  const expiryTime = new Date(
    now.getTime() + parseInt(process.env.OTP_EXPIRY_TIME!) * 60 * 1000
  );

  return expiryTime;
};
