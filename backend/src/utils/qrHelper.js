const crypto = require('crypto');

const generateBookingQRToken = (bookingId, turfId, date, startTime) => {
  const secret = process.env.JWT_SECRET || 'turfbook_qr_secret_key_2026';
  const payload = `${bookingId}|${turfId}|${date}|${startTime}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex').substring(0, 16);
  
  const tokenData = {
    bookingId,
    turfId,
    date,
    time: startTime,
    sig: signature,
  };

  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
};

const verifyBookingQRToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'turfbook_qr_secret_key_2026';
    const jsonStr = Buffer.from(token, 'base64').toString('utf8');
    const tokenData = JSON.parse(jsonStr);

    const payload = `${tokenData.bookingId}|${tokenData.turfId}|${tokenData.date}|${tokenData.time}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex').substring(0, 16);

    if (expectedSig === tokenData.sig) {
      return { valid: true, data: tokenData };
    }
    return { valid: false, message: 'Invalid QR signature' };
  } catch (error) {
    return { valid: false, message: 'Malformed QR token' };
  }
};

module.exports = {
  generateBookingQRToken,
  verifyBookingQRToken,
};
