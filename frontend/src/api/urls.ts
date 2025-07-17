import type { CrawlUrlBody } from '@/zodSchemas/schemas';
import { API } from './axios';

// fetch all urls
export const getAllUrls = () => {
  return API.get('/urls');
};

// fetch queued urls
export const getQueuedUrls = () => {
  return API.get('/urls/queued');
};

// add url to the queue
export const addUrlToQueue = (values: CrawlUrlBody) => {
  return API.post(`/urls/queue`, values);
};

// crawl url now
export const crawlUrl = (values: CrawlUrlBody) => {
  return API.post(`/urls`, values);
};

// delete url
export const deleteUrl = (urlId: string) => {
  return API.delete(`/urls/${urlId}`);
};
