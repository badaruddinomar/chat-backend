import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import notFound from '@/middleware/notFound';
import globalErrorHandler from '@/middleware/globarErrorHandler';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import messageRoutes from '@/routes/message.routes';
import fileUpload from 'express-fileupload';
import { apiLimiter } from '@/middleware/apiLimiter';
import { startSchedulers } from '@/schedulers';
import config from '@/config';
import { io, app, server } from '@/utils/socket';
import { authenticateSocket } from '@/middleware/authGuard';

const corsOptions = {
  origin: config.client_url,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
// middleware--
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.set('trust proxy', 1);
app.use(apiLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes
app.use(morgan('dev'));
startSchedulers();
io.use(authenticateSocket);

// handling uncaught exceptions--
process.on('uncaughtException', (err) => {
  console.log(`error: ${err.message}`);
  console.log(`Uncaught exception: ${err.stack}`);
  process.exit(1);
});

// routes--
app.get('/', (_req, res) => {
  res.send('Hello World!');
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);
// not found middleware
app.use(notFound);
app.use(globalErrorHandler);
// server--
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

// unhandled promise rejection--
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err}`);
  console.log(`Shuting down the server due to unhandled promise rejection!`);

  server.close(() => {
    process.exit(1);
  });
});
