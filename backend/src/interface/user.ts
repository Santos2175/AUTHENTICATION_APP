export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// user interface
export interface IUser {
  fullName: string;
  email: string;
  password: string;
  gender: Gender;
  isEmailVerified: boolean;
  role: UserRole;
  accessToken: string | null;
  refreshToken: string | null;
  OTPCode: string | null;
  OTPExpiry: Date;
}
