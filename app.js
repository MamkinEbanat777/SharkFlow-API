import express from 'express';
import compression from 'compression';
import corsMiddleware from './middlewares/http/corsMiddleware.js';
import { limiterMiddleware } from './middlewares/http/limiterMiddleware.js';
import loadRoutes from './utils/routesLoader/loadRoutes.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { logDatabaseError } from './utils/loggers/systemLoggers.js';
import { logInfo } from './utils/loggers/baseLogger.js';


const app = express();

app.use(morgan('combined', {
  stream: {
    write: (message) => logInfo('HTTP', 'request', message.trim())
  }
}));

import helmet from 'helmet';
import hpp from 'hpp';

app.use(helmet());
app.use(hpp());
app.use(corsMiddleware);
// app.options('*', corsMiddleware);

// if (process.env.NODE_ENV === 'production') {
//   app.use('/', limiterMiddleware);
// }

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.set('trust proxy', true);

app.use('/api/auth', limiterMiddleware);
app.use('/api/tasks', limiterMiddleware);
app.use('/api/boards', limiterMiddleware);
app.use('/api/users', limiterMiddleware);

const routes = await loadRoutes();
routes.forEach(({ path, router }) => {
  app.use(path, router);
});

logInfo('System', 'routesLoaded', `Routes loaded: ${routes.length}`);

app.use((err, req, res, next) => {
  logDatabaseError('unhandledError', err);
  const status = err.status || 500;
  return res.status(status).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

app.use((req, res) => {
  return res.status(404).json({ error: 'Ресурс не найден' });
});

export default app;
