"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    port: process.env.PORT,
    database_URL: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expiration: process.env.JWT_EXPIRATION,
    node_env: process.env.NODE_ENV,
    client_url: process.env.CLIENT_URL,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_mail: process.env.SMTP_MAIL,
    smtp_password: process.env.SMTP_PASSWORD,
    smtp_service: process.env.SMTP_SERVICE,
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    },
};
