const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const BlockedSlot = require('../models/BlockedSlot');
const { generateSlots, isDateInPast, isSlotInPast, doTimeIntervalsOverlap } = require('../utils/timeHelper');
const { calculateSlotPrice } = require('./pricingService');

/**
 * Releases expired HELD bookings to free up index locks
 */
const cleanupExpiredHolds = async (turfId, dateStr) => {
  const now = new Date();
  await Booking.updateMany(
    {
      turfId,
      date: dateStr,
      bookingStatus: 'HELD',
      holdExpiresAt: { $lt: now },
    },
    {
      $set: { bookingStatus: 'EXPIRED' },
    }
  );
};

/**
 * Generates slots with real-time status and pricing for a specific date
 */
const getSlotsForDate = async (turfId, dateStr) => {
  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new Error('Turf not found');
  }

  // 1. Release expired holds for this date
  await cleanupExpiredHolds(turfId, dateStr);

  const isPastDate = isDateInPast(dateStr);

  // 2. Fetch active bookings (HELD, CONFIRMED, COMPLETED)
  const activeBookings = await Booking.find({
    turfId,
    date: dateStr,
    bookingStatus: { $in: ['HELD', 'CONFIRMED', 'COMPLETED'] },
  });

  // 3. Fetch blocked slots
  const blockedSlots = await BlockedSlot.find({
    turfId,
    date: dateStr,
  });

  // 4. Generate standard time slots
  const baseSlots = generateSlots(turf.openingTime, turf.closingTime, turf.slotDuration || 60);

  // 5. Map slots with status & pricing
  const now = new Date();
  const slotsWithStatus = await Promise.all(
    baseSlots.map(async (slot) => {
      // Check if slot overlaps with any blocked range
      const blocked = blockedSlots.find((b) =>
        doTimeIntervalsOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime)
      );

      if (blocked) {
        return {
          ...slot,
          status: 'BLOCKED',
          blockReason: blocked.reason,
          blockNotes: blocked.notes,
          blockedId: blocked._id,
        };
      }

      // Check if slot overlaps with any active booking (single or multi-hour)
      const booking = activeBookings.find((b) => {
        if (b.slotTimes && b.slotTimes.length > 0) {
          return b.slotTimes.includes(slot.startTime);
        }
        return doTimeIntervalsOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime);
      });

      let status = 'AVAILABLE';
      let holdRemainingSeconds = 0;
      let heldByCustomer = null;

      if (booking) {
        if (booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'COMPLETED') {
          status = 'BOOKED';
        } else if (booking.bookingStatus === 'HELD') {
          if (booking.holdExpiresAt && booking.holdExpiresAt > now) {
            status = 'HELD';
            holdRemainingSeconds = Math.max(0, Math.floor((booking.holdExpiresAt - now) / 1000));
            heldByCustomer = booking.customerDetails?.name || 'Customer';
          } else {
            status = 'AVAILABLE';
          }
        }
      }

      // Check if past
      if (isPastDate || isSlotInPast(dateStr, slot.startTime)) {
        if (status === 'AVAILABLE') {
          status = 'PAST';
        }
      }

      // Calculate single slot server price
      const pricing = await calculateSlotPrice(turfId, dateStr, slot.startTime, slot.endTime);

      return {
        ...slot,
        status,
        holdRemainingSeconds,
        heldByCustomer: status === 'HELD' ? heldByCustomer : undefined,
        bookingId: booking ? booking.bookingId : undefined,
        durationHours: booking ? booking.durationHours : 1,
        price: pricing.totalAmount,
        advanceAmount: pricing.advanceAmount,
        remainingAmount: pricing.remainingAmount,
        appliedRule: pricing.appliedRule,
      };
    })
  );

  // 6. Calculate maximum consecutive available hours starting from each available slot
  const slotsWithConsecutive = slotsWithStatus.map((slot, index) => {
    if (slot.status !== 'AVAILABLE') {
      return { ...slot, maxConsecutiveHours: 0 };
    }

    let consecutive = 1;
    for (let j = index + 1; j < slotsWithStatus.length; j++) {
      if (slotsWithStatus[j].status === 'AVAILABLE') {
        consecutive++;
      } else {
        break;
      }
    }

    return {
      ...slot,
      maxConsecutiveHours: Math.min(consecutive, 6), // allow up to 6 hours max
    };
  });

  return {
    date: dateStr,
    turfId: turf._id,
    turfName: turf.name,
    totalSlots: slotsWithConsecutive.length,
    availableSlotsCount: slotsWithConsecutive.filter((s) => s.status === 'AVAILABLE').length,
    slots: slotsWithConsecutive,
  };
};

module.exports = {
  getSlotsForDate,
  cleanupExpiredHolds,
};
