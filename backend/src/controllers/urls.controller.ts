import { RequestHandler } from 'express';
import {
  addToTheQueue,
  analyzeAndSaveUrl,
  bulkDeleteUrls,
  crawlQueuedUrls,
  crawlSelectedUrls,
  deleteUrl,
  getQueuedUrls,
  getUrlById,
  getUrls,
  getUrlsStats,
  reanalyzeAndUpdateUrl,
} from '../services/urls.service';
import createHttpError from 'http-errors';
import { CrawlUrlBody, CrawlUrlSchema } from '../zodSchemas/urls.schemas';
import z from 'zod';
import {
  BulkDeleteUrlBody,
  CrawlSelectedUrlsBody,
  DeleteUrlParams,
  ReanalyzeUrlParams,
  ShowUrlParams,
} from '../types/index.types';
import { UrlStatus } from '@prisma/client';

export const index: RequestHandler = async (req, res, next) => {
  const search = (req.query.search as string) || '';
  const status = (req.query.status as UrlStatus) || 'ALL';
  const sortBy = (req.query.sortBy as string) || 'createdAtDesc';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const skip = (page - 1) * limit;
  try {
    const urls = await getUrls(limit, skip, page, search, sortBy, status);

    if (!urls) {
      throw createHttpError(404, 'No urls found.');
    }

    res.status(200).json(urls);
  } catch (error) {
    next(error);
  }
};

export const getQueued: RequestHandler = async (req, res, next) => {
  try {
    const urls = await getQueuedUrls();

    if (!urls || !urls.length) {
      throw createHttpError(404, 'No queued urls found.');
    }

    res.status(200).json(urls);
  } catch (error) {
    next(error);
  }
};

export const show: RequestHandler<
  ShowUrlParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { urlId } = req.params;

  try {
    if (!urlId) throw createHttpError(400, 'Please provide url ID.');

    const url = await getUrlById(urlId);

    if (!url) throw createHttpError(404, 'No url found.');

    res.status(200).json(url);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const stats: RequestHandler = async (req, res, next) => {
  try {
    const stats = await getUrlsStats();

    if (!stats) {
      throw createHttpError(404, 'No stats for urls found.');
    }

    res.status(200).json(stats);
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

  try {
    // validate the rawUrl before passed to service
    const parsed = CrawlUrlSchema.safeParse(body);
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error);
      const firstRawUrlError = tree.properties?.rawUrl?.errors?.[0];
      throw createHttpError(400, firstRawUrlError || 'Invalid input');
    }

    const crawledUrl = await analyzeAndSaveUrl(body);

    res.status(201).json(crawledUrl);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const queue: RequestHandler<
  unknown,
  unknown,
  CrawlUrlBody,
  unknown
> = async (req, res, next) => {
  const body = req.body;
  try {
    // validate the rawUrl before passed to service
    const parsed = CrawlUrlSchema.safeParse(body);
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error);
      const firstRawUrlError = tree.properties?.rawUrl?.errors?.[0];
      throw createHttpError(400, firstRawUrlError || 'Invalid input');
    }

    const queuedUrl = await addToTheQueue(parsed.data);

    if (!queuedUrl)
      throw createHttpError(400, "Couldn't add the url to the queue.");

    res.status(201).json({
      message: 'URL successfully added to the queue',
      data: queuedUrl,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const crawlQueued: RequestHandler = async (req, res, next) => {
  try {
    const result = await crawlQueuedUrls();

    res.status(200).json({ message: 'Crawling completed.', result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const crawlSelected: RequestHandler<
  unknown,
  unknown,
  CrawlSelectedUrlsBody,
  unknown
> = async (req, res, next) => {
  const { urlIds } = req.body;
  try {
    if (!urlIds || urlIds.length === 0)
      throw createHttpError(400, 'Please provide at least one URL ID.');

    const result = await crawlSelectedUrls(urlIds);

    res.status(200).json({ message: 'Crawling completed.', result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const reanalyze: RequestHandler<
  ReanalyzeUrlParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { urlId } = req.params;

  try {
    if (!urlId) throw createHttpError(400, 'Please provide url to reanalyze.');

    const reanalyzedUrl = await reanalyzeAndUpdateUrl(urlId);

    if (!reanalyzedUrl) throw createHttpError(404, 'No crawled data found.');

    res.status(200).json(reanalyzedUrl);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const destroy: RequestHandler<
  DeleteUrlParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { urlId } = req.params;

  try {
    if (!urlId) throw createHttpError(400, 'Please provide url ID.');

    await deleteUrl(urlId);

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const destroyAll: RequestHandler<
  unknown,
  unknown,
  BulkDeleteUrlBody,
  unknown
> = async (req, res, next) => {
  const { urlIds } = req.body;
  try {
    if (!urlIds || urlIds.length === 0)
      throw createHttpError(400, 'Please provide url ID.');

    await bulkDeleteUrls(urlIds);

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
