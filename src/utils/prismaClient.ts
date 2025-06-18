import { PrismaClient } from '@prisma/client';
// Extend globalThis with prisma property
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;
// Ensure only one instance of PrismaClient is created (Singleton Pattern)
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // For development, re-use Prisma Client to prevent new instances on every hot reload
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
