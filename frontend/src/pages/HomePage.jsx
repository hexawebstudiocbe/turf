import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTurf } from '../context/TurfContext';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Award,
  Zap,
  CheckCircle,
  Users,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const HomePage = () => {
  const { turf, reviews, averageRating, totalReviews, loading } = useTurf();
  const [selectedSport, setSelectedSport] = useState('football');

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
        {/* Background Turf Image with dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              turf?.gallery?.[0]?.url ||
              'https://images.unsplash.com/photo-1529900240041-22f1ad31846c?auto=format&fit=crop&w=1600&q=80'
            }
            alt="Arena Sports Turf"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pitch-950/80 border border-pitch-500/40 text-pitch-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg shadow-pitch-950/50 animate-bounce-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-pitch-400 animate-ping" />
            <span>Coimbatore's #1 FIFA-Grade 50mm Sports Turf</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] font-display">
            PLAY LIKE A PRO ON <br />
            <span className="bg-gradient-to-r from-pitch-400 via-emerald-300 to-pitch-500 bg-clip-text text-transparent">
              {turf?.name?.toUpperCase() || 'ARENA SPORTS TURF'}
            </span>
          </h1>

          {/* Tagline & Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed">
            {turf?.tagline ||
              'Experience championship-grade football and box cricket under stadium floodlights. Real-time online booking with instant QR pass.'}
          </p>

          {/* Rating & Fast Specs */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{averageRating}</span>
              <span className="text-slate-400">({totalReviews || 35}+ verified reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md">
              <Clock className="w-4 h-4 text-pitch-400" />
              <span>
                Open: {turf?.openingTime || '06:00 AM'} - {turf?.closingTime || '11:00 PM'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{turf?.advanceValue || 30}% Online Advance</span>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/book"
              className="btn-primary w-full sm:w-auto text-base sm:text-lg px-8 py-4 shadow-xl shadow-pitch-900/50 group"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Book Your Slot Online</span>
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={`https://wa.me/${turf?.whatsappNumber || '919876543210'}?text=Hi%20Arena%20Turf,%20I%20want%20to%20book%20a%20slot`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full sm:w-auto text-base px-6 py-4 flex items-center justify-center gap-2 hover:border-emerald-500/50 hover:text-emerald-400"
            >
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>WhatsApp Inquiries</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. SPORTS SELECTION & PITCH SPECS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
            Engineered for Athletes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Built For Multi-Sport Action
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Choose your sport and experience professional grade turf with FIFA-standard shock absorption.
          </p>

          {/* Sport Toggle Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 gap-2 mt-4">
            <button
              onClick={() => setSelectedSport('football')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedSport === 'football'
                  ? 'bg-gradient-to-r from-pitch-600 to-pitch-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚽ Football (5v5 & 7v7)
            </button>
            <button
              onClick={() => setSelectedSport('cricket')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedSport === 'cricket'
                  ? 'bg-gradient-to-r from-pitch-600 to-pitch-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏏 Box Cricket
            </button>
          </div>
        </div>

        {/* Sport Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">
              {selectedSport === 'football'
                ? 'High-Performance 50mm Football Pitch'
                : 'All-Weather Box Cricket Arena with Safety Enclosures'}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {selectedSport === 'football'
                ? 'Our imported monofilament 50mm grass with rubber and silica infill guarantees natural ball roll, true bounce, and reduced strain on knees and ankles. Perfect for 5-a-side matches, 7-a-side friendlies, and weekend tournaments.'
                : 'Custom-designed box cricket court with seamless boundary perimeter netting, heavy-duty pitch matting for authentic bounce, and ultra-high roof nets for fearless six-hitting.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium uppercase">Turf Pile Height</p>
                <p className="text-xl font-bold text-pitch-400">50mm Monofilament</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium uppercase">Lighting</p>
                <p className="text-xl font-bold text-white">High-Mast LEDs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium uppercase">Shock Absorption</p>
                <p className="text-xl font-bold text-white">EPDM Rubber Infill</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium uppercase">Slot Duration</p>
                <p className="text-xl font-bold text-pitch-400">60 Minutes / Slot</p>
              </div>
            </div>

            <Link to="/book" className="btn-primary text-sm py-3 px-6">
              Check Slot Availability
            </Link>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
            <img
              src={
                selectedSport === 'football'
                  ? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80'
                  : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'
              }
              alt={selectedSport}
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80">
              <p className="text-sm font-bold text-white">
                {selectedSport === 'football' ? 'Championship Football Turf' : 'Box Cricket Pitch with Nets'}
              </p>
              <p className="text-xs text-slate-400">Pro match balls and team bibs provided complimentary on every booking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACILITIES & AMENITIES */}
      <section id="facilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
            World-Class Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Turf Facilities & Amenities
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Everything you and your teammates need for an unforgettable match experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(
            turf?.amenities || [
              'FIFA-Approved 50mm Turf',
              'Professional Anti-Glare LED Floodlights',
              'AC Changing Rooms & Showers',
              'Clean & Hygienic Restrooms',
              'Purified RO Drinking Water',
              'Covered Spectator Gallery',
              'Spacious Car & Bike Parking',
              'Pro Match Balls & Bibs Included',
              'First Aid & Emergency Ice Bags',
            ]
          ).map((amenity, index) => (
            <div
              key={index}
              className="glass-card p-6 flex items-start gap-4 hover:border-pitch-500/50 hover:bg-slate-900/90 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-pitch-500/10 text-pitch-400 border border-pitch-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-pitch-500 group-hover:text-white transition-all">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-pitch-300 transition-colors">
                  {amenity}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Maintained daily with sanitized equipment and hygienic premises.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIVE PRICING & TIMING PREVIEW */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 lg:p-12 relative overflow-hidden border-pitch-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Col Info */}
            <div className="lg:col-span-1 space-y-4">
              <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
                Transparent Pricing
              </span>
              <h3 className="text-3xl font-black text-white font-display">
                Dynamic Time-Based Rates
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Book early morning slots to save big, or enjoy prime floodlit night football. Pay only{' '}
                <strong className="text-pitch-400">{turf?.advanceValue || 30}% advance</strong> online to lock your
                slot instantly.
              </p>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free 100% refund up to 24 hours before match</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Remaining balance payable via UPI/Cash at turf</span>
                </div>
              </div>
              <Link to="/book" className="btn-primary w-full text-center py-3.5">
                Proceed to Book a Slot
              </Link>
            </div>

            {/* Right Col Pricing Tiers */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 hover:border-pitch-500/40 transition">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-pitch-400 bg-pitch-950 px-2.5 py-1 rounded-full border border-pitch-800">
                    Morning Saver
                  </span>
                  <span className="text-xl font-black text-white font-display">₹600<span className="text-xs text-slate-400 font-normal">/hr</span></span>
                </div>
                <p className="text-xs text-slate-400">06:00 AM – 12:00 PM (Mon to Fri)</p>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  Advance: <strong className="text-pitch-400">₹180</strong> • Balance: ₹420
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 hover:border-pitch-500/40 transition">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-full border border-blue-800">
                    Afternoon Play
                  </span>
                  <span className="text-xl font-black text-white font-display">₹700<span className="text-xs text-slate-400 font-normal">/hr</span></span>
                </div>
                <p className="text-xs text-slate-400">12:00 PM – 05:00 PM (All Days)</p>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  Advance: <strong className="text-pitch-400">₹210</strong> • Balance: ₹490
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-pitch-500/40 space-y-3 shadow-lg shadow-pitch-950/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">
                    Prime Floodlights
                  </span>
                  <span className="text-xl font-black text-white font-display">₹900<span className="text-xs text-slate-400 font-normal">/hr</span></span>
                </div>
                <p className="text-xs text-slate-400">05:00 PM – 10:00 PM (Weekday Evenings)</p>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  Advance: <strong className="text-pitch-400">₹270</strong> • Balance: ₹630
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 hover:border-pitch-500/40 transition">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded-full border border-purple-800">
                    Weekend Prime
                  </span>
                  <span className="text-xl font-black text-white font-display">₹1,000<span className="text-xs text-slate-400 font-normal">/hr</span></span>
                </div>
                <p className="text-xs text-slate-400">05:00 PM – 11:00 PM (Saturday & Sunday)</p>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  Advance: <strong className="text-pitch-400">₹300</strong> • Balance: ₹700
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GALLERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
            Visual Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Turf Photo Gallery
          </h2>
          <p className="text-sm text-slate-400">Take a look inside Coimbatore’s cleanest sports facility.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            turf?.gallery || [
              {
                url: 'https://images.unsplash.com/photo-1529900240041-22f1ad31846c?auto=format&fit=crop&w=800&q=80',
                caption: 'Stadium Grade Floodlit Arena',
              },
              {
                url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
                caption: '50mm Shock Absorbing Artificial Pile',
              },
              {
                url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                caption: 'Perimeter Safety Nets for Box Cricket',
              },
              {
                url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80',
                caption: 'AC Locker Rooms & Showers',
              },
            ]
          ).map((img, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden group h-64 border border-slate-800">
              <img
                src={img.url}
                alt={img.caption || 'Turf photo'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <p className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white truncate">
                {img.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
            Player Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Loved By Coimbatore's Footballers & Cricketers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(
            reviews || [
              {
                customerName: 'Rahul Sharma',
                rating: 5,
                comment:
                  'Fantastic turf quality! The ball rolls smoothly and the lighting is great even for late night matches. Booking online and paying advance was super seamless.',
              },
              {
                customerName: 'Karthik Raja',
                rating: 5,
                comment:
                  'Best turf in Coimbatore for 5v5 football and box cricket. Clean locker rooms, purified cold water, and very friendly management.',
              },
              {
                customerName: 'Vignesh P.',
                rating: 5,
                comment:
                  'Very well maintained pitch with thick 50mm grass. Doesn’t hurt the knees when diving. The instant QR code pass on phone is very convenient!',
              },
            ]
          ).map((review, i) => (
            <div key={i} className="glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating || 5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">"{review.comment}"</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                <span className="font-bold text-white">{review.customerName}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified Match
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LOCATION, MAP & CONTACT SECTION */}
      <section id="location" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 lg:p-10 border-pitch-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Address & Quick Contacts */}
            <div className="space-y-6">
              <div>
                <span className="pitch-badge bg-pitch-950 text-pitch-400 border border-pitch-800">
                  Easy Access Location
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">
                  Visit Arena Sports Turf
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Centrally located in Coimbatore with hassle-free four-wheeler and two-wheeler parking.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <MapPin className="w-5 h-5 text-pitch-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-white">{turf?.name || 'Arena Sports Turf'}</p>
                    <p className="text-slate-400">{turf?.address || '124, Avinashi Road, Near Fun Republic Mall'}</p>
                    <p className="text-slate-400">
                      {turf?.city || 'Coimbatore'}, {turf?.state || 'Tamil Nadu'} - 641004
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <Clock className="w-5 h-5 text-pitch-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Match Operating Hours</p>
                    <p className="text-xs text-slate-400">
                      Open daily from {turf?.openingTime || '06:00 AM'} to {turf?.closingTime || '11:00 PM'} (Monday – Sunday)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={turf?.googleMapsUrl || 'https://maps.google.com/?q=11.0283,77.0041'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs py-3 px-5 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
                <a
                  href={`tel:${turf?.contactPhone || '+919876543210'}`}
                  className="btn-secondary text-xs py-3 px-5 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-pitch-400" />
                  Call Management
                </a>
              </div>
            </div>

            {/* Embedded Google Maps View */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 h-72 sm:h-80 shadow-2xl relative">
              <iframe
                title="Turf Location Map"
                src="https://maps.google.com/maps?q=Coimbatore,Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
