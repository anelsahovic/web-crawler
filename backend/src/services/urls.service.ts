import { PrismaClient, Url, UrlStatus } from '@prisma/client';
import { CrawlUrlBody } from '../zodSchemas/urls.schemas';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL as NodeURL } from 'url';
import createHttpError from 'http-errors';
import { emitCrawlStatus } from '../socket';
import { compareAsc } from 'date-fns';
export const prisma = new PrismaClient();

export async function getUrls(
  limit: number,
  skip: number,
  page: number,
  search: string
) {
  const [urls, total] = await Promise.all([
    prisma.url.findMany({
      where: {
        OR: [{ title: { contains: search } }, { url: { contains: search } }],
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.url.count({
      where: {
        OR: [{ title: { contains: search } }, { url: { contains: search } }],
      },
    }),
  ]);
  return {
    urls,
    totalUrls: total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getQueuedUrls() {
  return await prisma.url.findMany({
    where: {
      status: { in: ['QUEUED', 'ERROR'] },
    },
    orderBy: {
      updatedAt: 'asc',
    },
  });
}

export async function getUrlsStats() {
  const [total, done, queued, error, brokenLinks] = await Promise.all([
    prisma.url.count(),
    prisma.url.count({ where: { status: 'DONE' } }),
    prisma.url.count({ where: { status: 'QUEUED' } }),
    prisma.url.count({ where: { status: 'ERROR' } }),
    prisma.url.findMany({
      select: { brokenLinks: { select: { statusCode: true } } },
    }),
  ]);
  // Flatten the status codes
  const statusCodes = brokenLinks.flatMap((url) =>
    url.brokenLinks.map((link) => link.statusCode)
  );

  return { total, done, queued, error, statusCodes };
}

export async function getUrlById(id: string) {
  return await prisma.url.findUnique({
    where: { id },
    include: {
      brokenLinks: true,
    },
  });
}

export async function addToTheQueue(body: CrawlUrlBody) {
  return await prisma.url.create({
    data: {
      url: body.rawUrl,
      status: 'QUEUED',
    },
  });
}

export async function crawlQueuedUrls() {
  const queuedUrls = await prisma.url.findMany({
    where: { status: 'QUEUED' },
  });

  if (!queuedUrls.length) {
    throw createHttpError(404, 'No queued URLs found.');
  }

  return bulkCrawlUrls(queuedUrls);
}

export async function crawlSelectedUrls(urlIds: string[]) {
  const selectedUrls = await prisma.url.findMany({
    where: { id: { in: urlIds } },
  });

  if (!selectedUrls.length) {
    throw createHttpError(404, 'No selected URLs found.');
  }

  await prisma.url.updateMany({
    where: { id: { in: urlIds } },
    data: { status: 'QUEUED' },
  });

  return bulkCrawlUrls(selectedUrls);
}

export async function analyzeAndSaveUrl(body: CrawlUrlBody) {
  let pageData;
  try {
    pageData = await analyzeUrl(body.rawUrl);
  } catch (error) {
    console.error(error);
    throw createHttpError(500, 'Failed to crawl URL.');
  }

  if (!pageData) throw createHttpError(404, 'No crawled data found.');

  // Save to DB
  const savedUrl = await prisma.url.create({
    data: {
      url: pageData.url,
      htmlVersion: pageData.htmlVersion,
      title: pageData.title,
      h1Count: pageData.h1Count,
      h2Count: pageData.h2Count,
      h3Count: pageData.h3Count,
      h4Count: pageData.h4Count,
      h5Count: pageData.h5Count,
      h6Count: pageData.h6Count,
      internalLinks: pageData.internalLinks,
      externalLinks: pageData.externalLinks,
      brokenLinksCount: pageData.brokenLinks.length,
      hasLoginForm: pageData.hasLoginForm,
      status: 'DONE',
      brokenLinks: {
        createMany: {
          data: pageData.brokenLinks,
        },
      },
    },
    include: {
      brokenLinks: true,
    },
  });

  return savedUrl;
}

export async function reanalyzeAndUpdateUrl(urlId: string) {
  const foundUrl = await prisma.url.findUnique({ where: { id: urlId } });

  if (!foundUrl) throw createHttpError(404, 'No URL found.');

  let newCrawledData;
  try {
    newCrawledData = await analyzeUrl(foundUrl.url);
  } catch (error) {
    console.error(error);
    throw createHttpError(500, 'Failed to reanalyze URL.');
  }

  if (!newCrawledData) throw createHttpError(404, 'No crawled data found.');

  return await prisma.url.update({
    where: { id: urlId },
    data: {
      htmlVersion: newCrawledData.htmlVersion,
      title: newCrawledData.title,
      h1Count: newCrawledData.h1Count,
      h2Count: newCrawledData.h2Count,
      h3Count: newCrawledData.h3Count,
      h4Count: newCrawledData.h4Count,
      h5Count: newCrawledData.h5Count,
      h6Count: newCrawledData.h6Count,
      internalLinks: newCrawledData.internalLinks,
      externalLinks: newCrawledData.externalLinks,
      brokenLinksCount: newCrawledData.brokenLinksCount,
      hasLoginForm: newCrawledData.hasLoginForm,
      brokenLinks: {
        deleteMany: {},
        createMany: {
          data: newCrawledData.brokenLinks,
        },
      },
    },
    include: {
      brokenLinks: true,
    },
  });
}

export async function deleteUrl(id: string) {
  const url = await prisma.url.findUnique({ where: { id } });

  if (!url) throw createHttpError(404, 'Url not found.');

  try {
    await prisma.url.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    throw createHttpError(500, 'Something went wrong while deleting the url.');
  }
}

export async function bulkDeleteUrls(ids: string[]) {
  try {
    await prisma.url.deleteMany({ where: { id: { in: ids } } });
  } catch (error) {
    console.error(error);
    throw createHttpError(500, 'Something went wrong while deleting the urls.');
  }
}

async function analyzeUrl(rawUrl: string) {
  const { data: html } = await axios.get(rawUrl, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 crawler-bot' },
  });

  const $ = cheerio.load(html);
  const base = new NodeURL(rawUrl);

  // HTML version (basic guess)
  const htmlVersion = $('html').attr('xmlns') ? 'XHTML' : 'HTML5';

  // Page title
  const title = $('title').text().trim();

  // Headings
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;
  const h5Count = $('h5').length;
  const h6Count = $('h6').length;

  // Links
  const links = $('a');
  let internal = 0;
  let external = 0;
  const brokenLinks: { link: string; statusCode: number }[] = [];

  for (let i = 0; i < links.length; i++) {
    const href = $(links[i]).attr('href');
    if (!href || href.startsWith('#')) continue;

    let fullUrl: string;

    try {
      fullUrl = new NodeURL(href, rawUrl).href;
    } catch (error) {
      console.log(error);
      continue;
    }

    const isInternal = new NodeURL(fullUrl).hostname === base.hostname;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isInternal ? internal++ : external++;

    // Check for broken links (status 4xx or 5xx)
    try {
      const response = await axios.get(fullUrl, {
        timeout: 5000,
        validateStatus: () => true,
      });
      if (response.status >= 400) {
        brokenLinks.push({ link: fullUrl, statusCode: response.status });
      }
    } catch {
      brokenLinks.push({ link: fullUrl, statusCode: 0 }); // Network or parsing error
    }
  }

  // Login form detection
  const hasLoginForm = $('form input[type="password"]').length > 0;

  return {
    url: rawUrl,
    htmlVersion,
    title,
    h1Count,
    h2Count,
    h3Count,
    h4Count,
    h5Count,
    h6Count,
    internalLinks: internal,
    externalLinks: external,
    brokenLinksCount: brokenLinks.length,
    hasLoginForm,
    brokenLinks,
  };
}

async function updateUrlStatus(id: string, status: UrlStatus) {
  await prisma.url.update({
    where: { id },
    data: {
      status,
    },
  });
}

export async function bulkCrawlUrls(urls: Url[]) {
  const results: Url[] = [];

  const sortedUrls = urls.sort((a, b) =>
    compareAsc(new Date(a.createdAt), new Date(b.createdAt))
  );

  for (const url of sortedUrls) {
    try {
      await updateUrlStatus(url.id, 'RUNNING');
      emitCrawlStatus({ id: url.id, status: 'RUNNING' });

      const crawled = await analyzeUrl(url.url);

      const updated = await prisma.url.update({
        where: { id: url.id },
        data: {
          status: 'DONE',
          htmlVersion: crawled.htmlVersion,
          title: crawled.title,
          h1Count: crawled.h1Count,
          h2Count: crawled.h2Count,
          h3Count: crawled.h3Count,
          h4Count: crawled.h4Count,
          h5Count: crawled.h5Count,
          h6Count: crawled.h6Count,
          internalLinks: crawled.internalLinks,
          externalLinks: crawled.externalLinks,
          brokenLinksCount: crawled.brokenLinks.length,
          hasLoginForm: crawled.hasLoginForm,
          brokenLinks: {
            deleteMany: {},
            createMany: { data: crawled.brokenLinks },
          },
        },
        include: { brokenLinks: true },
      });

      emitCrawlStatus({ id: url.id, status: 'DONE', url: updated });
      results.push(updated);
    } catch (err) {
      console.error(`Failed to crawl URL: ${url.url}`, err);
      await updateUrlStatus(url.id, 'ERROR');
      emitCrawlStatus({ id: url.id, status: 'ERROR' });
    }
  }

  return results;
}
