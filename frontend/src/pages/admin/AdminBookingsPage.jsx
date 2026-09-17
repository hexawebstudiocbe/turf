import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import PassCard from '../../components/PassCard';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  QrCode,
  Calendar,
  Clock,
  Phone,
  User,
  AlertCircle,
} from 'lucide-react';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPassBooking, setSelectedPassBooking] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (search) params.search = search;

      const res = await adminApi.getBookings(params);
      if (res.success && res.data) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await adminApi.updateBookingStatus(id, newStatus);
      if (res.success) {
        setActionMessage(`Booking updated to ${newStatus}`);
        fetchBookings();
      }
    } catch (err) {
      setActionMessage(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ADMIN MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">Bookings & Match Ledger</h1>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-pitch-950 border border-pitch-500/40 text-xs text-pitch-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Booking ID, Customer Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-xs py-2.5"
          />
        </form>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field text-xs py-2 px-3"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-2 py-2 text-xs bg-slate-800 text-slate-400 rounded-lg hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CONFIRMED', 'HELD', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No bookings found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Sport</th>
                  <th className="p-4">Financials</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {b.bookingId}
                      <p className="text-[10px] text-slate-500 font-sans">
                        {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{b.customerDetails?.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{b.customerDetails?.phone}</p>
                      <p className="text-[10px] text-slate-500">{b.customerDetails?.email}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{b.date}</p>
                      <p className="font-bold text-pitch-400">{b.startTime} - {b.endTime}</p>
                    </td>

                    <td className="p-4 text-slate-300">
                      {b.sport || 'Football'}
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-400">Total: <strong className="text-white">₹{b.totalAmount}</strong></p>
                        <p className="text-pitch-400">Advance: <strong>₹{b.advanceAmount}</strong></p>
                        <p className="text-amber-400 font-bold">Balance: ₹{b.remainingAmount}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-pitch-950 text-pitch-400 border border-pitch-800'
                            : b.bookingStatus === 'COMPLETED'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : b.bookingStatus === 'CANCELLED'
                            ? 'bg-red-950 text-red-400 border border-red-900'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPassBooking(b)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                      >
                        Pass
                      </button>
                      {b.bookingStatus === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'COMPLETED')}
                            className="px-2.5 py-1 text-xs bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-lg transition"
                          >
                            Mark Played
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'CANCELLED')}
                            className="px-2.5 py-1 text-xs bg-red-950 text-red-400 hover:bg-red-900 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match Pass Inspection Modal */}
      {selectedPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Customer Match Pass & QR</h3>
              <button
                onClick={() => setSelectedPassBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <PassCard booking={selectedPassBooking} turf={selectedPassBooking.turfId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
