import axiosClient from './axiosClient';

export const bookingApi = {
  holdSlot: (bookingData) => axiosClient.post('/bookings/hold', bookingData),
  confirmPayment: (paymentData) => axiosClient.post('/payments/verify', paymentData),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),
  getMyBookings: () => axiosClient.get('/bookings/my'),
  cancelBooking: (id, reason) => axiosClient.post(`/bookings/${id}/cancel`, { reason }),
};
