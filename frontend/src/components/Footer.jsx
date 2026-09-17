import React from 'react';
import { Link } from 'react-router-dom';
import { useTurf } from '../context/TurfContext';
import { MapPin, Phone, MessageSquare, Clock, Shield, Award, Heart } from 'lucide-react';

const Footer = () => {
  const { turf } = useTurf();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center text-white shadow-lg shadow-pitch-900/40">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-white font-display">
                Turf<span className="text-pitch-400">Book</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {turf?.tagline || 'Coimbatore’s Premier FIFA-Grade Artificial Turf for Football and Box Cricket.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pitch-950 text-pitch-400 border border-pitch-800">
                <Award className="w-3.5 h-3.5" /> FIFA 50mm Pile
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Shield className="w-3.5 h-3.5" /> Pro Floodlights
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-pitch-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-pitch-400 transition">
                  Book Slot Online
                </Link>
              </li>
              <li>
                <a href="/#facilities" className="hover:text-pitch-400 transition">
                  Turf Facilities & Specs
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-pitch-400 transition">
                  Pricing & Timing Rules
                </a>
              </li>
              <li>
                <a href="/#location" className="hover:text-pitch-400 transition">
                  Location & Driving Map
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 text-slate-500 transition">
                  Turf Owner Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Hours & Sports */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Timings & Sports</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-pitch-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">Daily Operating Hours</p>
                  <p className="text-xs text-slate-400">
                    {turf?.openingTime || '06:00 AM'} to {turf?.closingTime || '11:00 PM'} (All 7 Days)
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Available Sports</p>
                <div className="flex flex-wrap gap-1.5">
                  {(turf?.sports || ['Football 5v5', 'Box Cricket', 'Badminton']).map((sport, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Turf Location</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pitch-500 mt-0.5 shrink-0" />
                <p className="text-slate-300">
                  {turf?.name || 'Arena Sports Turf'}, {turf?.address || '124, Avinashi Road, Peelamedu'}, {turf?.city || 'Coimbatore'} - 641004.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pitch-500 shrink-0" />
                <a href={`tel:${turf?.contactPhone}`} className="hover:text-pitch-400 text-slate-300 transition">
                  {turf?.contactPhone || '+91 98765 43210'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <a
                  href={`https://wa.me/${turf?.whatsappNumber || '919876543210'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 text-slate-300 transition"
                >
                  WhatsApp: {turf?.whatsappNumber || '+91 98765 43210'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {turf?.name || 'Arena Sports Turf'} • Powered by TurfBook Engine.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Sports Players
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
