const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const BlockedSlot = require('../models/BlockedSlot');
const PricingRule = require('../models/PricingRule');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getSlotsForDate } = require('../services/slotService');
const { sendSuccess, sendError } = require('../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const turf = await Turf.findOne({ isActive: true });

    // 1. Today's Bookings & Revenue
    const todayBookings = await Booking.find({
      date: today,
      bookingStatus: { $in: ['CONFIRMED', 'COMPLETED'] },
    });

    const todayBookingsCount = todayBookings.length;
    const todayAdvanceRevenue = todayBookings.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
    const todayTotalBookingValue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const todayPendingBalance = todayBookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

    // 2. Total All-time Stats
    const allConfirmed = await Booking.find({
      bookingStatus: { $in: ['CONFIRMED', 'COMPLETED'] },
    });

    const totalRevenue = allConfirmed.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
    const totalBookingsCount = allConfirmed.length;
    const totalCustomersCount = await User.countDocuments({ role: 'CUSTOMER' });

    // 3. Today's pitch occupancy
    const slotsData = turf ? await getSlotsForDate(turf._id, today) : { totalSlots: 17, slots: [] };
    const totalDaySlots = slotsData.totalSlots || 17;
    const occupancyRate = totalDaySlots > 0 ? Math.round((todayBookingsCount / totalDaySlots) * 100) : 0;

    // 4. Recent / Upcoming Bookings
    const upcomingBookings = await Booking.find({
      bookingStatus: { $in: ['CONFIRMED', 'HELD'] },
    })
      .sort({ date: 1, startTime: 1 })
      .limit(8);

    return sendSuccess(
      res,
      {
        today: {
          date: today,
          bookingsCount: todayBookingsCount,
          advanceRevenue: todayAdvanceRevenue,
          totalBookingValue: todayTotalBookingValue,
          pendingBalance: todayPendingBalance,
          occupancyRate,
        },
        overview: {
          totalRevenue,
          totalBookingsCount,
          totalCustomersCount,
          activeBlockedSlots: await BlockedSlot.countDocuments(),
        },
        upcomingBookings,
      },
      'Dashboard stats retrieved'
    );
  } catch (error) {
    next(error);
  }
};

