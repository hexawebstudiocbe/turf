const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/verify', optionalAuth, bookingController.verifyPaymentAndConfirm);

module.exports = router;
