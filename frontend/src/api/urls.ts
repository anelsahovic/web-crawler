import { API } from './axios';

export const getQueuedUrls = () => {
  return API.get('/urls/queued');
};
