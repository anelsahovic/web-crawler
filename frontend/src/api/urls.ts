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

export const getUrlById = (urlId: string) => {
  return API.get(`/urls/${urlId}`);
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

// reanalyze url
export const reanalyzeUrl = (urlId: string) => {
  return API.put(`/urls/${urlId}/reanalyze`);
};

// delete url
export const deleteUrl = (urlId: string) => {
  return API.delete(`/urls/${urlId}`);
};

export const bulkDeleteUrls = (urlIds: string[]) => {
  return API.delete('/urls', { data: { urlIds } });
};
