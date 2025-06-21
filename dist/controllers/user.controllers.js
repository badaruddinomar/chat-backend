'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.changePassword =
  exports.deleteUser =
  exports.updateUserProfile =
  exports.getAllUsers =
  exports.getSingleUser =
  exports.getUserProfile =
    void 0;
const catchAsync_1 = __importDefault(require('@/utils/catchAsync'));
const http_status_1 = __importDefault(require('http-status'));
const AppError_1 = __importDefault(require('@/utils/AppError'));
const prismaClient_1 = require('@/utils/prismaClient');
const cloudinaryImageUpload_1 = require('@/utils/cloudinaryImageUpload');
const bcryptjs_1 = __importDefault(require('bcryptjs'));
exports.getUserProfile = (0, catchAsync_1.default)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
      return next(
        new AppError_1.default(
          http_status_1.default.UNAUTHORIZED,
          'User not authenticated',
        ),
      );
    }
    const user = yield prismaClient_1.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return next(
        new AppError_1.default(
          http_status_1.default.NOT_FOUND,
          'User not found',
        ),
      );
    }
    // Send response to client
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  }),
);
exports.getSingleUser = (0, catchAsync_1.default)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
      return next(
        new AppError_1.default(
          http_status_1.default.BAD_REQUEST,
          'User not found',
        ),
      );
    }
    const user = yield prismaClient_1.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return next(
        new AppError_1.default(
          http_status_1.default.NOT_FOUND,
          'User not found',
        ),
      );
    }
    // Send response to client
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  }),
);
exports.getAllUsers = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { search, page, limit } = req.query;
    const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNumber = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const skip = (pageNumber - 1) * limitNumber;
    const searchText = search;
    const searchFilter = Object.assign(
      { isVerified: true },
      searchText && {
        OR: [
          { name: { contains: searchText.trim(), mode: 'insensitive' } },
          { email: { contains: searchText.trim(), mode: 'insensitive' } },
        ],
      },
    );
    // Get all users
    const users = yield prismaClient_1.prisma.user.findMany({
      where: searchFilter,
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const totalUsers = yield prismaClient_1.prisma.user.count({
      where: {
        isVerified: true,
      },
    });
    // Send response to client
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
      },
    });
  }),
);
exports.updateUserProfile = (0, catchAsync_1.default)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, phone, address } = req.body;
    const avatar =
      (_b = req.files) === null || _b === void 0 ? void 0 : _b.avatar;
    const user = yield prismaClient_1.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return next(
        new AppError_1.default(
          http_status_1.default.NOT_FOUND,
          'User not found',
        ),
      );
    }
    let avatarObj = user.avatar;
    // check is avatar exists--
    if (avatar) {
      // check avatar is more than one--
      if (Array.isArray(avatar)) {
        return next(
          new AppError_1.default(
            http_status_1.default.BAD_REQUEST,
            'Only one image can be uploaded for avatar',
          ),
        );
      }
      // check avatar file type is valid---
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(avatar.mimetype)) {
        return next(
          new AppError_1.default(
            http_status_1.default.BAD_REQUEST,
            'Invalid image type, image must be jpeg, png or webp',
          ),
        );
      }
      // check avatar file size--
      const MAX_SIZE = 2 * 1024 * 1024;
      if (avatar.size > MAX_SIZE) {
        return next(
          new AppError_1.default(
            http_status_1.default.BAD_REQUEST,
            'Image size must be less than 2MB',
          ),
        );
      }
      // Delete old avatar
      if (
        (_c = user.avatar) === null || _c === void 0 ? void 0 : _c.public_id
      ) {
        yield (0, cloudinaryImageUpload_1.deleteSingleImage)(
          user.avatar.public_id,
        );
      }
      // upload new avatar--
      avatarObj = yield (0, cloudinaryImageUpload_1.uploadSingleImage)(
        avatar,
        'tohori_avatars',
      );
    }
    const updatedUser = yield prismaClient_1.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        avatar: avatarObj,
      },
    });
    const { password: _password } = updatedUser,
      userData = __rest(updatedUser, ['password']);
    // Send response to client
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'User profile updated successfully',
      data: userData,
    });
  }),
);
exports.deleteUser = (0, catchAsync_1.default)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.params.id;
    const user = yield prismaClient_1.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return next(
        new AppError_1.default(
          http_status_1.default.NOT_FOUND,
          'User not found',
        ),
      );
    }
    if ((_a = user.avatar) === null || _a === void 0 ? void 0 : _a.public_id) {
      yield (0, cloudinaryImageUpload_1.deleteSingleImage)(
        user.avatar.public_id,
      );
    }
    yield prismaClient_1.prisma.user.delete({ where: { id: userId } });
    // Send response to client
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
  }),
);
exports.changePassword = (0, catchAsync_1.default)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { currentPassword, newPassword } = req.body;
    const user = yield prismaClient_1.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return next(
        new AppError_1.default(
          http_status_1.default.NOT_FOUND,
          'User not found',
        ),
      );
    }
    const isMatch = yield bcryptjs_1.default.compare(
      currentPassword,
      user.password,
    );
    if (!isMatch) {
      return next(
        new AppError_1.default(
          http_status_1.default.BAD_REQUEST,
          'Invalid credentials',
        ),
      );
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
    yield prismaClient_1.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    // Send response to client
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  }),
);
