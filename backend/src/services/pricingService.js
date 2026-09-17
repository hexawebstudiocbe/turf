const Turf = require('../models/Turf');
const PricingRule = require('../models/PricingRule');
const { timeToMinutes, getDayOfWeekIndex, getConsecutiveSlotIntervals } = require('../utils/timeHelper');

/**
 * Calculates the exact price for a single 1-hour slot on the server
 */
const getSingleSlotPrice = (turf, rules, dateStr, startTime) => {
  const slotStartMins = timeToMinutes(startTime);
  const dayOfWeek = getDayOfWeekIndex(dateStr);

  let applicablePrice = turf.defaultPrice || 800;
  let appliedRule = 'Standard Rate';

  for (const rule of rules) {
    const ruleStartMins = timeToMinutes(rule.startTime);
    const ruleEndMins = timeToMinutes(rule.endTime);

    // Check if day matches (empty array means all days)
    const dayMatches = !rule.daysOfWeek || rule.daysOfWeek.length === 0 || rule.daysOfWeek.includes(dayOfWeek);

    // Check if slot falls in time range
    const timeMatches = slotStartMins >= ruleStartMins && slotStartMins < ruleEndMins;

    if (dayMatches && timeMatches) {
      applicablePrice = rule.price;
      appliedRule = rule.name;
      break; // Priority sorted, first match wins
    }
  }

  return { price: applicablePrice, appliedRule };
};

/**
 * Calculates slot price for single hour
 */
const calculateSlotPrice = async (turfId, dateStr, startTime, endTime) => {
  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new Error('Turf not found');
  }

  const rules = await PricingRule.find({
    turfId,
    isActive: true,
  }).sort({ priority: -1 });

  const { price, appliedRule } = getSingleSlotPrice(turf, rules, dateStr, startTime);

  let advanceAmount = 0;
  if (turf.advanceType === 'fixed') {
    advanceAmount = Math.min(turf.advanceValue || 300, price);
  } else {
    const percentage = turf.advanceValue || 30;
    advanceAmount = Math.round((price * percentage) / 100);
  }

  return {
    totalAmount: price,
    advanceAmount,
    remainingAmount: price - advanceAmount,
    advanceType: turf.advanceType,
    advanceValue: turf.advanceValue,
    appliedRule,
  };
};

/**
 * Calculates multi-hour booking price by summing each individual underlying hour
 */
const calculateMultiHourPrice = async (turfId, dateStr, startTime, durationHours = 1) => {
  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new Error('Turf not found');
  }

  const rules = await PricingRule.find({
    turfId,
    isActive: true,
  }).sort({ priority: -1 });

  const { intervals, slotTimes, endTime } = getConsecutiveSlotIntervals(startTime, durationHours, turf.slotDuration || 60);

  let totalAmount = 0;
  const slotBreakdown = [];

  for (const interval of intervals) {
    const { price, appliedRule } = getSingleSlotPrice(turf, rules, dateStr, interval.startTime);
    totalAmount += price;
    slotBreakdown.push({
      startTime: interval.startTime,
      endTime: interval.endTime,
      label: interval.label,
      price,
      appliedRule,
    });
  }

  // Calculate advance on the combined total amount
  let advanceAmount = 0;
  if (turf.advanceType === 'fixed') {
    // If fixed advance, can be fixed per hour or fixed total
    advanceAmount = Math.min((turf.advanceValue || 300) * durationHours, totalAmount);
  } else {
    // Percentage
    const percentage = turf.advanceValue || 30;
    advanceAmount = Math.round((totalAmount * percentage) / 100);
  }

  const remainingAmount = totalAmount - advanceAmount;

  return {
    totalAmount,
    advanceAmount,
    remainingAmount,
    advanceType: turf.advanceType,
    advanceValue: turf.advanceValue,
    durationHours,
    durationMinutes: durationHours * (turf.slotDuration || 60),
    startTime,
    endTime,
    slotTimes,
    slotBreakdown,
  };
};

module.exports = {
  calculateSlotPrice,
  calculateMultiHourPrice,
};
