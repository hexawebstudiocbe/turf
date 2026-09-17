require('./setup');
const request = require('supertest');
const app = require('../src/server');
const Turf = require('../src/models/Turf');
const Booking = require('../src/models/Booking');

describe('Concurrency & Double-Booking Prevention Tests', () => {
  let turf;

  beforeEach(async () => {
    await Booking.init(); // Guarantee partial unique index is active in memory database

    turf = await Turf.create({
      name: 'Arena Sports Turf',
      openingTime: '06:00',
      closingTime: '23:00',
      slotDuration: 60,
      defaultPrice: 900,
      advanceType: 'percentage',
      advanceValue: 30,
    });
  });

  it('MUST prevent double booking when two requests attempt to hold the same slot simultaneously', async () => {
    const targetDate = '2028-11-20';
    const targetStartTime = '19:00';

    const customerA = {
      name: 'Customer Alice',
      email: 'alice@example.com',
      phone: '9876543210',
    };

    const customerB = {
      name: 'Customer Bob',
      email: 'bob@example.com',
      phone: '9876543211',
    };

    // Fire both hold requests concurrently in parallel
    const [resA, resB] = await Promise.all([
      request(app).post('/api/bookings/hold').send({
        date: targetDate,
        startTime: targetStartTime,
        durationHours: 1,
        customerDetails: customerA,
      }),
      request(app).post('/api/bookings/hold').send({
        date: targetDate,
        startTime: targetStartTime,
        durationHours: 1,
        customerDetails: customerB,
      }),
    ]);

    const statuses = [resA.status, resB.status];
    
    // Exactly ONE request MUST succeed (201 Created) and the other MUST be rejected (409 Conflict)
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);

    // Verify database only has 1 active booking for this slot
    const activeBookings = await Booking.find({
      turfId: turf._id,
      date: targetDate,
      slotTimes: targetStartTime,
      bookingStatus: { $in: ['HELD', 'CONFIRMED', 'COMPLETED'] },
    });

    expect(activeBookings.length).toBe(1);
  });

  it('MUST prevent overlapping multi-hour bookings (e.g. 18-20 vs 19-21)', async () => {
    const targetDate = '2028-11-21';

    // Alice requests 18:00 for 2 hours (18:00 - 20:00 -> slotTimes: ['18:00', '19:00'])
    // Bob requests 19:00 for 2 hours (19:00 - 21:00 -> slotTimes: ['19:00', '20:00'])
    const [resA, resB] = await Promise.all([
      request(app).post('/api/bookings/hold').send({
        date: targetDate,
        startTime: '18:00',
        durationHours: 2,
        customerDetails: {
          name: 'Alice Overlap',
          email: 'alice_overlap@example.com',
          phone: '9876543210',
        },
      }),
      request(app).post('/api/bookings/hold').send({
        date: targetDate,
        startTime: '19:00',
        durationHours: 2,
        customerDetails: {
          name: 'Bob Overlap',
          email: 'bob_overlap@example.com',
          phone: '9876543211',
        },
      }),
    ]);

    const statuses = [resA.status, resB.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);
  });
});
