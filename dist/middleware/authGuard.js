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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticatedUser = void 0;
const AppError_1 = __importDefault(require("@/utils/AppError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("@/config"));
const http_status_1 = __importDefault(require("http-status"));
const prismaClient_1 = require("@/utils/prismaClient");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync"));
exports.isAuthenticatedUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please login to access this resource.'));
    }
    const token = authHeader.split(' ')[1];
    const decodedData = jsonwebtoken_1.default.verify(token, config_1.default.jwt_secret);
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { id: decodedData === null || decodedData === void 0 ? void 0 : decodedData.userId },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User no longer exists. Please login again.'));
    }
    if (!user.isVerified) {
        return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please verify your email.'));
    }
    req.user = user;
    next();
}));
// Authorize Roles--
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError_1.default(http_status_1.default.FORBIDDEN, `Role ${req.user.role} is not allowed to access this resource.`));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
