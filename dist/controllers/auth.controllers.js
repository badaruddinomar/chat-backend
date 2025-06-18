"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.verifyForgotPasswordCode = exports.forgotPassword = exports.login = exports.resendVerifyCode = exports.verifyEmail = exports.register = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const createJwtToken_1 = require("../utils/createJwtToken");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const verifyEmailTemplate_1 = require("../emailTemplates/verifyEmailTemplate");
const forgotPassEmailTemplate_1 = require("../emailTemplates/forgotPassEmailTemplate");
const prismaClient_1 = require("../utils/prismaClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
exports.register = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    // check if user exists--
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { email },
    });
    if (user) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User already exists!'));
    }
    // hash password--
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    // create verify token--
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpire = new Date(Date.now() + 1 * 60 * 1000); // 1 min from now
    // Create new user
    const newUser = yield prismaClient_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            verifyCode: verificationCode,
            verifyCodeExpire,
        },
    });
    // send verification email--
    yield (0, sendEmail_1.default)({
        reciverEmail: newUser.email,
        subject: 'Verify your email',
        body: (0, verifyEmailTemplate_1.verifyEmailTemplate)(verificationCode),
    });
    // send response to client--
    const { password: _password, verifyCode: _verifyCode, verifyCodeExpire: _verifyCodeExpire, forgotPasswordCode: _forgotPasswordCode, forgotPasswordCodeExpire: _forgotPasswordCodeExpire } = newUser, userData = __rest(newUser, ["password", "verifyCode", "verifyCodeExpire", "forgotPasswordCode", "forgotPasswordCodeExpire"]);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: 'user registered successfully',
        data: userData,
    });
}));
exports.verifyEmail = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { verificationCode } = req.body;
    // 1. Check if the verification code is valid and not expired
    const user = yield prismaClient_1.prisma.user.findFirst({
        where: {
            verifyCode: verificationCode,
            verifyCodeExpire: {
                gt: new Date(),
            },
        },
    });
    // if not valid--
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid code'));
    }
    // 3. Update the user as verified and clear the verification fields
    yield prismaClient_1.prisma.user.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            verifyCode: null,
            verifyCodeExpire: null,
        },
    });
    // send response to client--
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Email verified successfully',
    });
}));
exports.resendVerifyCode = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    // Check if user exists in the database
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.NOT_FOUND, 'User with this email does not exist!'));
    }
    if (user.isVerified) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Email is already verified!'));
    }
    // Generate a new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newVerifyCodeExpire = new Date(Date.now() + 1 * 60 * 1000);
    // Update user with the new verification code and expiry time
    yield prismaClient_1.prisma.user.update({
        where: { email },
        data: {
            verifyCode: newVerificationCode,
            verifyCodeExpire: newVerifyCodeExpire,
        },
    });
    // Send the verification email
    yield (0, sendEmail_1.default)({
        reciverEmail: user.email,
        subject: 'Resend Verify Code',
        body: (0, verifyEmailTemplate_1.verifyEmailTemplate)(newVerificationCode),
    });
    // Respond to the client
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Verification code has been resent. Please check your email.',
    });
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // 1. Check if user exists
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid credentials'));
    }
    // compare the password--
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid credentials'));
    }
    if (!user.isVerified) {
        return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please verify your email'));
    }
    // create jwt token--
    const token = (0, createJwtToken_1.createJwtToken)(user);
    // Send response to client (exclude password)
    const { password: _password, verifyCode: _verifyCode, verifyCodeExpire: _verifyCodeExpire, forgotPasswordCode: _forgotPasswordCode, forgotPasswordCodeExpire: _forgotPasswordCodeExpire } = user, userData = __rest(user, ["password", "verifyCode", "verifyCodeExpire", "forgotPasswordCode", "forgotPasswordCodeExpire"]);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'user logged in successfully',
        data: userData,
        meta: {
            token,
        },
    });
}));
exports.forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    // 1. Check if user exists
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not found'));
    }
    // 2. Generate code and expiry
    const forgotPasswordCode = Math.floor(100000 + Math.random() * 900000).toString();
    const forgotPasswordCodeExpire = new Date(Date.now() + 1 * 60 * 1000); // 1 mins
    // 3. Update user in DB
    yield prismaClient_1.prisma.user.update({
        where: { email },
        data: {
            forgotPasswordCode,
            forgotPasswordCodeExpire,
        },
    });
    yield (0, sendEmail_1.default)({
        reciverEmail: email,
        subject: 'Reset your password',
        body: (0, forgotPassEmailTemplate_1.forgotPasswordEmailTemplate)(forgotPasswordCode),
    });
    // 5. Respond to client
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Password reset email sent successfully',
    });
}));
exports.verifyForgotPasswordCode = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, forgotPasswordCode } = req.body;
    const user = yield prismaClient_1.prisma.user.findFirst({
        where: {
            email,
            forgotPasswordCode,
            forgotPasswordCodeExpire: { gt: new Date() },
        },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid code'));
    }
    // Issue a short-lived reset token (expires in e.g., 10 mins)
    const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'RESET_PASSWORD' }, config_1.default.jwt_secret, {
        expiresIn: '10m',
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Code verified successfully',
        meta: {
            resetToken,
        },
    });
}));
exports.resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { password } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Reset token required'));
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, config_1.default.jwt_secret);
    }
    catch (_b) {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid token'));
    }
    if (payload.type !== 'RESET_PASSWORD') {
        return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid reset token'));
    }
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found'));
    }
    // 2. Hash the new password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    yield prismaClient_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            forgotPasswordCode: null,
            forgotPasswordCodeExpire: null,
        },
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Password reset successfully',
    });
}));
exports.logout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'user logged out successfully',
    });
}));
