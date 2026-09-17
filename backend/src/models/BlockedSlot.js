const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema(
  {
    turfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Date is required'],
      index: true,
    },
    startTime: {
      type: String, // 'HH:mm'
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // 'HH:mm'
      required: [true, 'End time is required'],
    },
    reason: {
      type: String,
      enum: ['Maintenance', 'Private Tournament', 'Turf Owner Booking', 'Weather / Rain', 'Emergency Repair', 'Other'],
      default: 'Maintenance',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate blocked records for the same slot
blockedSlotSchema.index({ turfId: 1, date: 1, startTime: 1 }, { unique: true });

const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema);

module.exports = BlockedSlot;
