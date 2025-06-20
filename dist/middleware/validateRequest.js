'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const http_status_1 = __importDefault(require('http-status'));
const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((error) => {
      return `${error.path.join('.')}: ${error.message}`;
    });
    res.status(http_status_1.default.BAD_REQUEST).json({
      success: false,
      message: formattedErrors.join(', '),
    });
    return;
  }
  req.body = result.data;
  next();
};
exports.default = validateRequest;
