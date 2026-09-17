import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import {
  Calendar as CalendarIcon,
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

const AdminSlotsPage = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slotsData, setSlotsData] = useState({ slots: [] });
  const [loading, setLoading] = useState(true);
  const [blockModalSlot, setBlockModalSlot] = useState(null);
  const [blockReason, setBlockReason] = useState('Maintenance');
  const [blockNotes, setBlockNotes] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const fetchSlots = async (date) => {
    try {
      setLoading(true);
      const res = await adminApi.getSlots(date);
      if (res.success && res.data) {
        setSlotsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load slots for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    if (!blockModalSlot) return;

    try {
      const payload = {
        date: selectedDate,
        startTime: blockModalSlot.startTime,
        endTime: blockModalSlot.endTime,
        reason: blockReason,
        notes: blockNotes,
      };

      const res = await adminApi.blockSlot(payload);
      if (res.success) {
        setActionMessage(`Slot ${blockModalSlot.startTime} successfully blocked for ${blockReason}`);
        setBlockModalSlot(null);
        setBlockNotes('');
        fetchSlots(selectedDate);
      }
    } catch (err) {
      setActionMessage(err.message || 'Failed to block slot');
    }
  };

  const handleUnblockSlot = async (blockedId) => {
    try {
      const res = await adminApi.unblockSlot(blockedId);
      if (res.success) {
        setActionMessage('Slot unblocked successfully. Now available for customers.');
        fetchSlots(selectedDate);
      }
    } catch (err) {
      setActionMessage(err.message || 'Failed to unblock slot');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            PITCH CAPACITY
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">Slot & Block Management</h1>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field text-xs py-2 px-3 bg-slate-900 text-white"
          />
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-pitch-950 border border-pitch-500/40 text-xs text-pitch-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Slots Matrix */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Pitch Schedule for {selectedDate}</h3>
            <p className="text-xs text-slate-400">
              Click "Block" on any available slot to reserve for repairs, private matches, or weather issues.
            </p>
          </div>
          <button
            onClick={() => fetchSlots(selectedDate)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Refresh Schedule"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading pitch slots...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slotsData.slots?.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isBlocked = slot.status === 'BLOCKED';
              const isBooked = slot.status === 'BOOKED';
              const isHeld = slot.status === 'HELD';

              return (
                <div
                  key={slot.startTime}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isBlocked
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : isBooked
                      ? 'bg-slate-900/60 border-slate-800'
                      : isHeld
                      ? 'bg-amber-950/30 border-amber-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-pitch-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-black text-white font-mono">{slot.startTime}</span>
                      <p className="text-[11px] text-slate-400">{slot.label}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isAvailable
                          ? 'bg-pitch-950 text-pitch-400 border border-pitch-800'
                          : isBlocked
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : isBooked
                          ? 'bg-red-950 text-red-400 border border-red-900'
                          : 'bg-amber-900 text-amber-300'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  {/* Slot Details info */}
                  <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800/80">
                    {isBlocked ? (
                      <p className="text-amber-300 font-semibold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        {slot.blockReason || 'Maintenance'}
                      </p>
                    ) : isBooked ? (
                      <p className="text-slate-400">
                        Booked Ref: <strong className="text-white font-mono">{slot.bookingId}</strong>
                      </p>
                    ) : isHeld ? (
                      <p className="text-amber-400 animate-pulse">
                        Holding by {slot.heldByCustomer || 'Player'} ({slot.holdRemainingSeconds}s)
                      </p>
                    ) : (
                      <div className="flex justify-between text-xs">
                        <span>Price: <strong className="text-white">₹{slot.price}</strong></span>
                        <span className="text-pitch-400">Adv: ₹{slot.advanceAmount}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {isAvailable && (
                      <button
                        onClick={() => setBlockModalSlot(slot)}
                        className="w-full py-1.5 px-3 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 transition flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Block Slot
                      </button>
                    )}
                    {isBlocked && (
                      <button
                        onClick={() => handleUnblockSlot(slot.blockedId)}
                        className="w-full py-1.5 px-3 bg-pitch-950 hover:bg-pitch-900 text-pitch-400 text-xs font-bold rounded-xl border border-pitch-800 transition flex items-center justify-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Unblock Slot
                      </button>
                    )}
                    {isBooked && (
                      <span className="block text-center text-[10px] text-slate-500 py-1">
                        Reserved for match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Slot Modal */}
      {blockModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card max-w-md w-full p-6 space-y-4 border-amber-500/30 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Block Slot ({blockModalSlot.label})</h3>
              </div>
              <button
                onClick={() => setBlockModalSlot(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBlockSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Blocking
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Maintenance">Maintenance & Grass Brushing</option>
                  <option value="Private Tournament">Private League Tournament</option>
                  <option value="Turf Owner Booking">Turf Owner / Management Match</option>
                  <option value="Weather / Rain">Heavy Rain / Weather Disruption</option>
                  <option value="Emergency Repair">Emergency Light / Net Repair</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Floodlight angle adjustment"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockModalSlot(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlotsPage;
