"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("@/config"));
const globalErrorHandler = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    err.message = err.message || 'Internal server error';
    // wrong mongodb id error--
    if (err.name === 'CastError') {
        const message = `Resource not found: ${err.path}`;
        err.statusCode = http_status_1.default.BAD_REQUEST;
        err.message = message;
    }
    // mongoose duplicate key errors--
    if (err.code === 11000) {
        const message = `Duplicate "${Object.keys(err.keyValue)}" entered`;
        err.statusCode = http_status_1.default.BAD_REQUEST;
        err.message = message;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        const message = `Validation error: ${messages.join('. ')}`;
        err.statusCode = http_status_1.default.BAD_REQUEST;
        err.message = message;
    }
    // wrong jwt error--
    if (err.name === 'JsonWebTokenError') {
        const message = `json web token is invalid try again`;
        err.statusCode = http_status_1.default.BAD_REQUEST;
        err.message = message;
    }
    // jwt expires error--
    if (err.name === 'TokenExpiredError') {
        const message = 'Json web token expired';
        err.statusCode = http_status_1.default.BAD_REQUEST;
        err.message = message;
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: config_1.default.node_env === 'development' ? err.stack : null,
    });
};
exports.default = globalErrorHandler;
