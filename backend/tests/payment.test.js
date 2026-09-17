require('./setup');
const request = require('supertest');
const app = require('../src/server');
const Turf = require('../src/models/Turf');
const Booking = require('../src/models/Booking');

describe('Payment Flow & Verification Tests', () => {
  let turf;

  beforeEach(async () => {
    turf = await Turf.create({
      name: 'Arena Sports Turf',
      openingTime: '06:00',
      closingTime: '23:00',
      slotDuration: 60,
      defaultPrice: 1000,
      advanceType: 'percentage',
      advanceValue: 30,
    });
  });

  it('should complete payment verification and confirm booking with QR code', async () => {
    const targetDate = '2028-12-10';
    const holdRes = await request(app).post('/api/bookings/hold').send({
      date: targetDate,
      startTime: '18:00',
      endTime: '19:00',
      customerDetails: {
        name: 'Player One',
        email: 'playerone@example.com',
        phone: '9876543210',
      },
    });

    expect(holdRes.status).toBe(201);
    const { orderId, bookingId } = holdRes.body.data;
    expect(orderId).toBeDefined();

    // Verify payment
    const confirmRes = await request(app).post('/api/payments/verify').send({
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_test_12345',
      razorpaySignature: 'mock_sig_verified',
    });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.success).toBe(true);
    expect(confirmRes.body.data.booking.bookingStatus).toBe('CONFIRMED');
    expect(confirmRes.body.data.booking.paymentStatus).toBe('SUCCESS');
    expect(confirmRes.body.data.booking.qrVerificationToken).toBeDefined();

    // Test Idempotency: Repeating the exact same verification should return 200 without error
    const repeatRes = await request(app).post('/api/payments/verify').send({
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_test_12345',
      razorpaySignature: 'mock_sig_verified',
    });

    expect(repeatRes.status).toBe(200);
    expect(repeatRes.body.data.booking.bookingStatus).toBe('CONFIRMED');
  });
});
