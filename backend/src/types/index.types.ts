import { BrokenLink, UrlStatus } from '@prisma/client';

export interface ShowUrlParams {
  urlId: string;
}
export interface DeleteUrlParams {
  urlId: string;
}
export interface BulkDeleteUrlBody {
  urlIds: string[];
}

export interface CrawlSelectedUrlsBody {
  urlIds: string[];
}

export interface ReanalyzeUrlParams {
  urlId: string;
}

export interface Url {
  id: string;
  url: string;
  htmlVersion: string;
  title: string;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinksCount: number;
  hasLoginForm: boolean;
  status: UrlStatus;
  createdAt: string;
  brokenLinks: BrokenLink[];
}
