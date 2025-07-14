import { RequestHandler } from 'express';
import {
  analyzeAndSaveUrl,
  deleteUrl,
  getUrlById,
  getUrls,
  reanalyzeAndUpdateUrl,
} from '../services/urls.service';
import createHttpError from 'http-errors';
import { CrawlUrlBody, CrawlUrlSchema } from '../zodSchemas/urls.schemas';
import z from 'zod';
import {
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
