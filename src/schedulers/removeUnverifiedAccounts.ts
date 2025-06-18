import cron from 'node-cron';
import { prisma } from '../utils/prismaClient';

export const removeUnverifiedAccounts = () => {
  cron.schedule('*/30 * * * *', async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await prisma.user.deleteMany({
      where: {
        isVerified: false,
        createdAt: { lt: thirtyMinutesAgo },
      },
    });
  });
};
