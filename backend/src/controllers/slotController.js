const Turf = require('../models/Turf');
const { getSlotsForDate } = require('../services/slotService');
const { sendSuccess, sendError } = require('../utils/response');

const getSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return sendError(res, 'Date query parameter is required (YYYY-MM-DD)', 400);
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return sendError(res, 'Invalid date format. Expected YYYY-MM-DD', 400);
    }

    const turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      return sendError(res, 'Turf not configured', 404);
    }

    const slotsData = await getSlotsForDate(turf._id, date);
    return sendSuccess(res, slotsData, 'Slots retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlots,
};
