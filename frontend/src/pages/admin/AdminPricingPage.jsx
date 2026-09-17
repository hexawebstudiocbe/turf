import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useTurf } from '../../context/TurfContext';
import { DollarSign, Shield, Plus, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const AdminPricingPage = () => {
  const { refreshTurf } = useTurf();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState(800);
  const [advanceType, setAdvanceType] = useState('percentage');
  const [advanceValue, setAdvanceValue] = useState(30);
  const [freeCancellationHours, setFreeCancellationHours] = useState(24);
  const [refundPercentage, setRefundPercentage] = useState(100);
  const [rules, setRules] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getPricingConfig();
        if (res.success && res.data) {
          setDefaultPrice(res.data.defaultPrice || 800);
          setAdvanceType(res.data.advanceType || 'percentage');
          setAdvanceValue(res.data.advanceValue || 30);
          if (res.data.cancellationPolicy) {
            setFreeCancellationHours(res.data.cancellationPolicy.freeCancellationHours || 24);
            setRefundPercentage(res.data.cancellationPolicy.refundPercentage || 100);
          }
          setRules(res.data.rules || []);
        }
      } catch (err) {
        console.error('Failed to load pricing config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        name: 'New Custom Tier',
        startTime: '17:00',
        endTime: '22:00',
        price: 900,
        daysOfWeek: [],
        priority: 2,
        isActive: true,
      },
    ]);
  };

  const handleRuleChange = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;
    setRules(updated);
  };

  const handleRemoveRule = (index) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionMessage(null);

    try {
      const payload = {
        defaultPrice: Number(defaultPrice),
        advanceType,
        advanceValue: Number(advanceValue),
        cancellationPolicy: {
          freeCancellationHours: Number(freeCancellationHours),
          refundPercentage: Number(refundPercentage),
          policyText: `${refundPercentage}% refund available if cancelled at least ${freeCancellationHours} hours prior.`,
        },
        rules,
      };

      const res = await adminApi.updatePricingConfig(payload);
      if (res.success) {
        setActionMessage('Pricing and Advance Payment rules updated successfully!');
        refreshTurf();
      }
    } catch (err) {
      setActionMessage(err.message || 'Failed to save pricing configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            FINANCIAL RULES
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">Pricing & Advance Policy</h1>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="btn-primary text-xs py-3 px-6 flex items-center gap-2 shadow-lg shadow-pitch-900/50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save All Pricing Rules'}
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-pitch-950 border border-pitch-500/40 text-xs text-pitch-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading pricing rules...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="space-y-8">
          {/* Base Rates & Advance Type Card */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Standard Slot Rate & Online Advance Deposit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Base Price (₹ / Hour)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  className="input-field text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advance Payment Type
                </label>
                <select
                  value={advanceType}
                  onChange={(e) => setAdvanceType(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="percentage">Percentage (%) of Total</option>
                  <option value="fixed">Fixed Amount (₹ INR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advance Value {advanceType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={advanceType === 'percentage' ? 100 : 5000}
                  value={advanceValue}
                  onChange={(e) => setAdvanceValue(e.target.value)}
                  className="input-field text-sm font-mono"
                />
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="p-4 rounded-xl bg-pitch-950/40 border border-pitch-500/30 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-slate-300">
                Example Slot Rate: <strong className="text-white">₹{defaultPrice}</strong>
              </span>
              <span className="text-pitch-400">
                Customer Pays Online Now:{' '}
                <strong className="text-sm font-bold">
                  ₹
                  {advanceType === 'percentage'
                    ? Math.round((defaultPrice * advanceValue) / 100)
                    : Math.min(advanceValue, defaultPrice)}
                </strong>
              </span>
              <span className="text-amber-400">
                Remaining Balance at Turf:{' '}
                <strong className="text-sm font-bold">
                  ₹
                  {defaultPrice -
                    (advanceType === 'percentage'
                      ? Math.round((defaultPrice * advanceValue) / 100)
                      : Math.min(advanceValue, defaultPrice))}
                </strong>
              </span>
            </div>
          </div>

          {/* Time-Based & Weekend Dynamic Rules Card */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Time-Slot & Day-Based Dynamic Overrides</h3>
                <p className="text-xs text-slate-400">
                  Configure specific peak hours (e.g. Floodlit evenings or Weekend morning/night games)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-pitch-400" />
                Add Pricing Rule
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center gap-4 text-xs"
                >
                  <div className="w-full md:w-1/4">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Tier Name</label>
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => handleRuleChange(idx, 'name', e.target.value)}
                      className="input-field text-xs py-2 mt-1"
                    />
                  </div>

                  <div className="w-full md:w-1/6">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Start Time</label>
                    <input
                      type="time"
                      value={rule.startTime}
                      onChange={(e) => handleRuleChange(idx, 'startTime', e.target.value)}
                      className="input-field text-xs py-2 mt-1"
                    />
                  </div>

                  <div className="w-full md:w-1/6">
                    <label className="text-[10px] uppercase font-bold text-slate-500">End Time</label>
                    <input
                      type="time"
                      value={rule.endTime}
                      onChange={(e) => handleRuleChange(idx, 'endTime', e.target.value)}
                      className="input-field text-xs py-2 mt-1"
                    />
                  </div>

                  <div className="w-full md:w-1/6">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Slot Price (₹)</label>
                    <input
                      type="number"
                      value={rule.price}
                      onChange={(e) => handleRuleChange(idx, 'price', e.target.value)}
                      className="input-field text-xs py-2 mt-1 font-mono font-bold text-pitch-400"
                    />
                  </div>

                  <div className="w-full md:w-auto flex items-center justify-end gap-2 pt-2 md:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy Card */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-pitch-400" />
              Customer Cancellation & Refund Policy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Free Cancellation Cutoff (Hours Before Match)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={freeCancellationHours}
                  onChange={(e) => setFreeCancellationHours(e.target.value)}
                  className="input-field text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Refund Percentage Eligible (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={refundPercentage}
                  onChange={(e) => setRefundPercentage(e.target.value)}
                  className="input-field text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminPricingPage;
