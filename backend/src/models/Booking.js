const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    turfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: true,
      index: true,
    },
    customerDetails: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      notes: { type: String, default: '', trim: true },
    },
    sport: {
      type: String,
      default: 'Football (5v5)',
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    startTime: {
      type: String, // 'HH:mm' e.g. '18:00'
      required: true,
    },
    endTime: {
      type: String, // 'HH:mm' e.g. '21:00'
      required: true,
    },
    durationHours: {
      type: Number,
      default: 1,
    },
    duration: {
      type: Number,
      default: 60, // in minutes
    },
    // Array of underlying 1-hour slot start times covered by this single booking
    // e.g. ['18:00', '19:00', '20:00'] for a 3-hour match
    slotTimes: {
      type: [String],
      required: true,
      index: true,
    },
    // Detailed server-calculated pricing breakdown per hour
    slotBreakdown: [
      {
        startTime: String,
        endTime: String,
        price: Number,
        appliedRule: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ['HELD', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED', 'PAYMENT_FAILED'],
      default: 'HELD',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    holdExpiresAt: {
      type: Date,
      index: true,
    },
    qrVerificationToken: {
      type: String,
    },
    cancellationDetails: {
      cancelledAt: Date,
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      refundAmount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Concurrency-safe unique partial index on slotTimes
// In MongoDB, a multikey index on slotTimes ensures that if any slotTime overlaps
// across two active bookings on the same turf and date, the second insert will be rejected with E11000 duplicate key error!
bookingSchema.index(
  { turfId: 1, date: 1, slotTimes: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: { $in: ['HELD', 'CONFIRMED', 'COMPLETED'] },
    },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
