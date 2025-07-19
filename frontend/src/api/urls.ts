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

// crawl all queued urls
export const crawQueuedUrls = () => {
  return API.put('/urls/crawl-queued');
};

// crawl selected urls
export const crawSelectedUrls = (urlIds: string[]) => {
  return API.put('/urls/crawl-selected', { urlIds });
};

// delete url
export const deleteUrl = (urlId: string) => {
  return API.delete(`/urls/${urlId}`);
};

export const bulkDeleteUrls = (urlIds: string[]) => {
  return API.delete('/urls', { data: { urlIds } });
};
