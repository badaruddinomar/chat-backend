import express from 'express';
import { authorizeRoles, isAuthenticatedUser } from '../middleware/authGuard';
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controllers';
import validateRequest from '../middleware/validateRequest';
import {
  changePasswordSchema,
  updateUserProfileSchema,
} from '../validation/user.validation';

const router = express.Router();

router.get('/profile', isAuthenticatedUser, getUserProfile);
router.get('/all', isAuthenticatedUser, authorizeRoles('ADMIN'), getAllUsers);
router.patch(
  '/update',
  isAuthenticatedUser,
  validateRequest(updateUserProfileSchema),
  updateUserProfile,
);
router.delete(
  '/delete/:id',
  isAuthenticatedUser,
  authorizeRoles('ADMIN'),
  deleteUser,
);
router.patch(
  '/change-password',
  isAuthenticatedUser,
  validateRequest(changePasswordSchema),
  changePassword,
);

export default router;
