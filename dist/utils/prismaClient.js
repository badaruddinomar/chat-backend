'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.prisma = void 0;
const client_1 = require('@prisma/client');
let prisma;
// Ensure only one instance of PrismaClient is created (Singleton Pattern)
if (process.env.NODE_ENV === 'production') {
  exports.prisma = prisma = new client_1.PrismaClient();
} else {
  // For development, re-use Prisma Client to prevent new instances on every hot reload
  if (!global.prisma) {
    global.prisma = new client_1.PrismaClient();
  }
  exports.prisma = prisma = global.prisma;
}
