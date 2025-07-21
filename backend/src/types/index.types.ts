export interface ShowUrlParams {
  urlId: string;
}
export interface DeleteUrlParams {
  urlId: string;
}
export interface BulkDeleteUrlBody {
  urlIds: string[];
}

export interface CrawlSelectedUrlsBody {
  urlIds: string[];
}

export interface ReanalyzeUrlParams {
  urlId: string;
}
