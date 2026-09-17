import axiosClient from './axiosClient';

export const adminApi = {
  getDashboardStats: () => axiosClient.get('/admin/dashboard'),
  getBookings: (params) => axiosClient.get('/admin/bookings', { params }),
  updateBookingStatus: (id, status) => axiosClient.patch(`/admin/bookings/${id}/status`, { status }),
  getSlots: (date) => axiosClient.get('/admin/slots', { params: { date } }),
  blockSlot: (blockData) => axiosClient.post('/admin/slots/block', blockData),
  unblockSlot: (id) => axiosClient.delete(`/admin/slots/block/${id}`),
  getPricingConfig: () => axiosClient.get('/admin/pricing'),
  updatePricingConfig: (config) => axiosClient.put('/admin/pricing', config),
  updateTurf: (turfData) => axiosClient.put('/admin/turf', turfData),
  getCustomers: () => axiosClient.get('/admin/customers'),
  getPayments: () => axiosClient.get('/admin/payments'),
};
