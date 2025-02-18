import jwt from 'jsonwebtoken';
import { IPayload } from '../interface/token';

// generate tokens
export const generateToken = (
  payload: IPayload,
  tokenType: 'accessToken' | 'refreshToken'
): string => {
  try {
    // map keys
    const secretKeys: Record<
      'accessToken' | 'refreshToken',
      string | undefined
    > = {
      accessToken: process.env.JWT_SECRET1,
      refreshToken: process.env.JWT_SECRET2,
    };

    const secretKey = secretKeys[tokenType];

    if (!secretKey) {
      throw new Error('Secret key not defined');
    }

    // generate and return tokens
    return jwt.sign(payload, secretKey, {
      expiresIn:
        tokenType === 'accessToken'
          ? process.env.ACCESS_TOKEN_EXPIRY_TIME || '1h'
          : process.env.REFRESH_TOKEN_EXPIRY_TIME || '7d',
    });
  } catch (error: any) {
    console.error('Error generating token', error.message);
    throw new Error('Error generating token');
  }
};

// decode token
export const decodeToken = (
  token: string,
  tokenType: 'accessToken' | 'refreshToken'
) => {
  try {
    const secretKey: string =
      tokenType === 'accessToken'
        ? process.env.JWT_SECRET1!
        : process.env.JWT_SECRET2!;

    return jwt.verify(token, secretKey) as IPayload;
  } catch (error: any) {
    if (error === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    throw new Error('Error decoding token');
  }
};
