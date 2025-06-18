import { z } from 'zod';

export const updateUserProfileSchema = z
  .object({
    name: z.string().min(1, 'Name is required').trim(),
    phone: z
      .string()
      .regex(/^(?:\+8801|01)[3-9]\d{8}$/, 'Invalid phone number')
      .trim(),
    address: z.string().min(1, 'Address is required').trim(),
  })
  .partial();
export type UpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Invalid current password').trim(),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .trim(),
    confirmPassword: z
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

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
