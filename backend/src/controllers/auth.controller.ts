import { Request, Response } from 'express';
import User from '../models/user.model';
import { UserRole } from '../interface/user';

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

    //create user
    await User.create({
      fullName,
      email,
      gender,
      role: role || UserRole.USER,
      password,
    });

    res
      .status(201)
      .json({ success: true, message: `User registered successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
