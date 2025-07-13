import { PrismaClient } from '@prisma/client';
import { CrawlUrlBody } from '../zodSchemas/urls.schemas';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL as NodeURL } from 'url';

const prisma = new PrismaClient();

export async function getUrls() {
  return await prisma.url.findMany();
}

export async function analyzeAndSaveUrl(body: CrawlUrlBody) {
  const { data: html } = await axios.get(body.rawUrl, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 crawler-bot' },
  });

  const $ = cheerio.load(html);
  const base = new NodeURL(body.rawUrl);

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
      fullUrl = new NodeURL(href, body.rawUrl).href;
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

  // Save to DB
  const savedUrl = await prisma.url.create({
    data: {
      url: body.rawUrl,
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
      brokenLinks: {
        createMany: {
          data: brokenLinks,
        },
      },
    },
    include: {
      brokenLinks: true,
    },
  });

  return savedUrl;
}
