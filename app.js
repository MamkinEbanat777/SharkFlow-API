import express from 'express';
import compression from 'compression';
import corsMiddleware from './middlewares/http/corsMiddleware.js';
import loadRoutes from './utils/loadRoutes.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app = express();

app.use(compression());
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const routes = await loadRoutes();
routes.forEach(({ path, router }) => {
  app.use(path, router);
});

export default app;
