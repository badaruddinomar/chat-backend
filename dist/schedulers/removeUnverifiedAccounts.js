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
exports.removeUnverifiedAccounts = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prismaClient_1 = require("../utils/prismaClient");
const removeUnverifiedAccounts = () => {
    node_cron_1.default.schedule('*/30 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        yield prismaClient_1.prisma.user.deleteMany({
            where: {
                isVerified: false,
                createdAt: { lt: thirtyMinutesAgo },
            },
        });
    }));
};
exports.removeUnverifiedAccounts = removeUnverifiedAccounts;
