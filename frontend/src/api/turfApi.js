import axiosClient from './axiosClient';

export const turfApi = {
  getTurf: () => axiosClient.get('/turf'),
  getReviews: () => axiosClient.get('/turf/reviews'),
  createReview: (reviewData) => axiosClient.post('/turf/reviews', reviewData),
};
