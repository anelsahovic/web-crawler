import { RequestHandler } from 'express';
import { analyzeAndSaveUrl, getUrls } from '../services/urls.service';
import createHttpError from 'http-errors';
import { CrawlUrlBody, CrawlUrlSchema } from '../zodSchemas/urls.schemas';
import z from 'zod';

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

export const store: RequestHandler<
  unknown,
  unknown,
  CrawlUrlBody,
  unknown
> = async (req, res, next) => {
  const body = req.body;

  // validate the rawUrl before passed to service
  const parsed = CrawlUrlSchema.safeParse(body);
  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    const firstRawUrlError = tree.properties?.rawUrl?.errors?.[0];
    throw createHttpError(400, firstRawUrlError || 'Invalid input');
  }

  try {
    const crawledUrl = await analyzeAndSaveUrl(body);

    res.status(201).json(crawledUrl);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
