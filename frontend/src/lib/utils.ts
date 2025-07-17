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
