"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const notFound_1 = __importDefault(require("@/middleware/notFound"));
const globarErrorHandler_1 = __importDefault(require("@/middleware/globarErrorHandler"));
const auth_routes_1 = __importDefault(require("@/routes/auth.routes"));
const user_routes_1 = __importDefault(require("@/routes/user.routes"));
const message_routes_1 = __importDefault(require("@/routes/message.routes"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const apiLimiter_1 = require("@/middleware/apiLimiter");
const schedulers_1 = require("@/schedulers");
const config_1 = __importDefault(require("@/config"));
const socket_1 = require("@/utils/socket");
const authGuard_1 = require("@/middleware/authGuard");
const corsOptions = {
    origin: config_1.default.client_url,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
// middleware--
socket_1.app.use(express_1.default.json());
socket_1.app.use((0, cors_1.default)(corsOptions));
socket_1.app.use((0, helmet_1.default)());
socket_1.app.use((0, compression_1.default)());
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use((0, express_fileupload_1.default)({ useTempFiles: true, tempFileDir: '/tmp/' }));
socket_1.app.set('trust proxy', 1);
socket_1.app.use((0, apiLimiter_1.apiLimiter)(100, 15 * 60 * 1000)); // 100 requests per 15 minutes
socket_1.app.use((0, morgan_1.default)('dev'));
(0, schedulers_1.startSchedulers)();
socket_1.io.use(authGuard_1.authenticateSocket);
// handling uncaught exceptions--
process.on('uncaughtException', (err) => {
    console.log(`error: ${err.message}`);
    console.log(`Uncaught exception: ${err.stack}`);
    process.exit(1);
});
// routes--
socket_1.app.get('/', (_req, res) => {
    res.send('Hello World!');
});
socket_1.app.use('/api/v1/auth', auth_routes_1.default);
socket_1.app.use('/api/v1/users', user_routes_1.default);
socket_1.app.use('/api/v1/messages', message_routes_1.default);
// not found middleware
socket_1.app.use(notFound_1.default);
socket_1.app.use(globarErrorHandler_1.default);
// server--
socket_1.server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});
// unhandled promise rejection--
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err}`);
    console.log(`Shuting down the server due to unhandled promise rejection!`);
    socket_1.server.close(() => {
        process.exit(1);
    });
});
