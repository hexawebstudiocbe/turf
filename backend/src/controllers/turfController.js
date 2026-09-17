const Turf = require('../models/Turf');
const Review = require('../models/Review');
const { sendSuccess, sendError } = require('../utils/response');

const getTurf = async (req, res, next) => {
  try {
    let turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      // Create initial default turf if empty
      turf = await Turf.create({
        name: 'Arena Sports Turf',
        tagline: 'Premium FIFA-Grade 50mm Artificial Grass Turf',
        description:
          'Experience world-class football and box cricket under professional LED floodlights. Featuring high-grade shock-absorbent artificial grass, clean changing rooms, showers, player dugout, and ample parking.',
        address: '124, Avinashi Road, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        latitude: 11.0283,
        longitude: 77.0041,
        googleMapsUrl: 'https://maps.google.com/?q=11.0283,77.0041',
        sports: ['Football (5v5 / 7v7)', 'Box Cricket', 'Badminton'],
        amenities: [
          'FIFA-Approved 50mm Turf',
          'Professional Anti-Glare LED Floodlights',
          'AC Changing Rooms & Showers',
          'Hygienic Restrooms',
          'Purified RO Drinking Water',
          'Covered Spectator Gallery',
          'Dedicated Car & Bike Parking',
          'Pro Balls & Bibs Included',
          'First Aid Kit On-Site',
        ],
        openingTime: '06:00',
        closingTime: '23:00',
        slotDuration: 60,
        defaultPrice: 800,
        advanceType: 'percentage',
        advanceValue: 30,
        gallery: [
          {
            url: 'https://images.unsplash.com/photo-1529900240041-22f1ad31846c?auto=format&fit=crop&w=1200&q=80',
            caption: 'Main Football Pitch Under Floodlights',
            isCover: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
            caption: 'FIFA-Grade 50mm Artificial Turf Pile',
            isCover: false,
          },
          {
            url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
            caption: 'Box Cricket Setup with Perimeter Nets',
            isCover: false,
          },
          {
            url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
            caption: 'Locker Rooms and Clean Shower Facilities',
            isCover: false,
          },
        ],
        contactPhone: '+91 98765 43210',
        whatsappNumber: '+919876543210',
      });
    }
    return sendSuccess(res, { turf }, 'Turf details retrieved');
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      return sendSuccess(res, { reviews: [], averageRating: 5.0, totalReviews: 0 });
    }

    const reviews = await Review.find({ turfId: turf._id, isApproved: true }).sort({ createdAt: -1 }).limit(20);

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '5.0';

    return sendSuccess(
      res,
      {
        reviews,
        averageRating: Number(averageRating),
        totalReviews: reviews.length,
      },
      'Reviews retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { rating, comment, customerName } = req.body;
    const turf = await Turf.findOne({ isActive: true });
    if (!turf) {
      return sendError(res, 'Turf not found', 404);
    }

    if (!rating || !comment) {
      return sendError(res, 'Rating and comment are required', 400);
    }

    const review = await Review.create({
      turfId: turf._id,
      userId: req.user ? req.user._id : undefined,
      customerName: req.user ? req.user.name : customerName || 'Player',
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      isVerifiedBooking: true,
      isApproved: true,
    });

    return sendSuccess(res, { review }, 'Thank you for your review!', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTurf,
  getReviews,
  createReview,
};
