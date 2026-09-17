const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', turfController.getTurf);
router.get('/reviews', turfController.getReviews);
router.post('/reviews', optionalAuth, turfController.createReview);

module.exports = router;
