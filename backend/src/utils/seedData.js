require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Turf = require('../models/Turf');
const PricingRule = require('../models/PricingRule');
const Booking = require('../models/Booking');
const BlockedSlot = require('../models/BlockedSlot');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const { generateBookingQRToken } = require('./qrHelper');

const seedDatabase = async (customUri = null) => {
  try {
    const mongoUri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/turfbook';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Turf.deleteMany({});
    await PricingRule.deleteMany({});
    await Booking.deleteMany({});
    await BlockedSlot.deleteMany({});
    await Review.deleteMany({});
    await Payment.deleteMany({});
    console.log('[Seed] Cleared existing collections');

    // 1. Create Admin User
    const admin = new User({
      name: 'Turf Owner (Admin)',
      email: 'admin@turfbook.com',
      phone: '+919876543210',
      password: 'AdminPassword123!',
      role: 'ADMIN',
    });
    await admin.save();
    console.log('[Seed] Admin User Created: admin@turfbook.com / AdminPassword123!');

    // 2. Create Sample Customers
    const customer1 = new User({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      phone: '+919841234567',
      password: 'Customer123!',
      role: 'CUSTOMER',
    });
    await customer1.save();

    const customer2 = new User({
      name: 'Karthik Raja',
      email: 'karthik@gmail.com',
      phone: '+919847654321',
      password: 'Customer123!',
      role: 'CUSTOMER',
    });
    await customer2.save();
    console.log('[Seed] Demo Customers Created');

    // 3. Create Turf
    const turf = await Turf.create({
      name: 'Arena Sports Turf',
      tagline: 'Premium FIFA-Grade 50mm Artificial Turf for Football & Box Cricket',
      description:
        'Arena Sports Turf offers Coimbatore’s finest sporting experience. Featuring world-class 50mm artificial grass with optimum shock absorption, glare-free stadium-grade LED floodlights, spacious covered dugouts, clean showers, and ample parking. Perfect for corporate tournaments, weekend leagues, and friendly matches.',
      address: '124, Avinashi Road, Near Fun Republic Mall, Peelamedu',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      latitude: 11.0283,
      longitude: 77.0041,
      googleMapsUrl: 'https://maps.google.com/?q=11.0283,77.0041',
      sports: ['Football (5v5 / 7v7)', 'Box Cricket', 'Badminton'],
      amenities: [
        'FIFA-Approved 50mm Artificial Grass',
        'Flicker-Free High Mast LED Floodlights',
        'AC Changing Rooms & Showers',
        'Hygienic Restrooms',
        'Purified RO Drinking Water Cooler',
        'Covered Spectator Gallery & Dugouts',
        'Dedicated Car & Two-Wheeler Parking',
        'Pro Leather & Tennis Match Balls',
        'First Aid Kit & Emergency Ice Bags',
      ],
      openingTime: '06:00',
      closingTime: '23:00',
      slotDuration: 60,
      defaultPrice: 800,
      advanceType: 'percentage',
      advanceValue: 30,
      cancellationPolicy: {
        freeCancellationHours: 24,
        refundPercentage: 100,
        policyText:
          '100% refund on cancellations made at least 24 hours before your slot. Cancellations under 24 hours are non-refundable.',
      },
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1529900240041-22f1ad31846c?auto=format&fit=crop&w=1200&q=80',
          caption: 'Championship Pitch Under Evening Floodlights',
          isCover: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
          caption: 'Premium 50mm Grass with Granule Infill',
          isCover: false,
        },
        {
          url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
          caption: 'Box Cricket Setup with Safety Nets',
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
      emergencyPhone: '+91 98765 43219',
    });
    console.log('[Seed] Turf Created:', turf.name);

    // 4. Create Pricing Rules
    const pricingRules = [
      {
        turfId: turf._id,
        name: 'Morning Saver (06:00 - 12:00)',
        daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        startTime: '06:00',
        endTime: '12:00',
        price: 600,
        priority: 2,
        isActive: true,
      },
      {
        turfId: turf._id,
        name: 'Afternoon Play (12:00 - 17:00)',
        daysOfWeek: [], // All days
        startTime: '12:00',
        endTime: '17:00',
        price: 700,
        priority: 1,
        isActive: true,
      },
      {
        turfId: turf._id,
        name: 'Prime Floodlights (17:00 - 22:00)',
        daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        startTime: '17:00',
        endTime: '22:00',
        price: 900,
        priority: 2,
        isActive: true,
      },
      {
        turfId: turf._id,
        name: 'Weekend Prime Hours (Sat-Sun)',
        daysOfWeek: [0, 6], // Sunday & Saturday
        startTime: '17:00',
        endTime: '23:00',
        price: 1000,
        priority: 3,
        isActive: true,
      },
      {
        turfId: turf._id,
        name: 'Weekend Morning (Sat-Sun)',
        daysOfWeek: [0, 6],
        startTime: '06:00',
        endTime: '12:00',
        price: 800,
        priority: 3,
        isActive: true,
      },
    ];
    await PricingRule.insertMany(pricingRules);
    console.log(`[Seed] ${pricingRules.length} Pricing Rules Created`);

    // 5. Create Customer Reviews
    const reviews = [
      {
        turfId: turf._id,
        userId: customer1._id,
        customerName: 'Rahul Sharma',
        rating: 5,
        comment:
          'Fantastic turf quality! The ball rolls smoothly and the lighting is great even for late night 9 PM matches. Booking online and paying the advance was super seamless.',
        isVerifiedBooking: true,
        isApproved: true,
      },
      {
        turfId: turf._id,
        userId: customer2._id,
        customerName: 'Karthik Raja',
        rating: 5,
        comment:
          'Best turf in Coimbatore for 5v5 football and box cricket. Clean locker rooms, purified cold water, and very friendly management.',
        isVerifiedBooking: true,
        isApproved: true,
      },
      {
        turfId: turf._id,
        customerName: 'Vignesh P.',
        rating: 5,
        comment:
          'Very well maintained pitch with thick 50mm grass. Doesn’t hurt the knees when diving. The instant QR code booking pass on phone is very convenient!',
        isVerifiedBooking: true,
        isApproved: true,
      },
    ];
    await Review.insertMany(reviews);
    console.log(`[Seed] ${reviews.length} Reviews Created`);

    // 6. Create Today's sample confirmed booking
    const today = new Date().toISOString().split('T')[0];
    const qrToken = generateBookingQRToken('TB-SAMPLE-001', turf._id, today, '19:00');

    const sampleBooking = await Booking.create({
      bookingId: `TB-${today.replace(/-/g, '')}-10001`,
      userId: customer1._id,
      turfId: turf._id,
      customerDetails: {
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        phone: '+919841234567',
        notes: 'Need 2 sets of football bibs',
      },
      sport: 'Football (5v5)',
      date: today,
      startTime: '19:00',
      endTime: '20:00',
      duration: 60,
      totalAmount: 900,
      advanceAmount: 270,
      remainingAmount: 630,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      razorpayOrderId: 'order_demo_1001',
      razorpayPaymentId: 'pay_demo_1001',
      qrVerificationToken: qrToken,
    });

    await Payment.create({
      bookingId: sampleBooking._id,
      userId: customer1._id,
      razorpayOrderId: 'order_demo_1001',
      razorpayPaymentId: 'pay_demo_1001',
      razorpaySignature: 'sample_sig',
      amount: 270,
      currency: 'INR',
      status: 'SUCCESS',
    });

    // 7. Create a sample maintenance blocked slot for tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await BlockedSlot.create({
      turfId: turf._id,
      date: tomorrow,
      startTime: '09:00',
      endTime: '10:00',
      reason: 'Maintenance',
      notes: 'Grass brushing and infill leveling',
      createdBy: admin._id,
    });

    console.log('[Seed] Database successfully seeded with rich demo data!');
    if (!customUri) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Seeding error:', error);
    if (!customUri) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
