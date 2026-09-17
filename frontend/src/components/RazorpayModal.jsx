import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, CreditCard, Smartphone, Clock, Sparkles } from 'lucide-react';
import { bookingApi } from '../api/bookingApi';

const RazorpayModal = ({
  holdData,
  onPaymentSuccess,
  onPaymentFailure,
  onClose,
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!holdData) return null;

  const {
    bookingId,
    orderId,
    totalAmount,
    advanceAmount,
    remainingAmount,
    holdExpiresAt,
    isMockPayment,
    keyId,
    customerDetails,
  } = holdData;

  // Real Razorpay Standard Checkout Flow
  const handleRealRazorpay = () => {
    if (!window.Razorpay) {
      setError('Razorpay SDK failed to load. Please check internet connection.');
      return;
    }

    setProcessing(true);
    setError(null);

    const options = {
      key: keyId,
      amount: Math.round(advanceAmount * 100),
      currency: 'INR',
      name: 'Arena Sports Turf',
      description: `Advance Payment for Slot (${bookingId})`,
      order_id: orderId,
      prefill: {
        name: customerDetails?.name || '',
        email: customerDetails?.email || '',
        contact: customerDetails?.phone || '',
      },
      theme: {
        color: '#10b981',
      },
      handler: async (response) => {
        try {
          const verifyRes = await bookingApi.confirmPayment({
            razorpayOrderId: response.razorpay_order_id || orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyRes.success && verifyRes.data?.booking) {
            onPaymentSuccess(verifyRes.data.booking);
          } else {
            throw new Error(verifyRes.message || 'Payment verification failed');
          }
        } catch (err) {
          setError(err.message || 'Verification failed');
          onPaymentFailure(err.message);
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment was unsuccessful');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.warn('Razorpay SDK error, falling back to simulator', err);
      // If popup fails or is mock, allow simulator
    }
  };

  // Test Simulator Success handler
  const handleSimulateSuccess = async () => {
    setProcessing(true);
    setError(null);
    try {
      const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const mockSignature = `mock_sig_${Date.now()}`;

      const verifyRes = await bookingApi.confirmPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
      });

      if (verifyRes.success && verifyRes.data?.booking) {
        onPaymentSuccess(verifyRes.data.booking);
      } else {
        throw new Error(verifyRes.message || 'Payment confirmation failed');
      }
    } catch (err) {
      setError(err.message);
      onPaymentFailure(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Test Simulator Failure handler
  const handleSimulateFailure = () => {
    setError('Payment cancelled / failed in test mode');
    onPaymentFailure('Customer cancelled transaction');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 relative border-pitch-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pitch-500/20 text-pitch-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Razorpay Secure Payment</h3>
              <p className="text-xs text-slate-400">Booking Ref: {bookingId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Hold Alert */}
        <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>Slot is temporarily held for 10 minutes. Complete advance to confirm.</span>
        </div>

        {/* Payment Breakdown Card */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-2.5 my-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Total Slot Price</span>
            <span className="font-semibold text-slate-200">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-xs text-pitch-400 font-medium">
            <span>Advance to Pay Online Now</span>
            <span className="font-bold text-sm">₹{advanceAmount}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Remaining Balance (at Turf)</span>
            <span className="font-semibold text-amber-400">₹{remainingAmount}</span>
          </div>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* If Razorpay key is configured & not placeholder, show real checkout button */}
          {keyId && keyId !== 'rzp_test_placeholder' && !keyId.startsWith('mock_') ? (
            <button
              onClick={handleRealRazorpay}
              disabled={processing}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-pitch-900/50"
            >
              <CreditCard className="w-4 h-4" />
              {processing ? 'Processing Gateway...' : `Pay ₹${advanceAmount} via Razorpay`}
            </button>
          ) : (
            <>
              <div className="text-center pb-1">
                <span className="text-[11px] font-semibold text-pitch-400 uppercase tracking-wider bg-pitch-950 px-2.5 py-0.5 rounded-full border border-pitch-800">
                  ⚡ Test Mode Simulator
                </span>
              </div>
              <button
                onClick={handleSimulateSuccess}
                disabled={processing}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {processing ? 'Verifying Payment...' : `Simulate Successful Advance (₹${advanceAmount})`}
              </button>
              <button
                onClick={handleSimulateFailure}
                disabled={processing}
                className="btn-secondary w-full py-2.5 text-xs text-slate-400 hover:text-red-400 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Simulate Payment Failure / Cancel
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              256-bit SSL Encrypted • Instant QR Match Pass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
