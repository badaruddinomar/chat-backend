import { getMessages, sendMessages } from '@/controllers/messaage.controllers';
import { isAuthenticatedUser } from '@/middleware/authGuard';
import express from 'express';
const router = express.Router();

router.get('/all/:id', isAuthenticatedUser, getMessages);
router.post('/send/:id', isAuthenticatedUser, sendMessages);

export default router;
