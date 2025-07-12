import { RequestHandler } from 'express';
import { getUrls } from '../services/urls.service';
import createHttpError from 'http-errors';

export const index: RequestHandler = async (req, res, next) => {
  try {
    const urls = await getUrls();

    if (!urls || !urls.length) {
      throw createHttpError(404, 'No urls found.');
    }

    res.status(200).json(urls);
  } catch (error) {
    next(error);
  }
};
