/**
 * Helper utilities for time, dates, and slot generation
 */

const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const formatTo12Hour = (time24) => {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const getSlotCategory = (startTime) => {
  const mins = timeToMinutes(startTime);
  if (mins < 12 * 60) return 'Morning';
  if (mins < 17 * 60) return 'Afternoon';
  if (mins < 21 * 60) return 'Evening';
  return 'Night';
};

const isDateInPast = (dateStr) => {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate < today;
};

const isSlotInPast = (dateStr, startTime) => {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);
  const slotDate = new Date(`${dateStr}T00:00:00`);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate <= now;
};

const generateSlots = (openingTime = '06:00', closingTime = '23:00', slotDuration = 60) => {
  const startMins = timeToMinutes(openingTime);
  const endMins = timeToMinutes(closingTime);
  const slots = [];

  let current = startMins;
  while (current + slotDuration <= endMins) {
    const startTime = minutesToTime(current);
    const endTime = minutesToTime(current + slotDuration);
    slots.push({
      startTime,
      endTime,
      label: `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`,
      category: getSlotCategory(startTime),
      duration: slotDuration,
    });
    current += slotDuration;
  }

  return slots;
};

const getDayOfWeekIndex = (dateStr) => {
  const date = new Date(dateStr);
  return date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
};

/**
 * Calculates end time given start time and duration in hours
 */
const calculateEndTime = (startTime, durationHours = 1, slotDurationMinutes = 60) => {
  const startMins = timeToMinutes(startTime);
  const totalMins = startMins + durationHours * slotDurationMinutes;
  return minutesToTime(totalMins);
};

/**
 * Breaks a multi-hour interval into consecutive individual hourly slots
 * e.g. startTime="18:00", durationHours=3 ->
 * intervals: [
 *   { startTime: '18:00', endTime: '19:00' },
 *   { startTime: '19:00', endTime: '20:00' },
 *   { startTime: '20:00', endTime: '21:00' }
 * ],
 * slotTimes: ['18:00', '19:00', '20:00']
 */
const getConsecutiveSlotIntervals = (startTime, durationHours = 1, slotDurationMinutes = 60) => {
  const startMins = timeToMinutes(startTime);
  const intervals = [];
  const slotTimes = [];

  for (let i = 0; i < durationHours; i++) {
    const slotStart = minutesToTime(startMins + i * slotDurationMinutes);
    const slotEnd = minutesToTime(startMins + (i + 1) * slotDurationMinutes);
    intervals.push({
      startTime: slotStart,
      endTime: slotEnd,
      label: `${formatTo12Hour(slotStart)} - ${formatTo12Hour(slotEnd)}`,
    });
    slotTimes.push(slotStart);
  }

  return {
    intervals,
    slotTimes,
    endTime: intervals[intervals.length - 1].endTime,
  };
};

/**
 * Checks if two time intervals overlap: [start1, end1) and [start2, end2)
 */
const doTimeIntervalsOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  formatTo12Hour,
  getSlotCategory,
  isDateInPast,
  isSlotInPast,
  generateSlots,
  getDayOfWeekIndex,
  calculateEndTime,
  getConsecutiveSlotIntervals,
  doTimeIntervalsOverlap,
};
