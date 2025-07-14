import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

export const authorize: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      createHttpError(401, 'Missing or invalid Authorization header.')
    );
  }

  const token = authHeader.split(' ')[1];
  const expectedToken = process.env.AUTH_TOKEN;

  if (token !== expectedToken) {
    return next(createHttpError(403, 'Invalid token.'));
  }

  next();
};
