const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const BlockedSlot = require('../models/BlockedSlot');
const Payment = require('../models/Payment');
const { calculateMultiHourPrice } = require('./pricingService');
const { cleanupExpiredHolds } = require('./slotService');
const {
  isDateInPast,
  isSlotInPast,
  getConsecutiveSlotIntervals,
  doTimeIntervalsOverlap,
  timeToMinutes,
} = require('../utils/timeHelper');
const { createOrder, verifyPaymentSignature } = require('../config/razorpay');
const { generateBookingQRToken } = require('../utils/qrHelper');

/**
 * Generates human-friendly unique booking ID
 */
const generateBookingId = (dateStr) => {
  const cleanDate = dateStr.replace(/-/g, '');
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `TB-${cleanDate}-${randomSuffix}`;
};

/**
 * Initiates a temporary hold on multi-hour consecutive slots and creates a Razorpay order
 */
const holdSlot = async ({
  turfId,
  date,
  startTime,
  durationHours = 1,
  customerDetails,
  sport,
  userId = null,
}) => {
  if (!turfId || !date || !startTime || !customerDetails) {
    const error = new Error('Missing required booking details');
    error.statusCode = 400;
    throw error;
  }

  const turf = await Turf.findById(turfId);
  if (!turf) {
    const error = new Error('Turf not found');
    error.statusCode = 404;
    throw error;
  }

  const hoursToBook = Math.max(1, Number(durationHours) || 1);

  // 1. Validate past dates & slots
  if (isDateInPast(date)) {
    const error = new Error('Cannot book slots for past dates');
    error.statusCode = 400;
    throw error;
  }

  if (isSlotInPast(date, startTime)) {
    const error = new Error('This time slot has already passed for today');
    error.statusCode = 400;
    throw error;
  }

  // 2. Generate all consecutive underlying intervals
  const { intervals, slotTimes, endTime } = getConsecutiveSlotIntervals(
    startTime,
    hoursToBook,
    turf.slotDuration || 60
  );

  // Validate that requested duration does not exceed turf closing time
  const closingMins = timeToMinutes(turf.closingTime || '23:00');
  const endMins = timeToMinutes(endTime);
  if (endMins > closingMins) {
    const error = new Error(
      `Requested duration exceeds turf closing time (${turf.closingTime || '23:00'})`
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Clean up any expired holds for this date
  await cleanupExpiredHolds(turfId, date);

  // 4. Check if ANY underlying interval is blocked by admin
  const blockedSlots = await BlockedSlot.find({ turfId, date });
  for (const interval of intervals) {
    const isBlocked = blockedSlots.find((b) =>
      doTimeIntervalsOverlap(interval.startTime, interval.endTime, b.startTime, b.endTime)
    );
    if (isBlocked) {
      const error = new Error(
        `Slot ${interval.startTime}–${interval.endTime} is currently blocked for ${isBlocked.reason}`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // 5. Check for existing active bookings overlapping ANY requested underlying slot
  const activeBookings = await Booking.find({
    turfId,
    date,
    bookingStatus: { $in: ['HELD', 'CONFIRMED', 'COMPLETED'] },
  });

  for (const interval of intervals) {
    const existingActive = activeBookings.find((b) => {
      if (b.slotTimes && b.slotTimes.length > 0) {
        return b.slotTimes.includes(interval.startTime);
      }
      return doTimeIntervalsOverlap(interval.startTime, interval.endTime, b.startTime, b.endTime);
    });

    if (existingActive) {
      const error = new Error(
        existingActive.bookingStatus === 'HELD'
          ? `Slot ${interval.startTime}–${interval.endTime} is currently being held by another customer. Please choose another duration or start time.`
          : `Slot ${interval.startTime}–${interval.endTime} is already booked.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // 6. Calculate verified multi-hour price on the server
  const pricing = await calculateMultiHourPrice(turfId, date, startTime, hoursToBook);

  // 7. Generate booking reference and hold expiration (10 minutes)
  const bookingId = generateBookingId(date);
  const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 8. Create Razorpay order
  const razorpayOrder = await createOrder({
    amount: pricing.advanceAmount,
    receipt: bookingId,
    notes: {
      bookingId,
      turfId: turfId.toString(),
      date,
      startTime,
      endTime,
      durationHours: hoursToBook,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
    },
  });

  // 9. Create single HELD booking in MongoDB covering entire multi-hour period
  // Database compound unique partial index on { turfId: 1, date: 1, slotTimes: 1 } ensures absolute race-condition safety
  const booking = new Booking({
    bookingId,
    userId: userId || undefined,
    turfId,
    customerDetails,
    sport: sport || 'Football (5v5)',
    date,
    startTime,
    endTime,
    durationHours: hoursToBook,
    duration: hoursToBook * (turf.slotDuration || 60),
    slotTimes,
    slotBreakdown: pricing.slotBreakdown,
    totalAmount: pricing.totalAmount,
    advanceAmount: pricing.advanceAmount,
    remainingAmount: pricing.remainingAmount,
    bookingStatus: 'HELD',
    paymentStatus: 'PENDING',
    razorpayOrderId: razorpayOrder.id,
    holdExpiresAt,
  });

  await booking.save();

  return {
    bookingId: booking.bookingId,
    orderId: razorpayOrder.id,
    currency: 'INR',
    startTime,
    endTime,
    durationHours: hoursToBook,
    slotTimes,
    slotBreakdown: pricing.slotBreakdown,
    totalAmount: pricing.totalAmount,
    advanceAmount: pricing.advanceAmount,
    remainingAmount: pricing.remainingAmount,
    holdExpiresAt,
    isMockPayment: razorpayOrder.isMock || false,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    customerDetails,
  };
};

/**
 * Verifies Razorpay payment and confirms booking (Idempotent)
 */
const confirmBooking = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId) {
    const error = new Error('Razorpay Order ID is required');
    error.statusCode = 400;
    throw error;
  }

  // 1. Find booking associated with order
  const booking = await Booking.findOne({ razorpayOrderId }).populate('turfId');
  if (!booking) {
    const error = new Error('Booking not found for this payment order');
    error.statusCode = 404;
    throw error;
  }

  // 2. IDEMPOTENCY: If already confirmed, return current booking state
  if (booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'COMPLETED') {
    return booking;
  }

  // 3. Verify signature
  const isValidSignature = verifyPaymentSignature({
    order_id: razorpayOrderId,
    payment_id: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValidSignature) {
    booking.bookingStatus = 'PAYMENT_FAILED';
    booking.paymentStatus = 'FAILED';
    await booking.save();

    const error = new Error('Invalid payment signature. Payment verification failed.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Generate QR verification token
  const qrToken = generateBookingQRToken(
    booking.bookingId,
    booking.turfId._id,
    booking.date,
    booking.startTime
  );

  // 5. Update booking to CONFIRMED
  booking.bookingStatus = 'CONFIRMED';
  booking.paymentStatus = 'SUCCESS';
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.qrVerificationToken = qrToken;
  await booking.save();

  // 6. Record Payment Audit Trail
  await Payment.create({
    bookingId: booking._id,
    userId: booking.userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount: booking.advanceAmount,
    status: 'SUCCESS',
  });

  return booking;
};

/**
 * Cancels a booking according to turf cancellation policy
 */
const cancelBooking = async (bookingId, user, reason = 'Customer requested cancellation') => {
  const booking = await Booking.findOne({ bookingId }).populate('turfId');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check (admin or owner)
  if (user.role !== 'ADMIN' && (!booking.userId || booking.userId.toString() !== user._id.toString())) {
    const error = new Error('Unauthorized to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  if (booking.bookingStatus === 'CANCELLED') {
    const error = new Error('Booking is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  const turf = booking.turfId;
  const policy = turf.cancellationPolicy || { freeCancellationHours: 24, refundPercentage: 100 };

  // Calculate hours until slot
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  const slotDate = new Date(`${booking.date}T00:00:00`);
  slotDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const hoursRemaining = (slotDate - now) / (1000 * 60 * 60);

  let refundAmount = 0;
  let isEligibleForRefund = false;

  if (user.role === 'ADMIN') {
    refundAmount = booking.advanceAmount;
    isEligibleForRefund = true;
  } else if (hoursRemaining >= policy.freeCancellationHours) {
    refundAmount = Math.round((booking.advanceAmount * (policy.refundPercentage || 100)) / 100);
    isEligibleForRefund = true;
  }

  booking.bookingStatus = 'CANCELLED';
  booking.paymentStatus = refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus;
  booking.cancellationDetails = {
    cancelledAt: new Date(),
    cancelledBy: user._id,
    refundAmount,
    reason,
  };

  await booking.save();

  return {
    booking,
    refundAmount,
    isEligibleForRefund,
    message: isEligibleForRefund
      ? `Booking cancelled successfully. Refund of ₹${refundAmount} has been approved.`
      : 'Booking cancelled. As per policy, cancellations under 24 hours are non-refundable.',
  };
};

module.exports = {
  holdSlot,
  confirmBooking,
  cancelBooking,
};
