const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { bookingLimiter } = require('../middleware/rateLimiter');

router.post('/hold', bookingLimiter, optionalAuth, bookingController.holdSlot);
router.post('/confirm', optionalAuth, bookingController.verifyPaymentAndConfirm);
router.get('/my', requireAuth, bookingController.getMyBookings);
router.get('/:id', optionalAuth, bookingController.getBookingById);
router.post('/:id/cancel', requireAuth, bookingController.cancelCustomerBooking);

module.exports = router;
