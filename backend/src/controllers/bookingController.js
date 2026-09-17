const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const bookingService = require('../services/bookingService');
const { sendSuccess, sendError } = require('../utils/response');

const holdSlot = async (req, res, next) => {
  try {
    const { date, startTime, durationHours, duration, customerDetails, sport } = req.body;

    let turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      return sendError(res, 'Turf not configured', 404);
    }

    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      return sendError(res, 'Please provide customer name, email, and phone number', 400);
    }

    const holdResult = await bookingService.holdSlot({
      turfId: turf._id,
      date,
      startTime,
      durationHours: durationHours || (duration ? Math.round(duration / 60) : 1),
      customerDetails,
      sport,
      userId: req.user ? req.user._id : null,
    });

    return sendSuccess(res, holdResult, 'Slot(s) held successfully. Please complete payment within 10 minutes.', 201);
  } catch (error) {
    next(error);
  }
};

const verifyPaymentAndConfirm = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId) {
      return sendError(res, 'razorpayOrderId is required', 400);
    }

    const booking = await bookingService.confirmBooking({
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'mock_sig_verified',
    });

    return sendSuccess(
      res,
      {
        booking,
        message: 'Payment verified and booking confirmed!',
      },
      'Booking Confirmed'
    );
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by bookingId (TB-xxx) or MongoDB _id
    const query = id.startsWith('TB-') ? { bookingId: id } : { _id: id };
    const booking = await Booking.findOne(query).populate('turfId');

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    return sendSuccess(res, { booking }, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user._id;

    const bookings = await Booking.find({
      $or: [{ userId }, { 'customerDetails.email': userEmail }],
      bookingStatus: { $ne: 'EXPIRED' },
    })
      .populate('turfId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { bookings }, 'My bookings retrieved');
  } catch (error) {
    next(error);
  }
};

const cancelCustomerBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await bookingService.cancelBooking(id, req.user, reason);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  holdSlot,
  verifyPaymentAndConfirm,
  getBookingById,
  getMyBookings,
  cancelCustomerBooking,
};
