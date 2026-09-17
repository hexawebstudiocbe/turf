import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle, Share2, Printer, AlertTriangle, Layers } from 'lucide-react';

const PassCard = ({ booking, turf }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `⚽ My Turf Match Booking Confirmed!\n\n🏢 Turf: ${turf?.name || 'Arena Sports Turf'}\n📅 Date: ${booking.date}\n⏰ Time: ${booking.startTime} - ${booking.endTime} (${booking.durationHours || 1} Hours)\n🎟️ Booking ID: ${booking.bookingId}\n💳 Balance Due at Turf: ₹${booking.remainingAmount}\n📍 Location: ${turf?.address || 'Avinashi Road, Coimbatore'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-md mx-auto print:max-w-none">
      {/* The Ticket Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-pitch-500/40 shadow-2xl shadow-pitch-950/50">
        {/* Top Pitch Green Banner */}
        <div className="bg-gradient-to-r from-pitch-700 via-pitch-600 to-pitch-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-pitch-100">
                Official Match Pass
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-pitch-900 shadow">
              {booking.bookingStatus}
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight mt-2 font-display">{turf?.name || 'Arena Sports Turf'}</h2>
          <p className="text-xs text-pitch-100 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {turf?.city || 'Coimbatore'}, {turf?.state || 'Tamil Nadu'}
          </p>
        </div>

        {/* Middle Details Grid */}
        <div className="p-6 space-y-5">
          {/* Booking ID & Sport */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Booking ID</p>
              <p className="text-base font-black text-pitch-400 font-mono tracking-tight">{booking.bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sport</p>
              <p className="text-sm font-bold text-white">{booking.sport || 'Football'}</p>
            </div>
          </div>

          {/* Date & Time Slot & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-pitch-400" />
                Match Date
              </div>
              <p className="text-sm font-bold text-white">{booking.date}</p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-pitch-400" />
                Timing & Duration
              </div>
              <p className="text-sm font-bold text-white">
                {booking.startTime} - {booking.endTime}
              </p>
              <p className="text-[10px] text-pitch-400 font-semibold">
                {booking.durationHours || 1} {booking.durationHours === 1 ? 'Hour' : 'Hours'}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Booked By</p>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{booking.customerDetails?.name}</span>
              <span className="text-slate-400 font-mono">{booking.customerDetails?.phone}</span>
            </div>
          </div>

          {/* Scannable QR Code */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-pitch-500/20 flex flex-col items-center justify-center text-center">
            <div className="p-2.5 bg-white rounded-xl shadow-inner mb-2">
              <QRCodeSVG
                value={booking.qrVerificationToken || booking.bookingId}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[11px] font-mono text-slate-400">Scan at turf entrance for quick check-in</p>
          </div>

          {/* Payment & Balance Alert */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Total Slot Value:</span>
              <span className="font-bold text-slate-200">₹{booking.totalAmount}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-pitch-400 font-semibold">
              <span>Advance Paid Online:</span>
              <span>₹{booking.advanceAmount}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 pt-1.5 border-t border-amber-500/20">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Remaining Balance (Pay at Turf):
              </span>
              <span className="text-sm font-black">₹{booking.remainingAmount}</span>
            </div>
          </div>
        </div>

        {/* Perforated ticket edge styling */}
        <div className="relative flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-dashed border-slate-800 text-[11px] text-slate-500">
          <div className="w-4 h-4 rounded-full bg-[#0b0f19] absolute -left-2 -top-2 border-r border-slate-800" />
          <div className="w-4 h-4 rounded-full bg-[#0b0f19] absolute -right-2 -top-2 border-l border-slate-800" />
          <span>Non-transferable match pass</span>
          <span>Help: {turf?.contactPhone || '+91 98765 43210'}</span>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
        <button
          onClick={handleShareWhatsApp}
          className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-2 hover:border-emerald-500/50 hover:text-emerald-400"
        >
          <Share2 className="w-4 h-4 text-emerald-500" />
          Share Pass
        </button>
        <button
          onClick={handlePrint}
          className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-2 hover:border-pitch-500/50 hover:text-pitch-400"
        >
          <Printer className="w-4 h-4 text-pitch-500" />
          Print / Save PDF
        </button>
      </div>
    </div>
  );
};

export default PassCard;
