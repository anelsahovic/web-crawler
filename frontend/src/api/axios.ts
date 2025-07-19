import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_SECRET_TOKEN}`,
  },
});
