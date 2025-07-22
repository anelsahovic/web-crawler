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
  h4Count: number;
  h5Count: number;
  h6Count: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinksCount: number;
  hasLoginForm: boolean;
  status: UrlStatus;
  createdAt: string;
  updatedAt: string;
  brokenLinks: BrokenLink[];
}

export interface CrawlStatusUpdate {
  id: string;
  status: UrlStatus;
  url: Url;
}

export interface Stats {
  total: number;
  done: number;
  queued: number;
  error: number;
  statusCodes: number[];
}
