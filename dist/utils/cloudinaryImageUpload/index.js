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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteMultipleImages =
  exports.uploadMultipleImages =
  exports.deleteSingleImage =
  exports.uploadSingleImage =
    void 0;
const cloudinary_1 = __importDefault(require('@/config/cloudinary'));
const uploadSingleImage = (
  image, // req.files?.image as UploadedFile
  folderName,
) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const result = yield cloudinary_1.default.uploader.upload(
        image.tempFilePath,
        {
          folder: folderName,
        },
      );
      return {
        url: result.secure_url,
        public_id: result.public_id.split('/')[1],
      };
    } catch (err) {
      throw err;
    }
  });
exports.uploadSingleImage = uploadSingleImage;
const deleteSingleImage = (publicId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield cloudinary_1.default.uploader.destroy(publicId);
    } catch (err) {
      throw err;
    }
  });
exports.deleteSingleImage = deleteSingleImage;
const uploadMultipleImages = (
  images, // req.files?.images as UploadedFile[]
  folderName,
) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const results = yield Promise.all(
        images.map((image) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const result = yield cloudinary_1.default.uploader.upload(
              image.tempFilePath,
              {
                folder: folderName,
              },
            );
            return {
              url: result.secure_url,
              public_id: result.public_id.split('/')[1],
            };
          }),
        ),
      );
      return results;
    } catch (err) {
      throw err;
    }
  });
exports.uploadMultipleImages = uploadMultipleImages;
const deleteMultipleImages = (publicIds) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield cloudinary_1.default.api.delete_resources(publicIds);
    } catch (err) {
      throw err;
    }
  });
exports.deleteMultipleImages = deleteMultipleImages;
