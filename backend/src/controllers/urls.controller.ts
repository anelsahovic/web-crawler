import { RequestHandler } from 'express';
import {
  addToTheQueue,
  analyzeAndSaveUrl,
  bulkDeleteUrls,
  crawlQueuedUrls,
  deleteUrl,
  getQueuedUrls,
  getUrlById,
  getUrls,
  reanalyzeAndUpdateUrl,
} from '../services/urls.service';
import createHttpError from 'http-errors';
import { CrawlUrlBody, CrawlUrlSchema } from '../zodSchemas/urls.schemas';
import z from 'zod';
import {
  BulkDeleteUrlBody,
  DeleteUrlParams,
  ReanalyzeUrlParams,
  ShowUrlParams,
} from '../types/index.types';

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
    const result = await crawlQueuedUrls(); // one clear entry point

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
