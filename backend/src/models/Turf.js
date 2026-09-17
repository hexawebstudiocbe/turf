const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Turf name is required'],
      trim: true,
      default: 'Arena Sports Turf',
    },
    tagline: {
      type: String,
      default: 'Premium FIFA-Grade Turf for Football & Box Cricket',
      trim: true,
    },
    description: {
      type: String,
      default:
        'Experience top-tier sports action on our world-class 50mm imported artificial grass turf. Equipped with flicker-free professional LED floodlights, lush seating gallery, hygienic locker rooms, and ample parking space.',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      default: '124, Avinashi Road, Peelamedu',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      default: 'Coimbatore',
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    country: {
      type: String,
      default: 'India',
    },
    latitude: {
      type: Number,
      default: 11.0283,
    },
    longitude: {
      type: Number,
      default: 77.0041,
    },
    googleMapsUrl: {
      type: String,
      default: 'https://maps.google.com/?q=11.0283,77.0041',
    },
    sports: {
      type: [String],
      default: ['Football (5v5 / 7v7)', 'Box Cricket', 'Badminton'],
    },
    amenities: {
      type: [String],
      default: [
        'FIFA-Approved Artificial Turf (50mm)',
        'Professional LED Floodlights',
        'Air-Conditioned Changing Rooms & Showers',
        'Clean Restrooms',
        'Purified RO Drinking Water',
        'Covered Spectator Seating Gallery',
        'Spacious Car & Bike Parking',
        'First Aid & Ice Packs Available',
        'Pro Match Balls & Bibs Included',
      ],
    },
    openingTime: {
      type: String,
      default: '06:00',
    },
    closingTime: {
      type: String,
      default: '23:00',
    },
    slotDuration: {
      type: Number,
      default: 60, // in minutes
    },
    defaultPrice: {
      type: Number,
      default: 800, // in INR
    },
    advanceType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    advanceValue: {
      type: Number,
      default: 30, // 30% by default or 300 if fixed
    },
    cancellationPolicy: {
      freeCancellationHours: {
        type: Number,
        default: 24,
      },
      refundPercentage: {
        type: Number,
        default: 100,
      },
      policyText: {
        type: String,
        default:
          'Full refund available if cancelled at least 24 hours prior to slot time. Cancellations within 24 hours are non-refundable.',
      },
    },
    gallery: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    whatsappNumber: {
      type: String,
      default: '+919876543210',
    },
    emergencyPhone: {
      type: String,
      default: '+91 98765 43219',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Turf = mongoose.model('Turf', turfSchema);

module.exports = Turf;
