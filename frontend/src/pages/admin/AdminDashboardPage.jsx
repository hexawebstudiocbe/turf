import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import {
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Clock,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Grid,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading admin analytics...</p>
      </div>
    );
  }

  const { today = {}, overview = {}, upcomingBookings = [] } = stats || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              OWNER DASHBOARD
            </span>
            <span className="text-xs text-slate-400">Today: {today.date}</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display mt-1">Turf Operations Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/slots"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            Manage Pitch Slots
          </Link>
          <Link
            to="/admin/bookings"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-950/50 transition font-bold"
          >
            <CalendarCheck className="w-4 h-4" />
            All Bookings
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Advance Collected */}
        <div className="glass-card p-5 border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-pitch-500/20 text-pitch-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-display">
            ₹{today.advanceRevenue || 0}
          </p>
          <p className="text-[11px] text-pitch-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Advance paid online via Razorpay
          </p>
        </div>

        {/* Today's Matches Count */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Today's Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-display">
            {today.bookingsCount || 0} <span className="text-xs text-slate-400 font-normal">matches</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Occupancy Rate: <strong className="text-white">{today.occupancyRate || 0}%</strong>
          </p>
        </div>

        {/* Pending Cash to Collect on Turf */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Pending Balance at Pitch</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
            ₹{today.pendingBalance || 0}
          </p>
          <p className="text-[11px] text-slate-400">To collect in cash/UPI upon team arrival</p>
        </div>

        {/* Lifetime Volume */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Lifetime Volume</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-display">
            ₹{overview.totalRevenue || 0}
          </p>
          <p className="text-[11px] text-slate-400">
            {overview.totalBookingsCount || 0} total bookings recorded
          </p>
        </div>
      </div>

      {/* Upcoming Matches Schedule */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Upcoming Matches Schedule</h2>
            <p className="text-xs text-slate-400">Real-time match bookings queue</p>
          </div>
          <Link to="/admin/bookings" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            View all bookings <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No upcoming bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Sport</th>
                  <th className="pb-3">Advance</th>
                  <th className="pb-3">Balance Due</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {upcomingBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 font-bold font-mono text-amber-300">{b.bookingId}</td>
                    <td className="py-3.5">
                      <p className="font-semibold text-white">{b.customerDetails?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.customerDetails?.phone}</p>
                    </td>
                    <td className="py-3.5 text-slate-200">{b.date}</td>
                    <td className="py-3.5 font-bold text-pitch-400">{b.startTime} - {b.endTime}</td>
                    <td className="py-3.5 text-slate-300">{b.sport || 'Football'}</td>
                    <td className="py-3.5 font-semibold text-white">₹{b.advanceAmount}</td>
                    <td className="py-3.5 font-bold text-amber-400">₹{b.remainingAmount}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pitch-950 text-pitch-400 border border-pitch-800">
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
