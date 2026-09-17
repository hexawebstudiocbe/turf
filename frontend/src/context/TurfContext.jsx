import React, { createContext, useContext, useState, useEffect } from 'react';
import { turfApi } from '../api/turfApi';

const TurfContext = createContext(null);

export const TurfProvider = ({ children }) => {
  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTurfData = async () => {
    try {
      setLoading(true);
      const [turfRes, reviewRes] = await Promise.all([
        turfApi.getTurf(),
        turfApi.getReviews().catch(() => ({ data: { reviews: [], averageRating: 5.0, totalReviews: 0 } })),
      ]);

      if (turfRes.success && turfRes.data?.turf) {
        setTurf(turfRes.data.turf);
      }
      if (reviewRes.success && reviewRes.data) {
        setReviews(reviewRes.data.reviews || []);
        setAverageRating(reviewRes.data.averageRating || 5.0);
        setTotalReviews(reviewRes.data.totalReviews || 0);
      }
    } catch (error) {
      console.error('Failed to load turf details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfData();
  }, []);

  return (
    <TurfContext.Provider
      value={{
        turf,
        reviews,
        averageRating,
        totalReviews,
        loading,
        refreshTurf: fetchTurfData,
      }}
    >
      {children}
    </TurfContext.Provider>
  );
};

export const useTurf = () => {
  const context = useContext(TurfContext);
  if (!context) {
    throw new Error('useTurf must be used within a TurfProvider');
  }
  return context;
};
