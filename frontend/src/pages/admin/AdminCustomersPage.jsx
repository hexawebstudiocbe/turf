import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Users, Search, Phone, MessageSquare, Calendar, Award } from 'lucide-react';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getCustomers();
        if (res.success && res.data) {
          setCustomers(res.data.customers || []);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            CUSTOMER CRM
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">Player Directory & Lifetime Value</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search players by Name, Mobile, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-xs py-2.5"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading customer CRM data...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Total Bookings</th>
                  <th className="p-4">Completed Matches</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Last Match</th>
                  <th className="p-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <span className="text-[10px] text-slate-500">
                        Joined {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-mono font-semibold text-slate-200">{c.phone}</p>
                      <p className="text-[11px] text-slate-400">{c.email}</p>
                    </td>

                    <td className="p-4 font-bold text-white">{c.totalBookings || 0}</td>

                    <td className="p-4 font-bold text-pitch-400">{c.completedBookings || 0}</td>

                    <td className="p-4 font-black text-amber-400 text-sm font-mono">
                      ₹{c.totalPaid || 0}
                    </td>

                    <td className="p-4 text-slate-300">
                      {c.lastBooking || '—'}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`https://wa.me/${c.phone?.replace(/[^0-9]/g, '')}?text=Hi%20${c.name},%20greetings%20from%20Arena%20Sports%20Turf!`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-emerald-950 text-emerald-400 hover:bg-emerald-900 rounded-lg border border-emerald-800 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
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

export default AdminCustomersPage;
