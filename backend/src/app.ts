import express, { NextFunction, Request, Response } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import cors from 'cors';
import urlsRoutes from './routes/urls.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/urls', urlsRoutes);

app.get('/', (req, res) => {
  console.log('✅ Received GET / request');

  res.send('Project is running!');
});

app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint Not Found!'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = 'An unknown error occurred';
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
