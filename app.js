import express from 'express';
import compression from 'compression';
import corsMiddleware from './middlewares/http/corsMiddleware.js';
import { limiterMiddleware } from './middlewares/http/limiterMiddleware.js';
import loadRoutes from './utils/routesLoader/loadRoutes.js';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';

const app = express();

import helmet from 'helmet';
import hpp from 'hpp';
import statusMonitor from 'express-status-monitor';

app.use(helmet());
app.use(hpp());
app.use(corsMiddleware);

// if (process.env.NODE_ENV === 'production') {
//   app.use('/', limiterMiddleware);
// }

app.use(statusMonitor());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const accessLogStream = fs.createWriteStream(path.join('logs', 'access.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));
const routes = await loadRoutes();
routes.forEach(({ path, router }) => {
  app.use(path, router);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ресурс не найден' });
});

export default app;
