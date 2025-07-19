// hooks/useCrawlUpdates.ts
import { socket } from '@/lib/socket';
import type { CrawlStatusUpdate } from '@/types';
import { useEffect } from 'react';

export function useCrawlUpdates(onUpdate: (data: CrawlStatusUpdate) => void) {
  useEffect(() => {
    socket.on('urlStatusUpdate', onUpdate);
    return () => {
      socket.off('urlStatusUpdate', onUpdate);
    };
  }, [onUpdate]);
}
