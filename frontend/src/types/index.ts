export type UrlStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'ERROR';

export interface BrokenLink {
  id: number;
  link: string;
  statusCode: number;
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

export interface CrawlStatusUpdate {
  id: string;
  status: UrlStatus;
}
