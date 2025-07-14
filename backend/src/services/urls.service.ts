import { PrismaClient } from '@prisma/client';
import { CrawlUrlBody } from '../zodSchemas/urls.schemas';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL as NodeURL } from 'url';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();

export async function getUrls() {
  return await prisma.url.findMany();
}

export async function getUrlById(id: string) {
  return await prisma.url.findUnique({
    where: { id },
    include: {
      brokenLinks: true,
    },
  });
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