const getAdminBookings = async (req, res, next) => {
  try {
    const { search, status, date, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.bookingStatus = status;
    }

    if (date) {
      query.date = date;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { bookingId: searchRegex },
        { 'customerDetails.name': searchRegex },
        { 'customerDetails.phone': searchRegex },
        { 'customerDetails.email': searchRegex },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('turfId')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return sendSuccess(
      res,
      {
        bookings,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
      'Bookings retrieved'
    );
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    booking.bookingStatus = status;
    if (status === 'COMPLETED') {
      booking.paymentStatus = 'SUCCESS';
    }
    await booking.save();

    return sendSuccess(res, { booking }, `Booking marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

const getAdminSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return sendError(res, 'Date is required', 400);
    }

    const turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      return sendError(res, 'Turf not found', 404);
    }

    const slotsData = await getSlotsForDate(turf._id, date);
    return sendSuccess(res, slotsData, 'Admin slots retrieved');
  } catch (error) {
    next(error);
  }
};

const blockSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime, reason, notes } = req.body;

    const turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      return sendError(res, 'Turf not found', 404);
    }

    if (!date || !startTime || !endTime) {
      return sendError(res, 'Date, startTime, and endTime are required', 400);
    }

    // Check if already booked with active booking
    const activeBooking = await Booking.findOne({
      turfId: turf._id,
      date,
      startTime,
      bookingStatus: { $in: ['CONFIRMED', 'COMPLETED'] },
    });

    if (activeBooking) {
      return sendError(res, 'Cannot block this slot because a confirmed customer booking already exists.', 400);
    }

    const blocked = await BlockedSlot.create({
      turfId: turf._id,
      date,
      startTime,
      endTime,
      reason: reason || 'Maintenance',
      notes: notes || '',
      createdBy: req.user._id,
    });

    return sendSuccess(res, { blocked }, 'Slot blocked successfully', 201);
  } catch (error) {
    next(error);
  }
};

const unblockSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await BlockedSlot.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(res, 'Blocked slot record not found', 404);
    }

    return sendSuccess(res, { unblocked: true }, 'Slot unblocked successfully');
  } catch (error) {
    next(error);
  }
};

const getPricingConfig = async (req, res, next) => {
  try {
    const turf = await Turf.findOne({ isActive: true });
    const rules = await PricingRule.find({ turfId: turf._id }).sort({ priority: -1 });

    return sendSuccess(
      res,
      {
        defaultPrice: turf ? turf.defaultPrice : 800,
        advanceType: turf ? turf.advanceType : 'percentage',
        advanceValue: turf ? turf.advanceValue : 30,
        cancellationPolicy: turf ? turf.cancellationPolicy : {},
        rules,
      },
      'Pricing config retrieved'
    );
  } catch (error) {
    next(error);
  }
};

const updatePricingConfig = async (req, res, next) => {
  try {
    const { defaultPrice, advanceType, advanceValue, cancellationPolicy, rules } = req.body;
    const turf = await Turf.findOne({ isActive: true });

    if (turf) {
      if (defaultPrice !== undefined) turf.defaultPrice = Number(defaultPrice);
      if (advanceType !== undefined) turf.advanceType = advanceType;
      if (advanceValue !== undefined) turf.advanceValue = Number(advanceValue);
      if (cancellationPolicy !== undefined) turf.cancellationPolicy = cancellationPolicy;
      await turf.save();
    }

    // Replace or update rules if provided
    if (rules && Array.isArray(rules)) {
      await PricingRule.deleteMany({ turfId: turf._id });
      const createdRules = await PricingRule.insertMany(
        rules.map((r) => ({
          turfId: turf._id,
          name: r.name,
          daysOfWeek: r.daysOfWeek || [],
          startTime: r.startTime,
          endTime: r.endTime,
          price: Number(r.price),
          priority: Number(r.priority || 1),
          isActive: r.isActive !== false,
        }))
      );
      return sendSuccess(res, { turf, rules: createdRules }, 'Pricing configuration updated successfully');
    }

    return sendSuccess(res, { turf }, 'Pricing configuration updated');
  } catch (error) {
    next(error);
  }
};

const updateTurf = async (req, res, next) => {
  try {
    let turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      turf = new Turf(req.body);
    } else {
      Object.assign(turf, req.body);
    }
    await turf.save();
    return sendSuccess(res, { turf }, 'Turf profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' }).select('-password').sort({ createdAt: -1 });

    // Aggregate booking stats for customers
    const customerStats = await Promise.all(
      customers.map(async (c) => {
        const bookings = await Booking.find({
          $or: [{ userId: c._id }, { 'customerDetails.email': c.email }],
        });

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter((b) => b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'CONFIRMED').length;
        const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;
        const totalPaid = bookings.reduce((sum, b) => (b.paymentStatus === 'SUCCESS' ? sum + b.advanceAmount : sum), 0);
        const lastBooking = bookings.length > 0 ? bookings[0].date : null;

        return {
          ...c.toJSON(),
          totalBookings,
          completedBookings,
          cancelledBookings,
          totalPaid,
          lastBooking,
        };
      })
    );

    return sendSuccess(res, { customers: customerStats }, 'Customers retrieved');
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate('bookingId').populate('userId', 'name email phone').sort({ createdAt: -1 }).limit(100);
    return sendSuccess(res, { payments }, 'Payments retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminBookings,
  updateBookingStatus,
  getAdminSlots,
  blockSlot,
  unblockSlot,
  getPricingConfig,
  updatePricingConfig,
  updateTurf,
  getCustomers,
  getPayments,
};
