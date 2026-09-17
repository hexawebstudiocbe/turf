# TurfBook — Production-Ready Single Turf Sports Booking Platform

TurfBook is a complete, production-grade, single-turf online sports booking website and administrative management portal. It features real-time slot availability generation, server-calculated dynamic pricing, concurrency-safe double-booking prevention, Razorpay advance payments, instant scannable QR match passes, and an executive owner dashboard.

---

## 🌟 Key Features

### ⚽ Customer Experience
- **Dynamic Sports Showcase**: FIFA-approved 50mm artificial grass pitch specifications for 5v5/7v7 Football, Box Cricket, and Badminton.
- **14-Day Quick Date Ribbon**: High-speed interactive date picker with mobile-optimized touch scroll.
- **Live Slot Engine**: Real-time slot status indicators (`AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`, `PAST`).
- **Server-Side Pricing**: Peak hours, morning saver discounts, and weekend surcharges calculated strictly on the backend.
- **Razorpay Advance Payments**: Pay configured advance (e.g. 30% or fixed ₹) securely via Razorpay standard checkout.
- **Dual-Mode Simulator**: Built-in payment simulator for headless testing without live merchant keys.
- **Instant QR Match Pass**: Cryptographically signed QR code pass with match countdown and balance due reminder.
- **Customer Portal**: History of previous and upcoming matches with self-service cancellation and policy-based refund estimation.

### 🛡️ Owner & Admin Management (`/admin`)
- **Executive Analytics Dashboard**: Today's bookings, advance revenue, pitch occupancy rate, and pending balance to collect on-site.
- **Live Pitch Schedule & Slot Blocker**: 1-click slot blocker for maintenance, private events, turf owner matches, or rain.
- **Dynamic Pricing Engine**: Configure base rates, advance percentage/fixed amounts, time-slot tiers (e.g. morning/night floodlights), and weekend multipliers.
- **Turf Profile Manager**: Modify turf name, address, Google Maps link, sports, amenities checklist, and photo gallery.
- **Customer CRM**: Player database with lifetime bookings, completed matches, and total spend.
- **Payment Ledger**: Complete transaction audit log with Razorpay order and payment IDs.

---

## 🏗️ Architecture & Concurrency Strategy

```
                          ┌────────────────────────┐
                          │     Customer Browser   │
                          │   React 18 / Tailwind  │
                          └───────────┬────────────┘
                                      │ HTTPS / REST / JWT
                                      ▼
                          ┌────────────────────────┐
                          │   Express API Server   │
                          │ - Concurrency Control  │
                          │ - Dynamic Pricing      │
                          │ - Razorpay HMAC SHA256 │
                          └───────┬────────┬───────┘
                                  │        │
                   MongoDB Atlas  │        │ Razorpay Webhook/SDK
                                  ▼        ▼
                      ┌───────────────┐  ┌──────────────────┐
                      │ MongoDB Cloud │  │ Razorpay Gateway │
                      └───────────────┘  └──────────────────┘
```

### 🔒 Zero Double-Booking Guarantee
TurfBook prevents concurrent double bookings at the database level using a **MongoDB Compound Unique Partial Index**:
```javascript
bookingSchema.index(
  { turfId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: { $in: ['HELD', 'CONFIRMED', 'COMPLETED'] },
    },
  }
);
```
- **Simultaneous Booking Attempt**: If Customer A and Customer B attempt to reserve the exact same slot at the exact same millisecond, the database atomically grants the hold to the first request (`HTTP 201`) and rejects the second with a clean duplicate key collision (`HTTP 409 Conflict`).
- **10-Minute Hold Expiry**: Slots in `HELD` state automatically revert to `AVAILABLE` after 10 minutes if payment is abandoned.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local `mongod` or MongoDB Atlas URI)

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/turfbook
JWT_SECRET=your_jwt_secret_key_here

# Razorpay Keys (Leave placeholder for Simulator Mode)
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=dev_secret_key_12345

FRONTEND_URL=http://localhost:5173
```

### 3. Seed Database with Rich Demo Data
Populate the initial turf, admin, customers, pricing rules, reviews, and sample bookings:
```bash
cd backend
npm run seed
```
**Demo Admin Credentials:**
- **Email**: `admin@turfbook.com`
- **Password**: `AdminPassword123!`

**Demo Customer Credentials:**
- **Email**: `rahul@gmail.com`
- **Password**: `Customer123!`

### 4. Start Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
cd backend && npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend && npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

TurfBook includes automated test suites covering authentication, pricing rules, payment signature verification, and simultaneous concurrency race conditions:
```bash
cd backend
npm test
```

---

## ☁️ Cloud Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free M0 cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access (`0.0.0.0/0`).
3. Copy your connection string into `MONGODB_URI`.

### 2. Backend Deployment on Render
1. Create a **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `FRONTEND_URL`.

### 3. Frontend Deployment on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set **Root Directory**: `frontend`
3. Set **Framework Preset**: `Vite`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Set Environment Variable: `VITE_API_URL=https://your-backend-service.onrender.com/api`
7. Deploy!

---

## 📜 License
MIT License. Built for sports facilities and turf managers.
