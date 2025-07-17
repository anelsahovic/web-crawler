import type { UrlStatus } from '@/types';
import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: Error) {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data.error;
    if (backendMessage) {
      return backendMessage;
    } else {
      return 'An unexpected error occurred.';
    }
  } else {
    return 'Something went wrong. Try again later.';
  }
}

export function getUrlStatusColor(status: UrlStatus) {
  switch (status) {
    case 'DONE':
      return 'bg-green-100 text-green-500';
    case 'RUNNING':
      return 'bg-indigo-100 text-indigo-500';
    case 'QUEUED':
      return 'bg-amber-100 text-amber-500';
    case 'ERROR':
      return 'bg-red-100 text-red-500';
    default:
      return 'bg-zinc-100 text-zinc-500';
  }
}
