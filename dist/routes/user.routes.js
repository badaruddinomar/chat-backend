'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const authGuard_1 = require('@/middleware/authGuard');
const user_controllers_1 = require('@/controllers/user.controllers');
const validateRequest_1 = __importDefault(
  require('@/middleware/validateRequest'),
);
const user_validation_1 = require('@/validation/user.validation');
const router = express_1.default.Router();
router.get(
  '/profile',
  authGuard_1.isAuthenticatedUser,
  user_controllers_1.getUserProfile,
);
router.get(
  '/all',
  authGuard_1.isAuthenticatedUser,
  (0, authGuard_1.authorizeRoles)('ADMIN'),
  user_controllers_1.getAllUsers,
);
router.patch(
  '/update',
  authGuard_1.isAuthenticatedUser,
  (0, validateRequest_1.default)(user_validation_1.updateUserProfileSchema),
  user_controllers_1.updateUserProfile,
);
router.delete(
  '/delete/:id',
  authGuard_1.isAuthenticatedUser,
  (0, authGuard_1.authorizeRoles)('ADMIN'),
  user_controllers_1.deleteUser,
);
router.patch(
  '/change-password',
  authGuard_1.isAuthenticatedUser,
  (0, validateRequest_1.default)(user_validation_1.changePasswordSchema),
  user_controllers_1.changePassword,
);
exports.default = router;
