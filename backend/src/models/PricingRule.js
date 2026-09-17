const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
  {
    turfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    daysOfWeek: {
      type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday. Empty means all days.
      default: [],
    },
    startTime: {
      type: String, // 'HH:mm' e.g. '06:00'
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // 'HH:mm' e.g. '17:00'
      required: [true, 'End time is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    priority: {
      type: Number,
      default: 1, // Higher priority overrides lower
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);

module.exports = PricingRule;
