"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyForgotPasswordCodeSchema = exports.emailVerifySchema = exports.loginSchema = exports.verificationCodeSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').trim(),
    email: zod_1.z
        .string()
        .email('Invalid email format')
        .trim()
        .transform((val) => val.toLowerCase()),
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .trim(),
    phone: zod_1.z
        .string()
        .regex(/^(?:\+8801|01)[3-9]\d{8}$/, 'Invalid phone number')
        .trim(),
    address: zod_1.z.string().min(1, 'Address is required').trim(),
});
exports.verificationCodeSchema = zod_1.z.object({
    verificationCode: zod_1.z
        .string()
        .min(6, 'Verification code must be 6 characters long')
        .max(6, 'Verification code must be 6 characters long')
        .regex(/^\d+$/, 'Verification code must be numeric')
        .trim(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').trim(),
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .trim(),
});
exports.emailVerifySchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').trim(),
});
exports.verifyForgotPasswordCodeSchema = zod_1.z.object({
    forgotPasswordCode: zod_1.z
        .string()
        .min(6, 'code must be 6 characters long')
        .max(6, 'code must be 6 characters long')
        .regex(/^\d+$/, 'code must be numeric')
        .trim(),
    email: zod_1.z.string().email('Invalid email format').trim(),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .trim(),
});
// .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must include letters and numbers') // TODO: add this validation after api testing
