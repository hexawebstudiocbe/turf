require('./setup');
const request = require('supertest');
const app = require('../src/server');
const Turf = require('../src/models/Turf');
const PricingRule = require('../src/models/PricingRule');
const BlockedSlot = require('../src/models/BlockedSlot');
const Booking = require('../src/models/Booking');

describe('Pricing & Multi-Hour Slot Engine Tests', () => {
  let turf;

  beforeEach(async () => {
    turf = await Turf.create({
      name: 'Arena Sports Turf',
      openingTime: '06:00',
      closingTime: '23:00',
      slotDuration: 60,
      defaultPrice: 800,
      advanceType: 'percentage',
      advanceValue: 30,
    });

    await PricingRule.create({
      turfId: turf._id,
      name: 'Morning Saver',
      startTime: '06:00',
      endTime: '12:00',
      price: 600,
      priority: 2,
      isActive: true,
    });

    await PricingRule.create({
      turfId: turf._id,
      name: 'Prime Floodlights',
      startTime: '18:00',
      endTime: '22:00',
      price: 1000,
      priority: 2,
      isActive: true,
    });
  });

  it('should retrieve slots with correct server pricing and categories', async () => {
    const targetDate = '2028-10-15';
    const res = await request(app).get(`/api/slots?date=${targetDate}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slots.length).toBeGreaterThan(0);

    const morningSlot = res.body.data.slots.find((s) => s.startTime === '07:00');
    expect(morningSlot.price).toBe(600); // from PricingRule
    expect(morningSlot.advanceAmount).toBe(180); // 30% of 600
    expect(morningSlot.status).toBe('AVAILABLE');

    const eveningSlot = res.body.data.slots.find((s) => s.startTime === '19:00');
    expect(eveningSlot.price).toBe(1000); // from Prime Floodlights
    expect(eveningSlot.advanceAmount).toBe(300); // 30% of 1000
  });

  it('should calculate multi-hour booking by summing individual hourly tiers', async () => {
    const targetDate = '2028-10-15';
    // 17:00 to 20:00 (3 hours):
    // 17:00-18:00 -> ₹800 (default)
    // 18:00-19:00 -> ₹1000 (Prime)
    // 19:00-20:00 -> ₹1000 (Prime)
    // Total = ₹2,800, Advance 30% = ₹840, Balance = ₹1,960
    const res = await request(app).post('/api/bookings/hold').send({
      date: targetDate,
      startTime: '17:00',
      durationHours: 3,
      customerDetails: {
        name: 'Arun MultiHour',
        email: 'arun@example.com',
        phone: '9876543210',
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe(2800);
    expect(res.body.data.advanceAmount).toBe(840);
    expect(res.body.data.remainingAmount).toBe(1960);
    expect(res.body.data.startTime).toBe('17:00');
    expect(res.body.data.endTime).toBe('20:00');
    expect(res.body.data.slotTimes).toEqual(['17:00', '18:00', '19:00']);
  });

  it('should reject multi-hour booking if ANY intermediate slot is already booked', async () => {
    const targetDate = '2028-10-16';
    
    // Book 18:00-19:00 first
    await request(app).post('/api/bookings/hold').send({
      date: targetDate,
      startTime: '18:00',
      durationHours: 1,
      customerDetails: {
        name: 'Existing Customer',
        email: 'existing@example.com',
        phone: '9876543210',
      },
    });

    // Customer B attempts 17:00 for 3 hours (17:00 - 20:00) -> overlaps with 18:00
    const res = await request(app).post('/api/bookings/hold').send({
      date: targetDate,
      startTime: '17:00',
      durationHours: 3,
      customerDetails: {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '9876543211',
      },
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
