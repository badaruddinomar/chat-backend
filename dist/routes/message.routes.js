"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messaage_controllers_1 = require("@/controllers/messaage.controllers");
const authGuard_1 = require("@/middleware/authGuard");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/all/:id', authGuard_1.isAuthenticatedUser, messaage_controllers_1.getMessages);
router.post('/send/:id', authGuard_1.isAuthenticatedUser, messaage_controllers_1.sendMessages);
exports.default = router;
