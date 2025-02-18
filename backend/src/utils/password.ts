import bcrypt from 'bcryptjs';

// generate hashed password
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
  } catch (error: any) {
    throw new Error('Error hashing password');
  }
};

// comparing password utility
export const comparePassword = async (
  currentPassword: string,
  inputPassword: string
): Promise<boolean> => {
  try {
    return bcrypt.compare(currentPassword, inputPassword);
  } catch (error: any) {
    throw new Error('Error Comparing password');
  }
};
