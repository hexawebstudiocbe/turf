import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { useTurf } from '../context/TurfContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const MyBookingsPage = () => {
  const { turf } = useTurf();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      if (res.success && res.data?.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setCancellingId(cancelModalBooking.bookingId);
      const res = await bookingApi.cancelBooking(cancelModalBooking.bookingId, cancelReason || 'Customer cancellation');
      if (res.success) {
        setActionMessage(res.message || 'Booking cancelled successfully');
        setCancelModalBooking(null);
        fetchMyBookings();
      }
    } catch (err) {
      setActionMessage(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
            Booking History
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">My Turf Matches</h1>
        </div>
        <Link to="/book" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Book New Slot
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-pitch-950/60 border border-pitch-500/40 text-xs text-pitch-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your match bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven’t booked any slots yet. Check out available slots on the live pitch schedule!
          </p>
          <Link to="/book" className="btn-primary text-sm py-2 px-6 inline-block">
            Book a Slot Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'CONFIRMED';
            const isCompleted = b.bookingStatus === 'COMPLETED';
            const isCancelled = b.bookingStatus === 'CANCELLED';

            return (
              <div
                key={b._id}
                className="glass-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-pitch-500/30 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-white font-mono">{b.bookingId}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isConfirmed
                          ? 'bg-pitch-950 text-pitch-400 border border-pitch-800'
                          : isCompleted
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : isCancelled
                          ? 'bg-red-950 text-red-400 border border-red-900'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {b.sport || 'Football'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500">Date</p>
                      <p className="font-bold text-slate-200">{b.date}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Time Slot</p>
                      <p className="font-bold text-pitch-400">{b.startTime} - {b.endTime}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Advance Paid / Total</p>
                      <p className="font-bold text-slate-200">
                        ₹{b.advanceAmount} <span className="text-slate-500 font-normal">/ ₹{b.totalAmount}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {isConfirmed && (
                    <button
                      onClick={() => setCancelModalBooking(b)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  )}
                  <Link
                    to={`/booking/confirmation/${b.bookingId}`}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    View QR Pass
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card max-w-md w-full p-6 space-y-4 border-red-500/30 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Cancel Booking {cancelModalBooking.bookingId}</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to cancel your slot for <strong>{cancelModalBooking.date} ({cancelModalBooking.startTime})</strong>?
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-200">Cancellation Policy:</p>
              <p>• 100% refund on advance if cancelled at least 24 hours prior to match time.</p>
              <p>• Cancellations made within 24 hours are non-refundable.</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reason for cancellation (optional)</label>
              <input
                type="text"
                placeholder="e.g. Teammates unavailable"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancellingId === cancelModalBooking.bookingId}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold"
              >
                {cancellingId === cancelModalBooking.bookingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
