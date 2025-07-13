import { z } from 'zod';

export const CrawlUrlSchema = z.object({
  rawUrl: z.url(),
});

export type CrawlUrlBody = z.infer<typeof CrawlUrlSchema>;
