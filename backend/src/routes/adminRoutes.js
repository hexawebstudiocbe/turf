const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Guard all admin routes with authentication and admin role check
router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/bookings', adminController.getAdminBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

router.get('/slots', adminController.getAdminSlots);
router.post('/slots/block', adminController.blockSlot);
router.delete('/slots/block/:id', adminController.unblockSlot);

router.get('/pricing', adminController.getPricingConfig);
router.put('/pricing', adminController.updatePricingConfig);

router.put('/turf', adminController.updateTurf);

router.get('/customers', adminController.getCustomers);
router.get('/payments', adminController.getPayments);

module.exports = router;
