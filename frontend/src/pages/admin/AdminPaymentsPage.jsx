import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { CreditCard, CheckCircle2, XCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPayments();
      if (res.success && res.data) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to load payments ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            FINANCIAL AUDIT
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">Razorpay Payment Ledger</h1>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Refresh Ledger"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading payment audit log...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No payment transaction logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Payment & Order ID</th>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4">
                      <p className="font-mono font-bold text-slate-200">{p.razorpayPaymentId || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Order: {p.razorpayOrderId}</p>
                    </td>

                    <td className="p-4 font-mono font-bold text-amber-400">
                      {p.bookingId?.bookingId || 'TB-REF'}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-white">
                        {p.userId?.name || p.bookingId?.customerDetails?.name || 'Customer'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.userId?.phone || p.bookingId?.customerDetails?.phone}
                      </p>
                    </td>

                    <td className="p-4 font-black text-pitch-400 text-sm font-mono">
                      ₹{p.amount}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          p.status === 'SUCCESS'
                            ? 'bg-pitch-950 text-pitch-400 border border-pitch-800'
                            : p.status === 'REFUNDED'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-red-950 text-red-400 border border-red-900'
                        }`}
                      >
                        {p.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleString()}
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

export default AdminPaymentsPage;
