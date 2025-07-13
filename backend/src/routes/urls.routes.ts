import express from 'express';
import * as UrlsController from '../controllers/urls.controller';

const router = express.Router();

// get all urls from database
router.get('/', UrlsController.index);

// Submit a URL for immediate crawling
router.post('/', UrlsController.store);

export default router;
