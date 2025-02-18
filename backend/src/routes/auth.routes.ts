import express from 'express';
import { handleRegisterUser } from '../controllers/auth.controller';

const router = express.Router();

// auth routes
router.route('/register').post(handleRegisterUser);

export default router;
