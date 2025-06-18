import express from 'express';
import validateRequest from '../middleware/validateRequest';
import {
  register,
  verifyEmail,
  resendVerifyCode,
  login,
  forgotPassword,
  resetPassword,
  logout,
  verifyForgotPasswordCode,
} from '../controllers/auth.controllers';
import {
  registerSchema,
  emailVerifySchema,
  loginSchema,
  verificationCodeSchema,
  resetPasswordSchema,
  verifyForgotPasswordCodeSchema,
} from '../validation/auth.validation';
import { isAuthenticatedUser } from '../middleware/authGuard';
const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post(
  '/verify-email',
  validateRequest(verificationCodeSchema),
  verifyEmail,
);
router.post(
  '/resend-verify-code',
  validateRequest(emailVerifySchema),
  resendVerifyCode,
);
router.post(
  '/forgot-password',
  validateRequest(emailVerifySchema),
  forgotPassword,
);

router.post(
  '/verify-forgot-password-code',
  validateRequest(verifyForgotPasswordCodeSchema),
  verifyForgotPasswordCode,
);
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  resetPassword,
);
router.post('/logout', isAuthenticatedUser, logout);

export default router;
