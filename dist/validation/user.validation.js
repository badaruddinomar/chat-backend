'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.changePasswordSchema = exports.updateUserProfileSchema = void 0;
const zod_1 = require('zod');
exports.updateUserProfileSchema = zod_1.z
  .object({
    name: zod_1.z.string().min(1, 'Name is required').trim(),
    phone: zod_1.z
      .string()
      .regex(/^(?:\+8801|01)[3-9]\d{8}$/, 'Invalid phone number')
      .trim(),
    address: zod_1.z.string().min(1, 'Address is required').trim(),
  })
  .partial();
exports.changePasswordSchema = zod_1.z
  .object({
    currentPassword: zod_1.z.string().min(6, 'Invalid current password').trim(),
    newPassword: zod_1.z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .trim(),
    confirmPassword: zod_1.z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long')
      .trim(),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Confirm password must match new password',
    path: ['confirmPassword'],
  });
