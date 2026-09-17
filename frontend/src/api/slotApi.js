import axiosClient from './axiosClient';

export const slotApi = {
  getSlotsForDate: (dateStr) => axiosClient.get(`/slots?date=${dateStr}`),
};
