'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const validateRequest_1 = __importDefault(
  require('@/middleware/validateRequest'),
);
const auth_controllers_1 = require('@/controllers/auth.controllers');
const auth_validation_1 = require('@/validation/auth.validation');
const authGuard_1 = require('@/middleware/authGuard');
const router = express_1.default.Router();
router.post(
  '/register',
  (0, validateRequest_1.default)(auth_validation_1.registerSchema),
  auth_controllers_1.register,
);
router.post(
  '/login',
  (0, validateRequest_1.default)(auth_validation_1.loginSchema),
  auth_controllers_1.login,
);
router.post(
  '/verify-email',
  (0, validateRequest_1.default)(auth_validation_1.verificationCodeSchema),
  auth_controllers_1.verifyEmail,
);
router.post(
  '/resend-verify-code',
  (0, validateRequest_1.default)(auth_validation_1.emailVerifySchema),
  auth_controllers_1.resendVerifyCode,
);
router.post(
  '/forgot-password',
  (0, validateRequest_1.default)(auth_validation_1.emailVerifySchema),
  auth_controllers_1.forgotPassword,
);
router.post(
  '/verify-forgot-password-code',
  (0, validateRequest_1.default)(
    auth_validation_1.verifyForgotPasswordCodeSchema,
  ),
  auth_controllers_1.verifyForgotPasswordCode,
);
router.post(
  '/reset-password',
  (0, validateRequest_1.default)(auth_validation_1.resetPasswordSchema),
  auth_controllers_1.resetPassword,
);
router.post(
  '/logout',
  authGuard_1.isAuthenticatedUser,
  auth_controllers_1.logout,
);
exports.default = router;
