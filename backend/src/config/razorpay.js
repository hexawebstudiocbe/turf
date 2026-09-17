const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && key_id !== 'rzp_test_placeholder' && !key_id.startsWith('mock_')) {
    try {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
      console.log('[Payment] Razorpay SDK initialized with provided API keys');
    } catch (err) {
      console.warn('[Payment] Error initializing Razorpay SDK:', err.message);
    }
  }

  return razorpayInstance;
};

/**
 * Creates a Razorpay order or simulated order if in development/test mock mode
 */
const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const rzp = getRazorpayInstance();
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dev_secret_key_12345';

  if (rzp) {
    // Real Razorpay API call
    return await rzp.orders.create({
      amount: Math.round(amount * 100), // convert INR to paise
      currency,
      receipt,
      notes,
    });
  }

  // Fallback simulator mode for local development/testing without active Razorpay account
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: mockOrderId,
    entity: 'order',
    amount: Math.round(amount * 100),
    amount_paid: 0,
    amount_due: Math.round(amount * 100),
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    notes,
    created_at: Math.floor(Date.now() / 1000),
    isMock: true,
  };
};

/**
 * Verifies Razorpay payment signature
 */
const verifyPaymentSignature = ({ order_id, payment_id, signature }) => {
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dev_secret_key_12345';

  if (!order_id || !payment_id || !signature) {
    return false;
  }

  // Handle mock orders
  if (order_id.startsWith('order_mock_') || signature.startsWith('mock_sig_')) {
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('[Payment] Signature verification error:', error.message);
    return false;
  }
};

module.exports = {
  getRazorpayInstance,
  createOrder,
  verifyPaymentSignature,
};
