import express from 'express';
import * as UrlsController from '../controllers/urls.controller';

const router = express.Router();

// get all urls from database
router.get('/', UrlsController.index);

// get single url with id
router.get('/:urlId', UrlsController.show);

// submit a URL for immediate crawling
router.post('/', UrlsController.store);

// add url to the queue
router.post('/queue', UrlsController.queue);

// start crawling the queued urls
router.put('/crawl-queued', UrlsController.crawlQueued);

// recrawl and update the url
router.put('/:urlId/reanalyze', UrlsController.reanalyze);

// delete url from database
router.delete('/:urlId', UrlsController.destroy);

export default router;
