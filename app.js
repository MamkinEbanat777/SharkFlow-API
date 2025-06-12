import express from 'express';
import corsMiddleware from './middlewares/http/corsMiddleware.js';
import loadRoutes from './utils/loadRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());

const routes = await loadRoutes();
routes.forEach(({ path, router }) => {
  app.use(path, router);
  //   console.log(`Mounted ${path}`);
});

export default app;
